import { promises as fs, writeFileSync, mkdtempSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { createJiti } from "jiti";
import { TOOL_METADATA, type ToolMetadata } from "betteragent-next";
import type { ResolvedFiles } from "../config/project";
import { loadAppEnv } from "./load-env";

// Stub for Next.js-only packages that would throw when loaded outside Next.js.
// Written once to a temp file and aliased in jiti so the CLI can load user
// tool files without those packages being installed in the user's project.
function makeServerOnlyStub(): string {
  const dir = mkdtempSync(path.join(os.tmpdir(), "betteragent-stubs-"));
  const stub = path.join(dir, "server-only.js");
  writeFileSync(stub, "export default {};\n");
  return stub;
}

const SERVER_ONLY_STUB = makeServerOnlyStub();

export type LoadedToolFile = {
  filePath: string;
  exportName: string;
  metadata: ToolMetadata[];
};

export type LoadedTools = {
  files: LoadedToolFile[];
};

const EXPORTS = [
  { file: "routes", exportName: "routes", expectedKind: "route" as const, useArray: true },
  {
    file: "serverActions",
    exportName: "serverActions",
    expectedKind: "server_action" as const,
    useArray: false,
  },
  {
    file: "actions",
    exportName: "actions",
    expectedKind: "client_action" as const,
    useArray: true,
  },
];

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function extractMetadata(value: unknown): ToolMetadata | null {
  if (value == null) return null;
  if (typeof value !== "object" && typeof value !== "function") return null;
  const tagged = (value as Record<symbol, unknown>)[TOOL_METADATA];
  if (
    tagged != null &&
    typeof tagged === "object" &&
    "kind" in (tagged as object) &&
    "name" in (tagged as object)
  ) {
    return tagged as ToolMetadata;
  }
  // Plain object that looks like metadata (defineRoute returns the metadata
  // directly so this path catches non-symbol-tagged usages).
  if (
    typeof value === "object" &&
    value !== null &&
    "kind" in value &&
    "name" in value &&
    "schema" in value
  ) {
    return value as ToolMetadata;
  }
  return null;
}

export type LoadToolsOptions = {
  /** Extra env files (from `betteragent.config.json`) applied on top of the app's `.env*` cascade. */
  envFiles?: string[];
};

export async function loadTools(
  files: ResolvedFiles,
  cwd: string,
  options: LoadToolsOptions = {},
): Promise<LoadedTools> {
  // Tool files import real app modules that read process.env at module scope
  // (DB clients, env validation) — load env the way `next dev` would first.
  await loadAppEnv(cwd, options.envFiles);

  const jiti = createJiti(cwd, {
    interopDefault: true,
    moduleCache: false,
    fsCache: true,
    // get-tsconfig under the hood: handles JSONC, `extends` chains, and
    // upward discovery — real-world tsconfigs a hand-rolled reader can't.
    tsconfigPaths: true,
    // Tool files transitively reach .tsx (email templates, UI plumbing);
    // Next.js apps always resolve react/jsx-runtime.
    jsx: { runtime: "automatic" },
    alias: { "server-only": SERVER_ONLY_STUB },
  });

  const out: LoadedToolFile[] = [];

  for (const target of EXPORTS) {
    const filePath = files[target.file as keyof ResolvedFiles];
    if (!(await exists(filePath))) continue;

    let mod: Record<string, unknown>;
    try {
      mod = (await jiti.import(filePath)) as Record<string, unknown>;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(
        `Failed to load ${path.relative(cwd, filePath)}: ${message}`,
      );
    }

    const metadata: ToolMetadata[] = [];

    if (!target.useArray) {
      // "use server" files can't export arrays — scan all named exports instead.
      for (const [exportName, value] of Object.entries(mod)) {
        const md = extractMetadata(value);
        if (!md) continue;
        if (md.kind !== target.expectedKind) {
          throw new Error(
            `${path.relative(cwd, filePath)}: export \`${exportName}\` is a ${md.kind} but this file expects ${target.expectedKind}.`,
          );
        }
        metadata.push(md);
      }
    } else {
      const collection = mod[target.exportName];
      if (collection == null) {
        throw new Error(
          `${path.relative(cwd, filePath)} must export \`${target.exportName}\` (an array of tool definitions).`,
        );
      }
      if (!Array.isArray(collection)) {
        throw new Error(
          `${path.relative(cwd, filePath)}: \`${target.exportName}\` must be an array.`,
        );
      }
      for (let i = 0; i < collection.length; i++) {
        const entry = collection[i];
        const md = extractMetadata(entry);
        if (!md) {
          throw new Error(
            `${path.relative(cwd, filePath)}: \`${target.exportName}[${i}]\` is not a tool definition. Use defineRoute/defineServerAction/defineAction from betteragent-next.`,
          );
        }
        if (md.kind !== target.expectedKind) {
          throw new Error(
            `${path.relative(cwd, filePath)}: \`${target.exportName}[${i}]\` is a ${md.kind} but this file expects ${target.expectedKind}.`,
          );
        }
        metadata.push(md);
      }
    }

    out.push({
      filePath,
      exportName: target.exportName,
      metadata,
    });
  }

  return { files: out };
}
