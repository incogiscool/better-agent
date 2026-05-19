import { promises as fs } from "node:fs";
import path from "node:path";

export type RouteCandidate = {
  filePath: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  routePath: string;
  /** Suggested camelCase name for the defineRoute export */
  suggestedName: string;
};

const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const;
const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "dist", "out", ".cache"]);

/** Match: `export async function GET(` or `export function GET(` */
const METHOD_RE = /^export\s+(?:async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)\s*[(<]/m;

export async function scanRoutes(cwd: string): Promise<RouteCandidate[]> {
  const results: RouteCandidate[] = [];
  await walk(cwd, cwd, results);
  return results;
}

async function walk(
  root: string,
  dir: string,
  results: RouteCandidate[],
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

    for (const method of HTTP_METHODS) {
      const re = new RegExp(
        `^export\\s+(?:async\\s+)?function\\s+${method}\\s*[(<]`,
        "m",
      );
      if (re.test(content)) {
        const routePath = deriveRoutePath(root, filePath);
        results.push({
          filePath,
          method,
          routePath,
          suggestedName: toHandlerName(method, routePath),
        });
      }
    }
  }
}

/**
 * Convert a file path to a URL path:
 *   app/api/v1/chat/route.ts  →  /api/v1/chat
 *   app/api/projects/(list)/route.ts  →  /api/projects
 *   app/api/users/[id]/route.ts  →  /api/users/[id]
 */
function deriveRoutePath(root: string, filePath: string): string {
  const rel = path.relative(root, filePath);
  // Normalise to forward slashes
  const fwd = rel.split(path.sep).join("/");
  // Strip leading "app/" and trailing "/route.{ts,tsx}"
  const stripped = fwd
    .replace(/^app\//, "")
    .replace(/\/route\.(tsx?)$/, "");
  // Remove Next.js route-group segments: (group)
  const cleaned = stripped
    .split("/")
    .filter((seg) => !seg.startsWith("(") || !seg.endsWith(")"))
    .join("/");
  return "/" + cleaned;
}

/** GET /api/users/[id] → getUsers, POST /api/projects → createProject */
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
    .filter((s) => s && !s.startsWith("[") && s !== "api")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1));
  const noun = segments.at(-1) ?? "Resource";
  return p + noun;
}
