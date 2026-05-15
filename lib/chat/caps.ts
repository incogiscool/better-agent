import { prisma } from "@/lib/db";

export const MAX_STEPS = 20;
export const MAX_TOKENS_PER_CONVERSATION = 80_000;
export const MAX_TOOL_RESULT_BYTES = 8192;

export async function getRunningTokenTotal(conversationId: string): Promise<number> {
  const agg = await prisma.creditEvent.aggregate({
    where: { conversationId },
    _sum: { tokensInput: true, tokensOutput: true },
  });
  return (agg._sum.tokensInput ?? 0) + (agg._sum.tokensOutput ?? 0);
}

export function isOverTokenCap(total: number): boolean {
  return total > MAX_TOKENS_PER_CONVERSATION;
}

export type TokenCapCheck = { over: boolean; total: number };

export async function checkTokenCap(conversationId: string): Promise<TokenCapCheck> {
  const total = await getRunningTokenTotal(conversationId);
  return { over: isOverTokenCap(total), total };
}

const TRUNCATION_SUFFIX = "\n[...truncated]";

export function truncateTo8KB(value: unknown): unknown {
  // For strings: truncate directly. For other shapes: stringify, check, optionally re-parse.
  if (typeof value === "string") {
    return value.length > MAX_TOOL_RESULT_BYTES
      ? value.slice(0, MAX_TOOL_RESULT_BYTES) + TRUNCATION_SUFFIX
      : value;
  }
  let serialized: string;
  try {
    serialized = JSON.stringify(value);
  } catch {
    return { error: "result not serializable" };
  }
  if (serialized.length <= MAX_TOOL_RESULT_BYTES) return value;
  return {
    truncated: true,
    preview: serialized.slice(0, MAX_TOOL_RESULT_BYTES) + TRUNCATION_SUFFIX,
  };
}
