import { prisma } from "@/lib/db";

export const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;

export type IdempotencyEndpoint = "chat";

export type IdempotencyClaim =
  | { kind: "fresh"; id: string }
  | { kind: "duplicate"; conversationId: string | null };

export async function claimIdempotencyKey(args: {
  projectId: string;
  key: string;
  endpoint: IdempotencyEndpoint;
}): Promise<IdempotencyClaim> {
  const expiresAt = new Date(Date.now() + IDEMPOTENCY_TTL_MS);

  try {
    const row = await prisma.idempotencyKey.create({
      data: {
        projectId: args.projectId,
        key: args.key,
        endpoint: args.endpoint,
        expiresAt,
      },
      select: { id: true },
    });
    return { kind: "fresh", id: row.id };
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((err as any)?.code !== "P2002") throw err;

    const existing = await prisma.idempotencyKey.findUnique({
      where: {
        projectId_key_endpoint: {
          projectId: args.projectId,
          key: args.key,
          endpoint: args.endpoint,
        },
      },
      select: { conversationId: true },
    });
    return { kind: "duplicate", conversationId: existing?.conversationId ?? null };
  }
}

export async function attachConversation(id: string, conversationId: string): Promise<void> {
  await prisma.idempotencyKey.update({
    where: { id },
    data: { conversationId },
  });
}

export async function purgeExpiredIdempotencyKeys(): Promise<number> {
  const result = await prisma.idempotencyKey.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  return result.count;
}
