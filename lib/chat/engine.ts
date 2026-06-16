import { anthropic, createAnthropic } from "@ai-sdk/anthropic";
import { stepCountIs, streamText, type ModelMessage, type ToolSet } from "ai";
import { consumeCredits, CREDIT_WEIGHTS } from "@/lib/billing";
import { getRunningTokenTotal, isOverTokenCap, MAX_STEPS } from "./caps";
import {
  insertPendingExecution,
  markConversationAbandoned,
  saveAssistantMessage,
  saveToolResultMessage,
} from "./conversations";
import { makeSseController, type SseController } from "./streaming";
import { assembleSystemPrompt } from "./systemPrompt";
import { buildToolSet } from "./tools";

const MODEL_ID = "claude-sonnet-4-6";

export type ChatTurnContext = {
  project: {
    id: string;
    baseUrl: string | null;
    systemPrompt: string | null;
    /** Decrypted BYOK Anthropic key, or null to use the platform key. */
    anthropicApiKey: string | null;
  };
  /** When true, usage is recorded but never deducted from the credit pool. */
  byok: boolean;
  conversationId: string;
  endUserId: string;
  endUserToken: string | null;
  endUserHeaders: Record<string, string> | null;
  history: ModelMessage[];
};

export type ChatTurnResult = {
  stream: ReadableStream<Uint8Array>;
  done: Promise<void>;
};

type CollectedToolCall = {
  toolCallId: string;
  toolName: string;
  input: unknown;
};

type CollectedToolResult = {
  toolCallId: string;
  output: unknown;
};

export function runChatTurn(ctx: ChatTurnContext): ChatTurnResult {
  const sse = makeSseController();
  const done = orchestrate(ctx, sse).catch((err) => {
    console.error("[chat/engine] orchestrate threw:", err);
    sse.send({ event: "error", data: { message: (err as Error).message } });
    sse.close();
  });
  return { stream: sse.stream, done };
}

const CACHE_CONTROL = {
  anthropic: { cacheControl: { type: "ephemeral" as const } },
};

function withCachePrefix(history: ModelMessage[]): ModelMessage[] {
  if (history.length < 2) return history;
  return history.map((msg, i) =>
    i === history.length - 2 ? { ...msg, providerOptions: CACHE_CONTROL } : msg,
  );
}

function withToolCaching(toolSet: ToolSet): ToolSet {
  const names = Object.keys(toolSet);
  if (names.length === 0) return toolSet;
  const lastName = names[names.length - 1];
  return {
    ...toolSet,
    [lastName]: { ...toolSet[lastName], providerOptions: CACHE_CONTROL },
  };
}

