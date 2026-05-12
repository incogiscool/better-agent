import { prisma } from "@/lib/db";
import { ProjectPlan } from "@/lib/generated/prisma/enums";
import type { BillingPeriodModel as BillingPeriod } from "@/lib/generated/prisma/models/BillingPeriod";
import { PLAN_CONFIGS } from "./plans";

export async function createBillingPeriod(
  projectId: string,
  plan: ProjectPlan,
  startsAt: Date = new Date(),
): Promise<BillingPeriod> {
  const config = PLAN_CONFIGS[plan];
  const endsAt = new Date(startsAt);
  endsAt.setDate(endsAt.getDate() + config.periodDays);

  return prisma.billingPeriod.create({
    data: {
      projectId,
      startsAt,
      endsAt,
      includedCredits: config.includedCredits,
    },
  });
}

export async function getCurrentBillingPeriod(projectId: string): Promise<BillingPeriod> {
  const now = new Date();

  const existing = await prisma.billingPeriod.findFirst({
    where: { projectId, endsAt: { gt: now } },
    orderBy: { startsAt: "desc" },
  });

  if (existing) return existing;

  const project = await prisma.project.findUniqueOrThrow({
    where: { id: projectId },
    select: { plan: true },
  });

  return createBillingPeriod(projectId, project.plan, now);
}

export async function rolloverExpiredPeriods(): Promise<number> {
  const now = new Date();

  const expiredRows = await prisma.billingPeriod.findMany({
    where: { endsAt: { lte: now } },
    select: { projectId: true },
    distinct: ["projectId"],
  });

  if (expiredRows.length === 0) return 0;

  const expiredIds = expiredRows.map((r) => r.projectId);

  const activeRows = await prisma.billingPeriod.findMany({
    where: { projectId: { in: expiredIds }, endsAt: { gt: now } },
    select: { projectId: true },
    distinct: ["projectId"],
  });

  const activeSet = new Set(activeRows.map((r) => r.projectId));
  const needsRollover = expiredIds.filter((id) => !activeSet.has(id));

  if (needsRollover.length === 0) return 0;

  const projects = await prisma.project.findMany({
    where: { id: { in: needsRollover } },
    select: { id: true, plan: true },
  });

  for (const project of projects) {
    await createBillingPeriod(project.id, project.plan, now);
  }

  return projects.length;
}
