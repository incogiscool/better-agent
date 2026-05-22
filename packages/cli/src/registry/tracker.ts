import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";

const installedEntrySchema = z.object({
  files: z.array(z.string()),
  installedAt: z.string(),
});

const configSchema = z.object({
  apiUrl: z.string().optional(),
  projectId: z.string().optional(),
  files: z.object({
    routes: z.string().optional(),
    serverActions: z.string().optional(),
    actions: z.string().optional(),
  }).optional(),
  installed: z.record(z.string(), installedEntrySchema).optional(),
});

export type InstalledEntry = {
  files: string[];
  installedAt: string;
};

export type InstalledMap = Record<string, InstalledEntry>;

const CONFIG_FILENAME = "betteragent.config.json";

async function readConfig(cwd: string): Promise<z.infer<typeof configSchema>> {
  try {
    const raw = await fs.readFile(path.join(cwd, CONFIG_FILENAME), "utf-8");
    const parsed = configSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : {};
  } catch {
    return {};
  }
}

async function writeConfig(cwd: string, data: z.infer<typeof configSchema>): Promise<void> {
  await fs.writeFile(
    path.join(cwd, CONFIG_FILENAME),
    JSON.stringify(data, null, 2) + "\n",
    "utf-8",
  );
}

export async function getInstalled(cwd: string): Promise<InstalledMap> {
  const config = await readConfig(cwd);
  return config.installed ?? {};
}

export async function markInstalled(
  cwd: string,
  name: string,
  files: string[],
): Promise<void> {
  const config = await readConfig(cwd);
  config.installed = config.installed ?? {};
  config.installed[name] = {
    files: files.map((f) => path.relative(cwd, f)),
    installedAt: new Date().toISOString(),
  };
  await writeConfig(cwd, config);
}

export async function markRemoved(cwd: string, name: string): Promise<void> {
  const config = await readConfig(cwd);
  if (!config.installed) return;
  delete config.installed[name];
  await writeConfig(cwd, config);
}
