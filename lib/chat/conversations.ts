import type { ModelMessage } from "ai";
import { prisma } from "@/lib/db";
import {
  ConversationStatus,
  MessageRole,
  ToolExecutionStatus,
} from "@/lib/generated/prisma/enums";

type ConversationSummary = {
  id: string;
  endUserId: string;
  status: ConversationStatus;
};

export async function loadConversationForProject(
  projectId: string,
  conversationId: string,
): Promise<ConversationSummary | null> {
  const conv = await prisma.conversation.findFirst({
    where: { id: conversationId, projectId },
    select: { id: true, endUserId: true, status: true },
  });
  return conv;
}

export async function createConversation(
  projectId: string,
  endUserId: string,
): Promise<{ id: string }> {
  return prisma.conversation.create({
    data: { projectId, endUserId, status: ConversationStatus.active },
    select: { id: true },
  });
}

type StoredToolCall = {
  toolCallId: string;
  toolName: string;
  input: unknown;
};

export async function loadHistory(conversationId: string): Promise<ModelMessage[]> {
  const rows = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    select: {
      role: true,
      content: true,
      toolCalls: true,
      toolCallId: true,
    },
  });

  const messages: ModelMessage[] = [];

  for (const row of rows) {
    if (row.role === MessageRole.system) continue;

    if (row.role === MessageRole.user) {
      const content = typeof row.content === "string" ? row.content : JSON.stringify(row.content);
      messages.push({ role: "user", content });
      continue;
    }

    if (row.role === MessageRole.assistant) {
      const text = typeof row.content === "string" ? row.content : "";
      const toolCalls = Array.isArray(row.toolCalls)
        ? (row.toolCalls as unknown as StoredToolCall[])
        : [];

      const parts: Array<
        | { type: "text"; text: string }
        | { type: "tool-call"; toolCallId: string; toolName: string; input: unknown }
      > = [];

      if (text) parts.push({ type: "text", text });
      for (const call of toolCalls) {
        parts.push({
          type: "tool-call",
          toolCallId: call.toolCallId,
          toolName: call.toolName,
          input: call.input,
        });
      }

      if (parts.length === 0) continue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messages.push({ role: "assistant", content: parts as any });
      continue;
    }

    if (row.role === MessageRole.tool) {
      if (!row.toolCallId) continue;
      messages.push({
        role: "tool",
        content: [
          {
            type: "tool-result",
            toolCallId: row.toolCallId,
            toolName: "",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            output: { type: "json", value: row.content as any },
          },
        ],
      });
    }
  }

  return messages;
}

export async function saveUserMessage(
  conversationId: string,
  content: string,
): Promise<void> {
  await prisma.message.create({
    data: {
      conversationId,
      role: MessageRole.user,
      content,
    },
  });
}

export async function saveAssistantMessage(
  conversationId: string,
  text: string,
  toolCalls: StoredToolCall[],
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const msg = await tx.message.create({
      data: {
        conversationId,
        role: MessageRole.assistant,
        content: text,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        toolCalls: toolCalls.length > 0 ? (toolCalls as any) : undefined,
      },
      select: { id: true },
    });
    if (toolCalls.length > 0) {
      await tx.toolExecution.updateMany({
        where: {
          conversationId,
          toolCallId: { in: toolCalls.map((c) => c.toolCallId) },
          messageId: null,
        },
        data: { messageId: msg.id },
      });
    }
  });
}

export async function saveToolResultMessage(
  conversationId: string,
  toolCallId: string,
  content: unknown,
): Promise<void> {
  await prisma.message.create({
    data: {
      conversationId,
      role: MessageRole.tool,
      toolCallId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      content: content as any,
    },
  });
}

export async function markConversationAbandoned(conversationId: string): Promise<void> {
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { status: ConversationStatus.abandoned },
  });
}

export type PendingExecutionInput = {
  conversationId: string;
  toolId: string;
  toolName: string;
  toolCallId: string;
  input: unknown;
  toolVersion: number;
};

export async function insertPendingExecution(
  input: PendingExecutionInput,
): Promise<{ id: string }> {
  return prisma.toolExecution.create({
    data: {
      conversationId: input.conversationId,
      toolId: input.toolId,
      toolName: input.toolName,
      toolCallId: input.toolCallId,
      status: ToolExecutionStatus.pending,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      input: input.input as any,
      toolVersion: input.toolVersion,
    },
    select: { id: true },
  });
}

export type ExecutionPatch = {
  status: ToolExecutionStatus;
  output: unknown;
  durationMs: number;
  errorMessage: string | null;
};

export async function updateExecution(id: string, patch: ExecutionPatch): Promise<void> {
  await prisma.toolExecution.update({
    where: { id },
    data: {
      status: patch.status,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      output: patch.output as any,
      durationMs: patch.durationMs,
      errorMessage: patch.errorMessage,
    },
  });
}
