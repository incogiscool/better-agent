/**
 * Generate a fresh idempotency key for a chat send. Uses crypto.randomUUID
 * when available (browser + modern Node), with a fallback for older runtimes.
 */
export function newIdempotencyKey(): string {
  const c =
    typeof globalThis !== "undefined" ? (globalThis.crypto as Crypto | undefined) : undefined;
  if (c && typeof c.randomUUID === "function") {
    return c.randomUUID();
  }
  // Fallback: timestamp + 64-bit random
  const t = Date.now().toString(36);
  const r1 = Math.random().toString(36).slice(2, 10);
  const r2 = Math.random().toString(36).slice(2, 10);
  return `${t}-${r1}${r2}`;
}
