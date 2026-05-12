import { prisma } from "@/lib/db";
import type { SyncTool } from "@/lib/schemas/sync";

type SyncResult = {
  added: number;
  updated: number;
  removed: number;
  unchanged: number;
};

function schemasAreEqual(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export async function syncTools(projectId: string, incoming: SyncTool[]): Promise<SyncResult> {
  const existing = await prisma.tool.findMany({
    where: { projectId },
  });

  const existingByName = new Map(existing.map((t) => [t.name, t]));
  const incomingNames = new Set(incoming.map((t) => t.name));

  let added = 0;
  let updated = 0;
  let removed = 0;
  let unchanged = 0;

  const now = new Date();

  for (const tool of incoming) {
    const stored = existingByName.get(tool.name);

    if (!stored) {
      await prisma.tool.create({
        data: {
          projectId,
          name: tool.name,
          type: tool.type,
          method: tool.method ?? null,
          path: tool.path ?? null,
          description: tool.description ?? null,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          inputSchema: tool.schema as any,
          aiGeneratedDescription: tool.aiGeneratedDescription,
          lastSyncedAt: now,
        },
      });
      added++;
      continue;
    }

    const schemaChanged = !schemasAreEqual(
      stored.inputSchema as Record<string, unknown>,
      tool.schema,
    );
    const descriptionChanged = stored.description !== (tool.description ?? null);
    const methodChanged = stored.method !== (tool.method ?? null);
    const pathChanged = stored.path !== (tool.path ?? null);
    const typeChanged = stored.type !== tool.type;
    const wasDeleted = stored.deletedAt !== null;
    const aiGenChanged = stored.aiGeneratedDescription !== tool.aiGeneratedDescription;

    const hasChanges =
      schemaChanged ||
      descriptionChanged ||
      methodChanged ||
      pathChanged ||
      typeChanged ||
      wasDeleted ||
      aiGenChanged;

    if (!hasChanges) {
      // Still touch lastSyncedAt so the dashboard can show accurate sync time
      await prisma.tool.update({
        where: { id: stored.id },
        data: { lastSyncedAt: now },
      });
      unchanged++;
      continue;
    }

    await prisma.tool.update({
      where: { id: stored.id },
      data: {
        type: tool.type,
        method: tool.method ?? null,
        path: tool.path ?? null,
        description: tool.description ?? null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        inputSchema: tool.schema as any,
        aiGeneratedDescription: tool.aiGeneratedDescription,
        lastSyncedAt: now,
        deletedAt: null,
        // Increment version only when the callable interface changes
        ...(schemaChanged || methodChanged || pathChanged || typeChanged
          ? { version: { increment: 1 } }
          : {}),
      },
    });
    updated++;
  }

  // Soft-delete tools that are no longer in the incoming list
  const toRemove = existing.filter(
    (t) => !incomingNames.has(t.name) && t.deletedAt === null,
  );

  if (toRemove.length > 0) {
    await prisma.tool.updateMany({
      where: {
        id: { in: toRemove.map((t) => t.id) },
      },
      data: { deletedAt: now },
    });
    removed = toRemove.length;
  }

  return { added, updated, removed, unchanged };
}
