import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

/**
 * Lazy-initialised Redis client. Returns null when UPSTASH_REDIS_REST_URL /
 * UPSTASH_REDIS_REST_TOKEN are not set so the app still boots locally without
 * Redis configured.
 */
function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const redis = getRedis();

function makeLimit(requests: number, windowSeconds: number): Ratelimit | null {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, `${windowSeconds}s`),
    prefix: "ba_rl",
  });
}

/**
 * 20 req/min keyed by project clientKey — covers POST /api/v1/chat
 * at the project level. Guards against runaway integrations.
 */
export const chatLimiter = makeLimit(20, 60);

/**
 * 60 req/min keyed by clientKey — covers POST /api/v1/execute-result.
 * More generous since each chat turn may trigger multiple client actions.
 */
export const executeResultLimiter = makeLimit(60, 60);

/**
 * 5 attempts per 15 min per IP — covers email sign-up specifically.
 */
export const signupLimiter = makeLimit(5, 900);

/**
 * 20 req/min per IP — covers all other auth endpoints (sign-in, OTP verify).
 */
export const authLimiter = makeLimit(20, 60);

export type RateLimitResult =
  | { limited: false }
  | { limited: true; reset: number };

export async function checkRateLimit(
  limiter: Ratelimit | null,
  key: string,
): Promise<RateLimitResult> {
  if (!limiter) return { limited: false };
  const { success, reset } = await limiter.limit(key);
  if (success) return { limited: false };
  return { limited: true, reset };
}
