import { prisma } from "@/lib/db";
import type { ToolType } from "@/lib/generated/prisma/enums";

export type ToolListItem = {
  id: string;
  name: string;
  type: ToolType;
  method: string | null;
  path: string | null;
  description: string | null;
  aiGenerated: boolean;
  version: number;
  lastSyncedAt: Date;
  override: {
    description: string | null;
    enabled: boolean;
  } | null;
  recentExecutions: number;
};

export async function listToolsForProject(
  projectId: string,
): Promise<ToolListItem[]> {
  const tools = await prisma.tool.findMany({
    where: { projectId, deletedAt: null },
    orderBy: [{ type: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      type: true,
      method: true,
      path: true,
      description: true,
      aiGeneratedDescription: true,
      version: true,
      lastSyncedAt: true,
      override: {
        select: { description: true, enabled: true },
      },
      _count: {
        select: { executions: true },
      },
    },
  });

  return tools.map((t) => ({
    id: t.id,
    name: t.name,
    type: t.type,
    method: t.method,
    path: t.path,
    description: t.description,
    aiGenerated: t.aiGeneratedDescription,
    version: t.version,
    lastSyncedAt: t.lastSyncedAt,
    override: t.override
      ? {
          description: t.override.description,
          enabled: t.override.enabled,
        }
      : null,
    recentExecutions: t._count.executions,
  }));
}

export async function getToolDetail(projectId: string, toolId: string) {
  const tool = await prisma.tool.findFirst({
    where: { id: toolId, projectId, deletedAt: null },
    select: {
      id: true,
      name: true,
      type: true,
      method: true,
      path: true,
      description: true,
      aiGeneratedDescription: true,
      version: true,
      lastSyncedAt: true,
      inputSchema: true,
      createdAt: true,
      updatedAt: true,
      override: {
        select: { description: true, enabled: true, updatedAt: true },
      },
      executions: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          conversationId: true,
          status: true,
          durationMs: true,
          createdAt: true,
          errorMessage: true,
        },
      },
    },
  });

  return tool;
}
