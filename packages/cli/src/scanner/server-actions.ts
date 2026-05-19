import { promises as fs } from "node:fs";
import path from "node:path";

export type ServerActionCandidate = {
  filePath: string;
  exportName: string;
  /**
   * true  → export is already a defineServerAction() call; import directly
   * false → export is a plain async function; needs wrapping
   */
  alreadyWrapped: boolean;
};

const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "dist", "out", ".cache"]);
const SKIP_FILE_PATTERNS = [
  /\.betteragent\.(ts|tsx)$/,
  /\.d\.ts$/,
  /\.test\.(ts|tsx)$/,
  /\.spec\.(ts|tsx)$/,
];

/** File starts with a "use server" directive (within the first 3 non-empty lines) */
function hasUseServer(content: string): boolean {
  const lines = content.split("\n");
  let checked = 0;
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    const bare = t.replace(/;$/, "").trim();
    if (bare === '"use server"' || bare === "'use server'") return true;
    checked++;
    if (checked >= 3) break;
  }
  return false;
}

/**
 * Extract exported names and whether they look like defineServerAction calls.
 *
 * Patterns recognised:
 *   export async function foo(        → plain
 *   export function foo(              → plain (may be sync server action)
 *   export const foo = defineServerAction(  → already wrapped
 *   export const foo = async (        → plain
 */
function extractExports(content: string): Array<{ name: string; alreadyWrapped: boolean }> {
  const results: Array<{ name: string; alreadyWrapped: boolean }> = [];
  const seen = new Set<string>();

  // export async function name( or export function name(
  const fnRe = /^export\s+(?:async\s+)?function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*[(<]/gm;
  for (const m of content.matchAll(fnRe)) {
    const name = m[1]!;
    if (!seen.has(name)) {
      seen.add(name);
      results.push({ name, alreadyWrapped: false });
    }
  }

  // export const name = ...
  const constRe = /^export\s+const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=/gm;
  for (const m of content.matchAll(constRe)) {
    const name = m[1]!;
    if (seen.has(name)) continue;
    seen.add(name);

    // Check if the RHS starts with defineServerAction(
    const afterEq = content.slice(m.index! + m[0]!.length).trimStart();
    const alreadyWrapped = afterEq.startsWith("defineServerAction(");
    results.push({ name, alreadyWrapped });
  }

  return results;
}

export async function scanServerActions(cwd: string): Promise<ServerActionCandidate[]> {
  const results: ServerActionCandidate[] = [];
  await walk(cwd, cwd, results);
  return results;
}

async function walk(
  root: string,
  dir: string,
  results: ServerActionCandidate[],
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

    if (!/\.(ts|tsx)$/.test(entry.name)) continue;
    if (SKIP_FILE_PATTERNS.some((re) => re.test(entry.name))) continue;

    const filePath = path.join(dir, entry.name);

    let content: string;
    try {
      content = await fs.readFile(filePath, "utf-8");
    } catch {
      continue;
    }

    if (!hasUseServer(content)) continue;

    const exports = extractExports(content);
    for (const { name, alreadyWrapped } of exports) {
      results.push({ filePath, exportName: name, alreadyWrapped });
    }
  }
}
