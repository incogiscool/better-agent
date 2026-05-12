import { ProjectPlan } from "@/lib/generated/prisma/enums";

export type PlanConfig = {
  includedCredits: number;
  periodDays: number;
  hardCap: boolean;
  overageAllowed: boolean;
  overageCreditCostPer1k: number | null;
  maxProjects: number | null;
  historyDays: number | null;
  watermark: boolean;
};

export const PLAN_CONFIGS: Record<ProjectPlan, PlanConfig> = {
  [ProjectPlan.FREE]: {
    includedCredits: 500,
    periodDays: 30,
    hardCap: true,
    overageAllowed: false,
    overageCreditCostPer1k: null,
    maxProjects: 1,
    historyDays: 7,
    watermark: true,
  },
  [ProjectPlan.PRO]: {
    includedCredits: 10_000,
    periodDays: 30,
    hardCap: false,
    overageAllowed: true,
    overageCreditCostPer1k: 5.0,
    maxProjects: null,
    historyDays: null,
    watermark: false,
  },
  [ProjectPlan.ENTERPRISE]: {
    // includedCredits is a placeholder; a future per-project override column will supersede this
    includedCredits: 100_000,
    periodDays: 30,
    hardCap: false,
    overageAllowed: true,
    overageCreditCostPer1k: null,
    maxProjects: null,
    historyDays: null,
    watermark: false,
  },
};

export const CREDIT_WEIGHTS = {
  conversation_start: 2,
  message: 1,
  tool_call: 3,
  ai_description_generation: 5,
  overage_adjustment: 0,
} as const satisfies Record<string, number>;
