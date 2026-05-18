import { prisma } from "@/lib/db";
import {
  ConversationStatus,
  ToolExecutionStatus,
} from "@/lib/generated/prisma/enums";

export type ConversationListItem = {
  id: string;
  endUserId: string;
  title: string | null;
  status: ConversationStatus;
  createdAt: Date;
  updatedAt: Date;
  toolCallCount: number;
  totalCredits: number;
  totalTokens: number;
  primaryModel: string | null;
  failed: boolean;
};

export type ConversationStats = {
  windowHours: number;
  totalRuns: number;
  failedRuns: number;
  failureRate: number | null;
  totalTokens: number;
  totalCostUsd: number;
  p50LatencyMs: number | null;
  prevTotalRuns: number;
};

const MAX_PAGE_SIZE = 100;

function quantile(values: number[], q: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

export async function listConversationsForProject(
  projectId: string,
  options: {
    cursor?: string;
    status?: ConversationStatus;
    limit?: number;
  } = {},
): Promise<{ items: ConversationListItem[]; nextCursor: string | null }> {
  const limit = Math.min(options.limit ?? 30, MAX_PAGE_SIZE);

  const conversations = await prisma.conversation.findMany({
    where: {
      projectId,
      ...(options.status ? { status: options.status } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(options.cursor
      ? { skip: 1, cursor: { id: options.cursor } }
      : {}),
    select: {
      id: true,
      endUserId: true,
      title: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const hasMore = conversations.length > limit;
  const sliced = hasMore ? conversations.slice(0, limit) : conversations;
  const ids = sliced.map((c) => c.id);

  if (ids.length === 0) {
    return { items: [], nextCursor: null };
  }

  const [executions, creditEvents] = await Promise.all([
    prisma.toolExecution.groupBy({
      by: ["conversationId", "status"],
      where: { conversationId: { in: ids } },
      _count: { _all: true },
    }),
    prisma.creditEvent.groupBy({
      by: ["conversationId", "model"],
      where: { conversationId: { in: ids } },
      _sum: {
        credits: true,
        tokensInput: true,
        tokensOutput: true,
        tokensCached: true,
      },
    }),
  ]);

  const execByConv = new Map<
    string,
    { total: number; failed: boolean }
  >();
  for (const row of executions) {
    const current = execByConv.get(row.conversationId) ?? {
      total: 0,
      failed: false,
    };
    current.total += row._count._all;
    if (
      row.status === ToolExecutionStatus.failed ||
      row.status === ToolExecutionStatus.timed_out
    ) {
      current.failed = true;
    }
    execByConv.set(row.conversationId, current);
  }

  const creditsByConv = new Map<
    string,
    { credits: number; tokens: number; model: string | null }
  >();
  for (const row of creditEvents) {
    const cur = creditsByConv.get(row.conversationId ?? "") ?? {
      credits: 0,
      tokens: 0,
      model: null,
    };
    cur.credits += row._sum.credits ?? 0;
    cur.tokens +=
      (row._sum.tokensInput ?? 0) + (row._sum.tokensOutput ?? 0);
    if (!cur.model && row.model) cur.model = row.model;
    creditsByConv.set(row.conversationId ?? "", cur);
  }

  const items: ConversationListItem[] = sliced.map((c) => {
    const exec = execByConv.get(c.id);
    const credit = creditsByConv.get(c.id);
    return {
      id: c.id,
      endUserId: c.endUserId,
      title: c.title,
      status: c.status,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      toolCallCount: exec?.total ?? 0,
      totalCredits: credit?.credits ?? 0,
      totalTokens: credit?.tokens ?? 0,
      primaryModel: credit?.model ?? null,
      failed: exec?.failed ?? false,
    };
  });

  return {
    items,
    nextCursor: hasMore ? sliced[sliced.length - 1].id : null,
  };
}

export async function getConversationStats(
  projectId: string,
  windowHours = 24,
): Promise<ConversationStats> {
  const now = new Date();
  const since = new Date(now.getTime() - windowHours * 3_600_000);
  const prevSince = new Date(since.getTime() - windowHours * 3_600_000);

  const [conversationIds, prevTotal, executions, creditAgg] =
    await Promise.all([
      prisma.conversation.findMany({
        where: { projectId, createdAt: { gte: since } },
        select: { id: true },
      }),
      prisma.conversation.count({
        where: {
          projectId,
          createdAt: { gte: prevSince, lt: since },
        },
      }),
      prisma.toolExecution.findMany({
        where: {
          conversation: { projectId },
          createdAt: { gte: since },
        },
        select: { status: true, durationMs: true, conversationId: true },
      }),
      prisma.creditEvent.aggregate({
        where: { projectId, createdAt: { gte: since } },
        _sum: {
          tokensInput: true,
          tokensOutput: true,
          tokensCached: true,
          costUsd: true,
        },
      }),
    ]);

  const totalRuns = conversationIds.length;
  const failedConvIds = new Set<string>();
  const durations: number[] = [];

  for (const exec of executions) {
    if (typeof exec.durationMs === "number") durations.push(exec.durationMs);
    if (
      exec.status === ToolExecutionStatus.failed ||
      exec.status === ToolExecutionStatus.timed_out
    ) {
      failedConvIds.add(exec.conversationId);
    }
  }

  const failedRuns = failedConvIds.size;
  const failureRate = totalRuns > 0 ? failedRuns / totalRuns : null;

  const totalTokens =
    (creditAgg._sum.tokensInput ?? 0) +
    (creditAgg._sum.tokensOutput ?? 0) +
    (creditAgg._sum.tokensCached ?? 0);
  const totalCostUsd = Number(creditAgg._sum.costUsd ?? 0);

  return {
    windowHours,
    totalRuns,
    failedRuns,
    failureRate,
    totalTokens,
    totalCostUsd,
    p50LatencyMs: quantile(durations, 0.5),
    prevTotalRuns: prevTotal,
  };
}

export async function loadConversationDetail(
  projectId: string,
  conversationId: string,
) {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, projectId },
    select: {
      id: true,
      endUserId: true,
      title: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      messages: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          role: true,
          content: true,
          toolCalls: true,
          toolCallId: true,
          createdAt: true,
        },
      },
      executions: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          toolName: true,
          toolCallId: true,
          messageId: true,
          status: true,
          input: true,
          output: true,
          durationMs: true,
          errorMessage: true,
          toolVersion: true,
          createdAt: true,
        },
      },
      creditEvents: {
        select: {
          credits: true,
          tokensInput: true,
          tokensOutput: true,
          tokensCached: true,
          costUsd: true,
          model: true,
          type: true,
        },
      },
    },
  });

  if (!conversation) return null;

  const totalCredits = conversation.creditEvents.reduce(
    (sum, e) => sum + e.credits,
    0,
  );
  const totalTokens = conversation.creditEvents.reduce(
    (sum, e) =>
      sum +
      (e.tokensInput ?? 0) +
      (e.tokensOutput ?? 0) +
      (e.tokensCached ?? 0),
    0,
  );
  const totalCostUsd = conversation.creditEvents.reduce(
    (sum, e) => sum + Number(e.costUsd ?? 0),
    0,
  );
  const primaryModel =
    conversation.creditEvents.find((e) => e.model)?.model ?? null;

  return {
    ...conversation,
    totals: {
      credits: totalCredits,
      tokens: totalTokens,
      costUsd: totalCostUsd,
      model: primaryModel,
    },
  };
}
