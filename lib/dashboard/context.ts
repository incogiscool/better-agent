import { cache } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/auth/session";
import { PLAN_CONFIGS, type PlanConfig } from "@/lib/billing/plans";
import type { ProjectPlan } from "@/lib/generated/prisma/enums";

export type DashboardProject = {
  id: string;
  name: string;
  baseUrl: string | null;
  clientKey: string;
  systemPrompt: string | null;
  plan: ProjectPlan;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ProjectContext = {
  user: { id: string; name: string; email: string };
  project: DashboardProject;
  plan: PlanConfig;
};

export const loadProjectsForCurrentUser = cache(async () => {
  const user = await requireCurrentUser();
  const projects = await prisma.project.findMany({
    where: { ownerId: user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      baseUrl: true,
      plan: true,
      clientKey: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return { user, projects };
});

export const loadProjectContext = cache(
  async (projectId: string): Promise<ProjectContext> => {
    const user = await requireCurrentUser();

    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: user.id },
      select: {
        id: true,
        name: true,
        baseUrl: true,
        clientKey: true,
        systemPrompt: true,
        plan: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!project) {
      notFound();
    }

    return {
      user: { id: user.id, name: user.name, email: user.email },
      project,
      plan: PLAN_CONFIGS[project.plan],
    };
  },
);

export const resolveActiveProjectId = cache(
  async (preferredId?: string): Promise<string | null> => {
    const { projects } = await loadProjectsForCurrentUser();
    if (projects.length === 0) return null;
    if (preferredId && projects.some((p) => p.id === preferredId)) {
      return preferredId;
    }
    return projects[0]?.id ?? null;
  },
);
