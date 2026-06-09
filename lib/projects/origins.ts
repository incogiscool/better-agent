/**
 * Origin allowlist + CORS helpers for the public chat API.
 *
 * The chat API authenticates with a project's *publishable* client key, which
 * is embedded in customer frontends and therefore not secret. To stop anyone
 * who lifts the key from a customer's site from draining their credits, each
 * project can configure an allowlist of origins permitted to use its client
 * key. The same list drives the CORS policy for the browser SDK.
 *
 * NOTE: the Origin header is only trustworthy for *browser* clients — a
 * non-browser caller (curl) can forge it. This is intentional defense-in-depth,
 * not a complete anti-abuse solution.
 */

const ALLOWED_HEADERS = "authorization, content-type, x-end-user-token, x-end-user-headers, accept";
const ALLOWED_METHODS = "POST, OPTIONS";

/** Reduce a URL/origin string to its `scheme://host[:port]` form, or null. */
export function normalizeOrigin(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function isLocalhostOrigin(origin: string): boolean {
  try {
    const host = new URL(origin).hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  } catch {
    return false;
  }
}

/**
 * Whether `origin` may use a project with the given allowlist.
 * - Empty allowlist => allow all (project hasn't locked down yet).
 * - localhost is always allowed (dev convenience).
 * - A request with no Origin header (server-to-server) is allowed; Origin
 *   enforcement only constrains browsers.
 */
export function isOriginAllowed(
  origin: string | null | undefined,
  allowedOrigins: string[],
): boolean {
  if (allowedOrigins.length === 0) return true;
  const normalized = normalizeOrigin(origin);
  if (!normalized) return true; // no/invalid Origin header => not a browser CORS request
  if (isLocalhostOrigin(normalized)) return true;
  return allowedOrigins.some((allowed) => normalizeOrigin(allowed) === normalized);
}

/**
 * CORS headers for a response. Echoes the specific request origin (not `*`)
 * because requests carry an Authorization header. Pass the request's Origin;
 * when present we reflect it and mark the response as varying on Origin.
 */
export function corsHeaders(origin: string | null | undefined): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": ALLOWED_METHODS,
    "Access-Control-Allow-Headers": ALLOWED_HEADERS,
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  const normalized = normalizeOrigin(origin);
  if (normalized) headers["Access-Control-Allow-Origin"] = normalized;
  return headers;
}
