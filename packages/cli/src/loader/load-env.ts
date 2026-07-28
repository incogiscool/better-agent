import { promises as fs } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { log } from "../logger";

type NextEnvModule = {
  loadEnvConfig: (
    dir: string,
    dev?: boolean,
    logger?: { info: (...args: unknown[]) => void; error: (...args: unknown[]) => void },
    forceReload?: boolean,
    onReload?: (envFilePath: string) => void,
  ) => unknown;
  processEnv: (
    loadedEnvFiles: Array<{ path: string; contents: string; env: Record<string, string> }>,
    dir?: string,
    logger?: { info: (...args: unknown[]) => void; error: (...args: unknown[]) => void },
    forceReload?: boolean,
    onReload?: (envFilePath: string) => void,
  ) => unknown;
};

const quietLog = {
  info: () => {},
  error: (...args: unknown[]) => log.warn(args.map(String).join(" ")),
};

/**
 * Resolve `@next/env` through the target app's own `next` install. Two hops:
 * app dir → `next` package → `@next/env` (a dependency of `next`). This works
 * across hoisted (npm), isolated (pnpm, bun) and monorepo layouts without the
 * CLI depending on any specific Next.js version.
 */
function resolveNextEnv(cwd: string): NextEnvModule | null {
  try {
    const appRequire = createRequire(path.join(cwd, "noop.js"));
    let nextEntry: string;
    try {
      nextEntry = appRequire.resolve("next/package.json");
    } catch {
      nextEntry = appRequire.resolve("next");
    }
    return createRequire(nextEntry)("@next/env") as NextEnvModule;
  } catch {
    return null;
  }
}

/** Minimal dotenv-style parser used only when `@next/env` can't be resolved. */
function parseEnvContents(contents: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of contents.split(/\r?\n/)) {
    const match = /^\s*(?:export\s+)?([\w.-]+)\s*=\s*(.*)?$/.exec(line);
    const key = match?.[1];
    if (!key) continue;
    let value = (match[2] ?? "").trim();
    const quoted = /^(['"`])([\s\S]*?)\1/.exec(value);
    if (quoted) {
      value = quoted[2] ?? "";
      if (quoted[1] === '"') value = value.replace(/\\n/g, "\n").replace(/\\r/g, "\r");
    } else {
      value = value.replace(/\s+#.*$/, "").trim();
    }
    out[key] = value;
  }
  return out;
}

async function readIfFile(filePath: string): Promise<string | null> {
  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) return null;
    return await fs.readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}

/**
 * Load environment variables the way `next dev` would before importing any of
 * the target app's modules. Tool files transitively import real app code
 * (DB clients, env validation, auth config) that reads `process.env` at module
 * scope and throws when expected vars are missing.
 *
 * Prefers the app's own `@next/env` (identical file order, dotenv-expand
 * semantics); falls back to a minimal parser over the same file list.
 * `extraEnvFiles` (from `betteragent.config.json`'s `env` field) covers
 * monorepos that keep `.env` outside the app directory; already-set variables
 * are never overridden.
 */
export async function loadAppEnv(cwd: string, extraEnvFiles: string[] = []): Promise<void> {
  // t3-env convention: metadata sync never calls handlers, so strict env
  // validation modules only get in the way here.
  process.env.SKIP_ENV_VALIDATION ??= "1";

  const onLoad = (envFilePath: string) => log.dim(`  env: ${envFilePath}`);
  const nextEnv = resolveNextEnv(cwd);

  if (nextEnv) {
    nextEnv.loadEnvConfig(cwd, true, quietLog, false, onLoad);
    if (extraEnvFiles.length > 0) {
      const loaded: Array<{ path: string; contents: string; env: Record<string, string> }> = [];
      for (const file of extraEnvFiles) {
        const abs = path.resolve(cwd, file);
        const contents = await readIfFile(abs);
        if (contents == null) {
          log.warn(`env file not found: ${file}`);
          continue;
        }
        loaded.push({ path: abs, contents, env: {} });
      }
      // forceReload: loadEnvConfig above set __NEXT_PROCESSED_ENV, which would
      // make a plain processEnv call a no-op.
      if (loaded.length > 0) nextEnv.processEnv(loaded, cwd, quietLog, true, onLoad);
    }
    return;
  }

  // No resolvable `next` install — mirror Next's dev-mode file order manually.
  const conventional = [".env.development.local", ".env.local", ".env.development", ".env"];
  const files = [...extraEnvFiles, ...conventional].map((f) => path.resolve(cwd, f));
  for (const file of files) {
    const contents = await readIfFile(file);
    if (contents == null) continue;
    const parsed = parseEnvContents(contents);
    let applied = false;
    for (const [key, value] of Object.entries(parsed)) {
      if (process.env[key] !== undefined) continue;
      process.env[key] = value;
      applied = true;
    }
    if (applied) onLoad(path.relative(cwd, file));
  }
}
