import { prisma } from "@/lib/db";
import type { CreditEventType, ProjectPlan } from "@/lib/generated/prisma/enums";
import { PLAN_CONFIGS } from "./plans";
import { getCurrentBillingPeriod } from "./periods";

export type CreditEventInput = {
  type: CreditEventType;
  credits: number;
  conversationId?: string;
  toolExecutionId?: string;
  tokensInput?: number;
  tokensOutput?: number;
  tokensCached?: number;
  costUsd?: number;
  model?: string;
  metadata?: Record<string, unknown>;
};

export type ConsumeCreditsResult =
  | { ok: true }
  | { ok: false; reason: "hard_cap_reached" };

export async function recordCreditEvent(
  projectId: string,
  billingPeriodId: string,
  event: CreditEventInput,
): Promise<void> {
  await prisma.$transaction([
    prisma.creditEvent.create({
      data: {
        projectId,
        billingPeriodId,
        conversationId: event.conversationId ?? null,
        toolExecutionId: event.toolExecutionId ?? null,
        type: event.type,
        credits: event.credits,
        tokensInput: event.tokensInput ?? null,
        tokensOutput: event.tokensOutput ?? null,
        tokensCached: event.tokensCached ?? null,
        costUsd: event.costUsd ?? null,
        model: event.model ?? null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        metadata: (event.metadata ?? undefined) as any,
      },
    }),
    prisma.billingPeriod.update({
      where: { id: billingPeriodId },
      data: { creditsUsed: { increment: event.credits } },
    }),
  ]);
}

export async function hasMinimumCredits(
  projectId: string,
  requiredCredits: number,
): Promise<boolean> {
  const [period, project] = await Promise.all([
    getCurrentBillingPeriod(projectId),
    prisma.project.findUniqueOrThrow({ where: { id: projectId }, select: { plan: true } }),
  ]);

  const config = PLAN_CONFIGS[project.plan as ProjectPlan];

  if (!config.hardCap) return true;

  return period.includedCredits - period.creditsUsed >= requiredCredits;
}

export async function consumeCredits(
  projectId: string,
  event: CreditEventInput,
): Promise<ConsumeCreditsResult> {
  const [period, project] = await Promise.all([
    getCurrentBillingPeriod(projectId),
    prisma.project.findUniqueOrThrow({ where: { id: projectId }, select: { plan: true } }),
  ]);

  const config = PLAN_CONFIGS[project.plan as ProjectPlan];

  if (config.hardCap && period.includedCredits - period.creditsUsed < event.credits) {
    return { ok: false, reason: "hard_cap_reached" };
  }

  await recordCreditEvent(projectId, period.id, event);

  return { ok: true };
}
