import { promises as fs } from "node:fs";
import path from "node:path";

export type RegistryFile = {
  path: string;
  content: string;
  type: string;
};

export type InstallOptions = {
  cwd: string;
  files: RegistryFile[];
  overwrite?: boolean;
};

/**
 * Resolve where to write registry files. Prefers `src/` if it exists
 * (common in Next.js projects), falls back to the project root.
 */
export async function resolveTargetRoot(cwd: string): Promise<string> {
  try {
    await fs.access(path.join(cwd, "src"));
    return cwd;
  } catch {
    return cwd;
  }
}

export async function writeRegistryFiles(
  opts: InstallOptions,
): Promise<{ written: string[]; skipped: string[] }> {
  const written: string[] = [];
  const skipped: string[] = [];

  for (const file of opts.files) {
    const dest = path.join(opts.cwd, file.path);
    const dir = path.dirname(dest);

    const exists = await fs
      .access(dest)
      .then(() => true)
      .catch(() => false);

    if (exists && !opts.overwrite) {
      skipped.push(dest);
      continue;
    }

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(dest, file.content, "utf-8");
    written.push(dest);
  }

  return { written, skipped };
}
