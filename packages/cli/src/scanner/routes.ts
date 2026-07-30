import { promises as fs } from "node:fs";
import path from "node:path";

export type RouteCandidate = {
  filePath: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  routePath: string;
  /** Suggested camelCase name for the defineRoute export */
  suggestedName: string;
  /** Path parameter names, in order, derived from dynamic segments. */
  pathParams: string[];
};

export type ScanRoutesResult = {
  candidates: RouteCandidate[];
  /** Routes we found but can't express as a tool, with the reason why. */
  skipped: Array<{ routePath: string; reason: string }>;
};

const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const;
const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "dist", "out", ".cache"]);

/** Match: `export async function GET(` or `export function GET(` */
const METHOD_RE = /^export\s+(?:async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)\s*[(<]/m;

export async function scanRoutes(cwd: string): Promise<ScanRoutesResult> {
  const result: ScanRoutesResult = { candidates: [], skipped: [] };
  await walk(cwd, cwd, result);
  return result;
}

async function walk(
  root: string,
  dir: string,
  results: ScanRoutesResult,
): Promise<void> {
  let entries: import("node:fs").Dirent<string>[];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true, encoding: "utf8" });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name) || entry.name.startsWith(".")) continue;
      await walk(root, path.join(dir, entry.name), results);
      continue;
    }

    if (entry.name !== "route.ts" && entry.name !== "route.tsx") continue;

    const filePath = path.join(dir, entry.name);
    const relative = path.relative(root, filePath);

    // Only pick up files under app/api/
    if (!relative.startsWith(`app${path.sep}api`)) continue;

    let content: string;
    try {
      content = await fs.readFile(filePath, "utf-8");
    } catch {
      continue;
    }

    const derived = deriveRoutePath(root, filePath);

    const methods = HTTP_METHODS.filter((method) =>
      new RegExp(
        `^export\\s+(?:async\\s+)?function\\s+${method}\\s*[(<]`,
        "m",
      ).test(content),
    );

    if (methods.length === 0) continue;

    if (derived.catchAll) {
      // Report the route once, not once per method.
      results.skipped.push({
        routePath: derived.routePath,
        reason:
          "catch-all segments match any number of path segments, which a single tool parameter can't express",
      });
      continue;
    }

    for (const method of methods) {
      results.candidates.push({
        filePath,
        method,
        routePath: derived.routePath,
        suggestedName: toHandlerName(method, derived.routePath),
        pathParams: derived.pathParams,
      });
    }
  }
}

type DerivedPath = {
  routePath: string;
  pathParams: string[];
  /** True when the route contains a catch-all segment we can't express. */
  catchAll: boolean;
};

/**
 * Convert a file path to a tool path template:
 *   app/api/v1/chat/route.ts          →  /api/v1/chat
 *   app/api/projects/(list)/route.ts  →  /api/projects
 *   app/api/users/[id]/route.ts       →  /api/users/{id}
 *   app/api/files/[...path]/route.ts  →  catch-all, unsupported
 *
 * Dynamic segments become `{param}` placeholders, which is what `defineRoute`
 * interpolates. Catch-alls are flagged rather than translated: `[...path]`
 * matches any number of segments, and a single tool parameter can't stand in
 * for that without letting a value contain separators.
 */
function deriveRoutePath(root: string, filePath: string): DerivedPath {
  const rel = path.relative(root, filePath);
  // Normalise to forward slashes
  const fwd = rel.split(path.sep).join("/");
  // Strip leading "app/" and trailing "/route.{ts,tsx}"
  const stripped = fwd
    .replace(/^app\//, "")
    .replace(/\/route\.(tsx?)$/, "");

  const pathParams: string[] = [];
  let catchAll = false;

  const segments = stripped
    .split("/")
    // Remove Next.js route-group segments: (group)
    .filter((seg) => !seg.startsWith("(") || !seg.endsWith(")"))
    .map((seg) => {
      const dynamic = /^\[{1,2}(\.{3})?(.+?)\]{1,2}$/.exec(seg);
      if (!dynamic) return seg;
      if (dynamic[1]) {
        catchAll = true;
        return seg;
      }
      const name = dynamic[2];
      if (!name) return seg;
      pathParams.push(name);
      return `{${name}}`;
    });

  return { routePath: "/" + segments.join("/"), pathParams, catchAll };
}

/** GET /api/users/{id} → getUsers, POST /api/projects → createProject */
function toHandlerName(method: string, routePath: string): string {
  const prefix: Record<string, string> = {
    GET: "get",
    POST: "create",
    PUT: "update",
    DELETE: "delete",
    PATCH: "update",
  };
  const p = prefix[method] ?? method.toLowerCase();
  const segments = routePath
    .replace(/^\//, "")
    .split("/")
    .filter((s) => s && !s.startsWith("{") && s !== "api")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1));
  const noun = segments.at(-1) ?? "Resource";
  return p + noun;
}
