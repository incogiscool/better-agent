import { anthropic } from "@ai-sdk/anthropic";
import { stepCountIs, streamText, type ModelMessage } from "ai";
import { consumeCredits, CREDIT_WEIGHTS } from "@/lib/billing";
import {
  getRunningTokenTotal,
  isOverTokenCap,
  MAX_STEPS,
} from "./caps";
import {
  insertPendingExecution,
  markConversationAbandoned,
  saveAssistantMessage,
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
  };
  conversationId: string;
  endUserId: string;
  endUserToken: string | null;
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

export function runChatTurn(ctx: ChatTurnContext): ChatTurnResult {
  const sse = makeSseController();
  const done = orchestrate(ctx, sse).catch((err) => {
    console.error("[chat/engine] orchestrate threw:", err);
    sse.send({ event: "error", data: { message: (err as Error).message } });
    sse.close();
  });
  return { stream: sse.stream, done };
}

async function orchestrate(ctx: ChatTurnContext, sse: SseController): Promise<void> {
  const built = await buildToolSet({
    projectId: ctx.project.id,
    baseUrl: ctx.project.baseUrl,
    endUserToken: ctx.endUserToken,
    conversationId: ctx.conversationId,
  });

  const system = assembleSystemPrompt({
    projectSystemPrompt: ctx.project.systemPrompt,
    toolCount: built.meta.size,
  });

  let assistantText = "";
  const collectedToolCalls: CollectedToolCall[] = [];
  let aborted = false;

  const result = streamText({
    model: anthropic(MODEL_ID),
    system,
    messages: ctx.history,
    tools: built.toolSet,
    stopWhen: stepCountIs(MAX_STEPS),
    onFinish: async ({ totalUsage }) => {
      try {
        await consumeCredits(ctx.project.id, {
          type: "message",
          credits: CREDIT_WEIGHTS.message,
          conversationId: ctx.conversationId,
          tokensInput: totalUsage.inputTokens,
          tokensOutput: totalUsage.outputTokens,
          tokensCached: totalUsage.inputTokenDetails?.cacheReadTokens,
          model: MODEL_ID,
        });
        const total = await getRunningTokenTotal(ctx.conversationId);
        if (isOverTokenCap(total)) {
          await markConversationAbandoned(ctx.conversationId);
          sse.send({
            event: "error",
            data: { message: "conversation token cap reached", code: "token_cap" },
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
          const billed = await consumeCredits(ctx.project.id, {
            type: "tool_call",
            credits: CREDIT_WEIGHTS.tool_call,
            conversationId: ctx.conversationId,
          });
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
      await saveAssistantMessage(ctx.conversationId, assistantText, collectedToolCalls);
    }

    sse.send({ event: "done", data: { conversationId: ctx.conversationId } });
  } catch (err) {
    sse.send({ event: "error", data: { message: (err as Error).message } });
  } finally {
    sse.close();
  }
}
