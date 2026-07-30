import { parsePathTemplate } from "betteragent-next";

/**
 * Turn a route tool's stored `path` plus the model's validated input into a
 * concrete request. Kept free of Prisma and network imports so it can be tested
 * directly.
 *
 * Placement rules:
 * - `{placeholder}` segments in the path are filled from matching input fields
 *   and removed from the payload.
 * - Whatever remains goes to the query string for GET/HEAD, or the JSON body
 *   for every other method. DELETE keeps its body, as it always has.
 */
export type RouteRequest = {
  url: string;
  body: string | undefined;
};

/** Methods whose parameters ride in the query string rather than a body. */
const QUERY_METHODS = new Set(["GET", "HEAD"]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Validate and encode one value destined for a URL path segment.
 *
 * Rejecting `/`, `\`, and `..` is the important part: without it a tool
 * argument could walk out of its endpoint and reach an unrelated one on the
 * same host. Percent-encoding alone doesn't prevent that, since some servers
 * normalise `%2F` back to a separator before routing.
 */
function encodePathParam(name: string, value: unknown): string {
  if (value === undefined || value === null) {
    throw new Error(`missing path parameter "${name}"`);
  }
  if (typeof value === "object") {
    throw new Error(
      `path parameter "${name}" must be a string or number, got ${
        Array.isArray(value) ? "an array" : "an object"
      }`,
    );
  }
  if (typeof value === "boolean") {
    throw new Error(`path parameter "${name}" must be a string or number`);
  }

  const raw = String(value);
  if (raw.length === 0) {
    throw new Error(`path parameter "${name}" must not be empty`);
  }
  if (raw.includes("/") || raw.includes("\\")) {
    throw new Error(`path parameter "${name}" must not contain a path separator`);
  }
  if (raw.includes("..")) {
    throw new Error(`path parameter "${name}" must not contain ".."`);
  }

  return encodeURIComponent(raw);
}

/** Append one leftover field to the query string. */
function appendQueryParam(
  params: URLSearchParams,
  key: string,
  value: unknown,
): void {
  if (value === undefined || value === null) return;

  if (Array.isArray(value)) {
    for (const item of value) appendQueryParam(params, key, item);
    return;
  }
  if (typeof value === "object") {
    params.append(key, JSON.stringify(value));
    return;
  }
  params.append(key, String(value));
}

export function buildRouteRequest(args: {
  baseUrl: string;
  method: string;
  path: string;
  input: unknown;
}): RouteRequest {
  const params = parsePathTemplate(args.path);
  const input = isPlainObject(args.input) ? args.input : null;

  if (params.length > 0 && !input) {
    throw new Error(
      `route expects path parameters (${params
        .map((p) => `"${p}"`)
        .join(", ")}) but received no input object`,
    );
  }

  let resolvedPath = args.path;
  const remaining: Record<string, unknown> = { ...(input ?? {}) };

  for (const param of params) {
    const encoded = encodePathParam(param, remaining[param]);
    delete remaining[param];
    resolvedPath = resolvedPath.replace(`{${param}}`, encoded);
  }

  const base = new URL(args.baseUrl);
  const url = new URL(resolvedPath, base);

  // `new URL("//evil.com/x", base)` resolves to a different host entirely.
  // A static path is author-controlled, but an interpolated one is not, so
  // confirm we're still pointing at the project's own backend.
  if (url.origin !== base.origin) {
    throw new Error(
      `resolved URL escaped the project baseUrl (${url.origin} !== ${base.origin})`,
    );
  }

  const method = args.method.toUpperCase();

  if (QUERY_METHODS.has(method)) {
    for (const [key, value] of Object.entries(remaining)) {
      appendQueryParam(url.searchParams, key, value);
    }
    return { url: url.toString(), body: undefined };
  }

  return { url: url.toString(), body: JSON.stringify(remaining) };
}
