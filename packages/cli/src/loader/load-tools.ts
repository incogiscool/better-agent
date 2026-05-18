import { promises as fs } from "node:fs";
import path from "node:path";
import { createJiti } from "jiti";
import { TOOL_METADATA, type ToolMetadata } from "@betteragent/next";
import type { ResolvedFiles } from "../config/project";

export type LoadedToolFile = {
  filePath: string;
  exportName: string;
  metadata: ToolMetadata[];
};

export type LoadedTools = {
  files: LoadedToolFile[];
};

const EXPORTS = [
  { file: "routes", exportName: "routes", expectedKind: "route" as const },
  {
    file: "serverActions",
    exportName: "serverActions",
    expectedKind: "server_action" as const,
  },
  {
    file: "actions",
    exportName: "actions",
    expectedKind: "client_action" as const,
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

export async function loadTools(
  files: ResolvedFiles,
  cwd: string,
): Promise<LoadedTools> {
  const jiti = createJiti(cwd, {
    interopDefault: true,
    moduleCache: false,
    fsCache: false,
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

    const metadata: ToolMetadata[] = [];
    for (let i = 0; i < collection.length; i++) {
      const entry = collection[i];
      const md = extractMetadata(entry);
      if (!md) {
        throw new Error(
          `${path.relative(cwd, filePath)}: \`${target.exportName}[${i}]\` is not a tool definition. Use defineRoute/defineServerAction/defineAction from @betteragent/next.`,
        );
      }
      if (md.kind !== target.expectedKind) {
        throw new Error(
          `${path.relative(cwd, filePath)}: \`${target.exportName}[${i}]\` is a ${md.kind} but this file expects ${target.expectedKind}.`,
        );
      }
      metadata.push(md);
    }

    out.push({
      filePath,
      exportName: target.exportName,
      metadata,
    });
  }

  return { files: out };
}
