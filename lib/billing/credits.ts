import { prisma } from "@/lib/db";
import type { CreditEventType, ProjectPlan } from "@/lib/generated/prisma/enums";
import { PLAN_CONFIGS } from "./plans";
import { getCurrentBillingPeriod } from "./periods";
import {
  sendCreditWarningEmail,
  sendCreditsExhaustedEmail,
} from "@/lib/email/notifications";

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
  opts: { incrementPeriod?: boolean } = {},
): Promise<void> {
  const { incrementPeriod = true } = opts;
  const createEvent = prisma.creditEvent.create({
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
  });

  if (!incrementPeriod) {
    // BYOK: record the event for usage visibility but don't draw down the pool.
    await createEvent;
    return;
  }

  await prisma.$transaction([
    createEvent,
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
  opts: { byok?: boolean } = {},
): Promise<ConsumeCreditsResult> {
  // BYOK: the project pays Anthropic directly. Record the event for usage
  // visibility (tokens/model), but never draw down the pool or enforce caps.
  if (opts.byok) {
    const period = await getCurrentBillingPeriod(projectId);
    await recordCreditEvent(projectId, period.id, event, {
      incrementPeriod: false,
    });
    return { ok: true };
  }

  const [period, project] = await Promise.all([
    getCurrentBillingPeriod(projectId),
    prisma.project.findUniqueOrThrow({
      where: { id: projectId },
      select: {
        plan: true,
        name: true,
        owner: { select: { email: true } },
      },
    }),
  ]);

  const config = PLAN_CONFIGS[project.plan as ProjectPlan];

  if (config.hardCap && period.includedCredits - period.creditsUsed < event.credits) {
    if (!period.exhaustedEmailSentAt) {
      sendCreditsExhaustedEmail(project.owner.email, project.name).catch(console.error);
      prisma.billingPeriod
        .update({ where: { id: period.id }, data: { exhaustedEmailSentAt: new Date() } })
        .catch(console.error);
    }
    return { ok: false, reason: "hard_cap_reached" };
  }

  await recordCreditEvent(projectId, period.id, event);

  const newUsed = period.creditsUsed + event.credits;
  const usageRatio = newUsed / period.includedCredits;
  if (config.hardCap && usageRatio >= 0.8 && !period.warningEmailSentAt) {
    sendCreditWarningEmail(
      project.owner.email,
      project.name,
      newUsed,
      period.includedCredits,
    ).catch(console.error);
    prisma.billingPeriod
      .update({ where: { id: period.id }, data: { warningEmailSentAt: new Date() } })
      .catch(console.error);
  }

  return { ok: true };
}
