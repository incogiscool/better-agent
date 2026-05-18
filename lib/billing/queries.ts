import { prisma } from "@/lib/db";
import { getCurrentBillingPeriod } from "./periods";
import { PLAN_CONFIGS } from "./plans";
import type { ProjectPlan } from "@/lib/generated/prisma/enums";

export type UsageSummary = {
  current: {
    id: string;
    startsAt: Date;
    endsAt: Date;
    includedCredits: number;
    creditsUsed: number;
    overageCredits: number;
    estimatedEndOfPeriodCredits: number;
  };
  history: Array<{
    id: string;
    startsAt: Date;
    endsAt: Date;
    includedCredits: number;
    creditsUsed: number;
    overageCredits: number;
  }>;
  plan: ProjectPlan;
};

export async function getUsageSummary(
  projectId: string,
): Promise<UsageSummary> {
  const project = await prisma.project.findUniqueOrThrow({
    where: { id: projectId },
    select: { plan: true },
  });

  const current = await getCurrentBillingPeriod(projectId);

  const history = await prisma.billingPeriod.findMany({
    where: { projectId, id: { not: current.id } },
    orderBy: { startsAt: "desc" },
    take: 6,
    select: {
      id: true,
      startsAt: true,
      endsAt: true,
      includedCredits: true,
      creditsUsed: true,
      overageCredits: true,
    },
  });

  // Linear pro-rata projection of end-of-period credit usage.
  const totalDuration = current.endsAt.getTime() - current.startsAt.getTime();
  const elapsed = Date.now() - current.startsAt.getTime();
  const fraction =
    totalDuration > 0 ? Math.max(0.01, Math.min(elapsed / totalDuration, 1)) : 1;
  const estimated = Math.round(current.creditsUsed / fraction);

  return {
    plan: project.plan,
    current: {
      id: current.id,
      startsAt: current.startsAt,
      endsAt: current.endsAt,
      includedCredits: current.includedCredits,
      creditsUsed: current.creditsUsed,
      overageCredits: current.overageCredits,
      estimatedEndOfPeriodCredits: estimated,
    },
    history,
  };
}

export async function getCostBreakdown(projectId: string, billingPeriodId: string) {
  const groups = await prisma.creditEvent.groupBy({
    by: ["type"],
    where: { projectId, billingPeriodId },
    _sum: {
      credits: true,
      costUsd: true,
      tokensInput: true,
      tokensOutput: true,
      tokensCached: true,
    },
  });

  return groups.map((g) => ({
    type: g.type,
    credits: g._sum.credits ?? 0,
    costUsd: Number(g._sum.costUsd ?? 0),
    tokensInput: g._sum.tokensInput ?? 0,
    tokensOutput: g._sum.tokensOutput ?? 0,
    tokensCached: g._sum.tokensCached ?? 0,
  }));
}

export async function getTopConversationsByCost(
  projectId: string,
  billingPeriodId: string,
  limit = 5,
) {
  const groups = await prisma.creditEvent.groupBy({
    by: ["conversationId"],
    where: {
      projectId,
      billingPeriodId,
      conversationId: { not: null },
    },
    _sum: {
      credits: true,
      costUsd: true,
      tokensInput: true,
      tokensOutput: true,
    },
    orderBy: { _sum: { credits: "desc" } },
    take: limit,
  });

  const ids = groups
    .map((g) => g.conversationId)
    .filter((id): id is string => typeof id === "string");

  if (ids.length === 0) return [];

  const conversations = await prisma.conversation.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      endUserId: true,
      status: true,
      createdAt: true,
    },
  });
  const map = new Map(conversations.map((c) => [c.id, c]));

  return groups.map((g) => {
    const conv = g.conversationId ? map.get(g.conversationId) : undefined;
    return {
      conversationId: g.conversationId!,
      conversation: conv,
      credits: g._sum.credits ?? 0,
      costUsd: Number(g._sum.costUsd ?? 0),
      tokens:
        (g._sum.tokensInput ?? 0) + (g._sum.tokensOutput ?? 0),
    };
  });
}

export async function getCacheStats(
  projectId: string,
  billingPeriodId: string,
) {
  const agg = await prisma.creditEvent.aggregate({
    where: { projectId, billingPeriodId },
    _sum: {
      tokensInput: true,
      tokensOutput: true,
      tokensCached: true,
    },
  });

  const cached = agg._sum.tokensCached ?? 0;
  const input = agg._sum.tokensInput ?? 0;
  const total = cached + input;

  return {
    tokensCached: cached,
    tokensInput: input,
    tokensOutput: agg._sum.tokensOutput ?? 0,
    cacheHitRate: total > 0 ? cached / total : null,
  };
}

export function planConfigFor(plan: ProjectPlan) {
  return PLAN_CONFIGS[plan];
}
