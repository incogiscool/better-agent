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

/**
 * In production we must never silently disable rate limiting. If Redis is not
 * configured, `checkRateLimit` fails CLOSED (treats every request as limited)
 * so a misconfigured deploy can't leave the API wide open. Locally / in preview
 * we keep failing OPEN so the app boots without Redis.
 */
const IS_PRODUCTION =
  process.env.VERCEL_ENV === "production" ||
  (!process.env.VERCEL_ENV && process.env.NODE_ENV === "production");

const REDIS_MISSING_IN_PROD = IS_PRODUCTION && !redis;

if (REDIS_MISSING_IN_PROD) {
  console.error(
    "[ratelimit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set " +
      "in production. Rate limiting will fail CLOSED (all requests rejected) " +
      "until Redis is configured.",
  );
}

function makeLimit(requests: number, windowSeconds: number): Ratelimit | null {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, `${windowSeconds}s`),
    prefix: "ba_rl",
  });
}

/**
 * 20 req/min keyed by (project, end user) — the per-end-user fairness limit
 * for POST /api/v1/chat. One noisy user can't starve the rest of the project.
 */
export const chatLimiter = makeLimit(20, 60);

/**
 * 120 req/min keyed by project clientKey — a project-wide ceiling that bounds
 * total spend even when many distinct end users (or spoofed endUserIds) are in
 * play. Checked before the DB lookup as a cheap first gate.
 */
export const chatProjectLimiter = makeLimit(120, 60);

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

/**
 * 5 submissions per 15 min per IP — covers the public contact form.
 */
export const contactLimiter = makeLimit(5, 900);

/**
 * 30 req/min per project — covers POST /api/v1/describe. Caps Anthropic
 * spend from a leaked secret key.
 */
export const describeLimiter = makeLimit(30, 60);

export type RateLimitResult =
  | { limited: false }
  | { limited: true; reset: number };

export async function checkRateLimit(
  limiter: Ratelimit | null,
  key: string,
): Promise<RateLimitResult> {
  if (!limiter) {
    // Fail CLOSED in production (Redis missing => reject), fail OPEN in dev.
    return REDIS_MISSING_IN_PROD
      ? { limited: true, reset: Date.now() + 60_000 }
      : { limited: false };
  }
  const { success, reset } = await limiter.limit(key);
  if (success) return { limited: false };
  return { limited: true, reset };
}
