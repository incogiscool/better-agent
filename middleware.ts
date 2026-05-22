import { type NextRequest, NextResponse } from "next/server";
import {
  chatLimiter,
  executeResultLimiter,
  signupLimiter,
  authLimiter,
  checkRateLimit,
} from "@/lib/ratelimit";

/** Extract the real client IP, preferring Vercel's forwarded header. */
function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

/** Extract the Bearer token from the Authorization header. */
function getBearerToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7).trim() || null;
}

function rateLimitedResponse(reset: number): NextResponse {
  const retryAfter = Math.max(0, Math.ceil((reset - Date.now()) / 1000));
  return NextResponse.json(
    { error: "Too many requests. Please slow down.", code: "rate_limit" },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Reset": String(reset),
      },
    },
  );
}

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;
  const method = req.method;

  // ── API v1 endpoints — rate limit by project clientKey ──────────────────

  if (method === "POST" && pathname === "/api/v1/chat") {
    const token = getBearerToken(req);
    // Fall back to IP if no bearer (the route will reject it with 401 anyway).
    const key = token ?? `ip:${getIp(req)}`;
    const result = await checkRateLimit(chatLimiter, key);
    if (result.limited) return rateLimitedResponse(result.reset);
  }

  if (method === "POST" && pathname === "/api/v1/execute-result") {
    const token = getBearerToken(req);
    const key = token ?? `ip:${getIp(req)}`;
    const result = await checkRateLimit(executeResultLimiter, key);
    if (result.limited) return rateLimitedResponse(result.reset);
  }

  // ── Auth endpoints — rate limit by IP ────────────────────────────────────

  if (pathname.startsWith("/api/auth/")) {
    const ip = getIp(req);

    // Tighter limit specifically for the sign-up endpoint.
    if (method === "POST" && pathname === "/api/auth/sign-up/email") {
      const result = await checkRateLimit(signupLimiter, `signup:${ip}`);
      if (result.limited) return rateLimitedResponse(result.reset);
    }

    // Broader limit for all other auth requests.
    if (method === "POST") {
      const result = await checkRateLimit(authLimiter, `auth:${ip}`);
      if (result.limited) return rateLimitedResponse(result.reset);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/v1/chat",
    "/api/v1/execute-result",
    "/api/auth/:path*",
  ],
};