async function orchestrate(
  ctx: ChatTurnContext,
  sse: SseController,
): Promise<void> {
  const built = await buildToolSet({
    projectId: ctx.project.id,
    baseUrl: ctx.project.baseUrl,
    endUserToken: ctx.endUserToken,
    endUserHeaders: ctx.endUserHeaders,
    conversationId: ctx.conversationId,
  });

  const system = assembleSystemPrompt({
    projectSystemPrompt: ctx.project.systemPrompt,
    toolCount: built.meta.size,
  });

  let assistantText = "";
  const collectedToolCalls: CollectedToolCall[] = [];
  const collectedToolResults: CollectedToolResult[] = [];
  let aborted = false;

  const provider = ctx.project.anthropicApiKey
    ? createAnthropic({ apiKey: ctx.project.anthropicApiKey })
    : anthropic;

  const result = streamText({
    model: provider(MODEL_ID),
    system: { role: "system", content: system, providerOptions: CACHE_CONTROL },
    messages: withCachePrefix(ctx.history),
    tools: withToolCaching(built.toolSet),
    stopWhen: stepCountIs(MAX_STEPS),
    onFinish: async ({ totalUsage }) => {
      try {
        await consumeCredits(
          ctx.project.id,
          {
            type: "message",
            credits: CREDIT_WEIGHTS.message,
            conversationId: ctx.conversationId,
            tokensInput: totalUsage.inputTokens,
            tokensOutput: totalUsage.outputTokens,
            tokensCached: totalUsage.inputTokenDetails?.cacheReadTokens,
            model: MODEL_ID,
          },
          { byok: ctx.byok },
        );
        const total = await getRunningTokenTotal(ctx.conversationId);
        if (isOverTokenCap(total)) {
          await markConversationAbandoned(ctx.conversationId);
          sse.send({
            event: "error",
            data: {
              message: "conversation token cap reached",
              code: "token_cap",
            },
          });
        }
      } catch (err) {
        console.error("[chat/engine] onFinish failed:", err);
      }
    },
  });

  try {
    for await (const part of result.fullStream) {
      switch (part.type) {
        case "text-delta":
          assistantText += part.text;
          sse.send({ event: "text_delta", data: { delta: part.text } });
          break;

        case "tool-call": {
          const billed = await consumeCredits(
            ctx.project.id,
            {
              type: "tool_call",
              credits: CREDIT_WEIGHTS.tool_call,
              conversationId: ctx.conversationId,
            },
            { byok: ctx.byok },
          );
          if (!billed.ok) {
            sse.send({
              event: "error",
              data: { message: "credit cap reached", code: "hard_cap" },
            });
            aborted = true;
            break;
          }

          collectedToolCalls.push({
            toolCallId: part.toolCallId,
            toolName: part.toolName,
            input: part.input,
          });

          const meta = built.meta.get(part.toolName);
          if (meta?.type === "client_invocation") {
            await insertPendingExecution({
              conversationId: ctx.conversationId,
              toolId: meta.id,
              toolName: meta.name,
              toolCallId: part.toolCallId,
              input: part.input,
              toolVersion: meta.version,
            });
            sse.send({
              event: "action_call",
              data: {
                toolCallId: part.toolCallId,
                toolName: part.toolName,
                input: part.input,
                conversationId: ctx.conversationId,
              },
            });
            aborted = true; // Intentional pause — wait for /v1/execute-result
            break;
          }

          sse.send({
            event: "tool_call",
            data: {
              toolCallId: part.toolCallId,
              toolName: part.toolName,
              input: part.input,
            },
          });
          break;
        }

        case "tool-result":
          collectedToolResults.push({
            toolCallId: part.toolCallId,
            output: part.output,
          });
          sse.send({
            event: "tool_result",
            data: {
              toolCallId: part.toolCallId,
              toolName: part.toolName,
              output: part.output,
            },
          });
          break;

        case "tool-error":
          collectedToolResults.push({
            toolCallId: part.toolCallId,
            output: { error: String(part.error) },
          });
          sse.send({
            event: "tool_result",
            data: {
              toolCallId: part.toolCallId,
              toolName: part.toolName,
              output: { error: String(part.error) },
            },
          });
          break;

        case "error":
          sse.send({ event: "error", data: { message: String(part.error) } });
          aborted = true;
          break;
      }
      if (aborted) break;
    }

    if (assistantText || collectedToolCalls.length > 0) {
      await saveAssistantMessage(
        ctx.conversationId,
        assistantText,
        collectedToolCalls,
      );
    }

    // Persist results for server-executed (route) tools so the next turn's
    // history pairs each tool-call with its tool-result. Without this the SDK
    // throws AI_MissingToolResultsError on replay. Saved after the assistant
    // message so loadHistory (ordered by createdAt) keeps call-before-result
    // order. client_invocation results are saved later via /v1/execute-result.
    for (const r of collectedToolResults) {
      await saveToolResultMessage(ctx.conversationId, r.toolCallId, r.output);
    }

    sse.send({ event: "done", data: { conversationId: ctx.conversationId } });
  } catch (err) {
    // When we break early for a client_invocation, the AI SDK throws
    // AI_MissingToolResultsError because it sees an unresolved tool call.
    // That's expected — don't surface it as an error to the client.
    if (!aborted) {
      sse.send({ event: "error", data: { message: (err as Error).message } });
    }
  } finally {
    sse.close();
  }
}
