import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";

const projectConfigSchema = z.object({
  apiUrl: z.string().url().optional(),
  projectId: z.string().min(1).optional(),
  files: z
    .object({
      routes: z.string().optional(),
      serverActions: z.string().optional(),
      actions: z.string().optional(),
    })
    .optional(),
});

export type ProjectConfig = z.infer<typeof projectConfigSchema>;

export const DEFAULT_FILES = {
  routes: "routes.betteragent.ts",
  serverActions: "server-actions.betteragent.ts",
  actions: "actions.betteragent.ts",
} as const;

export type ResolvedFiles = {
  routes: string;
  serverActions: string;
  actions: string;
};

const CONFIG_FILENAME = "betteragent.config.json";

export async function readProjectConfig(
  cwd: string = process.cwd(),
): Promise<{ config: ProjectConfig; path: string | null }> {
  const configPath = path.join(cwd, CONFIG_FILENAME);
  try {
    const raw = await fs.readFile(configPath, "utf-8");
    const parsed = projectConfigSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      throw new Error(
        `Invalid ${CONFIG_FILENAME}: ${parsed.error.issues[0]?.message ?? "validation failed"}`,
      );
    }
    return { config: parsed.data, path: configPath };
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      return { config: {}, path: null };
    }
    throw err;
  }
}

export function resolveFilePaths(
  cwd: string,
  files: ProjectConfig["files"],
): ResolvedFiles {
  return {
    routes: path.resolve(cwd, files?.routes ?? DEFAULT_FILES.routes),
    serverActions: path.resolve(
      cwd,
      files?.serverActions ?? DEFAULT_FILES.serverActions,
    ),
    actions: path.resolve(cwd, files?.actions ?? DEFAULT_FILES.actions),
  };
}
