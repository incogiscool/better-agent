import { prisma } from "@/lib/db";
import { ToolExecutionStatus } from "@/lib/generated/prisma/enums";

const MAX_PAGE_SIZE = 100;

export type ExecutionLog = {
  id: string;
  conversationId: string;
  toolId: string | null;
  toolName: string;
  status: ToolExecutionStatus;
  durationMs: number | null;
  errorMessage: string | null;
  createdAt: Date;
};

export async function listExecutionLogsForProject(
  projectId: string,
  options: {
    cursor?: string;
    status?: ToolExecutionStatus;
    toolId?: string;
    limit?: number;
  } = {},
): Promise<{ items: ExecutionLog[]; nextCursor: string | null }> {
  const limit = Math.min(options.limit ?? 50, MAX_PAGE_SIZE);

  const rows = await prisma.toolExecution.findMany({
    where: {
      conversation: { projectId },
      ...(options.status ? { status: options.status } : {}),
      ...(options.toolId ? { toolId: options.toolId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(options.cursor ? { skip: 1, cursor: { id: options.cursor } } : {}),
    select: {
      id: true,
      conversationId: true,
      toolId: true,
      toolName: true,
      status: true,
      durationMs: true,
      errorMessage: true,
      createdAt: true,
    },
  });

  const hasMore = rows.length > limit;
  const sliced = hasMore ? rows.slice(0, limit) : rows;

  return {
    items: sliced,
    nextCursor: hasMore ? sliced[sliced.length - 1].id : null,
  };
}

export async function listToolOptionsForProject(projectId: string) {
  return prisma.tool.findMany({
    where: { projectId, deletedAt: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}
