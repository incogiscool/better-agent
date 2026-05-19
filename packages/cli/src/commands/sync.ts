import path from "node:path";
import { defineCommand } from "citty";
import pc from "picocolors";
import { log, fail } from "../logger";
import { readCredential } from "../config/credentials";
import { readProjectConfig, resolveFilePaths } from "../config/project";
import { loadTools } from "../loader/load-tools";
import { metadataToSyncTool, type SyncTool } from "../schema/normalize";
import { ApiError, createClient } from "../http/client";

type SyncResponse = {
  ok: true;
  added: number;
  updated: number;
  removed: number;
  unchanged: number;
  total: number;
};

export const syncCommand = defineCommand({
  meta: {
    name: "sync",
    description: "Sync local tool definitions with the BetterAgent backend.",
  },
  args: {
    cwd: {
      type: "string",
      description: "Working directory (defaults to current).",
    },
    "dry-run": {
      type: "boolean",
      description: "Validate tool files locally without contacting the API.",
    },
  },
  async run({ args }) {
    const cwd = path.resolve((args.cwd as string | undefined) ?? process.cwd());

    const credential = await readCredential();
    if (!credential) {
      return fail(
        "Not signed in.",
        "Run `betteragent login --key <secret>` first.",
      );
    }

    const { config, path: configPath } = await readProjectConfig(cwd);
    if (configPath) {
      log.dim(`Using ${path.relative(cwd, configPath)}`);
    }

    const files = resolveFilePaths(cwd, config.files);
    const apiUrl =
      config.apiUrl ?? process.env.BETTERAGENT_API_URL ?? credential.apiUrl;

    log.step(`Loading tool files from ${pc.dim(path.relative(process.cwd(), cwd) || ".")}`);

    let loaded;
    try {
      loaded = await loadTools(files, cwd);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return fail(message);
    }

    if (loaded.files.length === 0) {
      return fail(
        "No tool files found.",
        "Create at least one of: routes.betteragent.ts, server-actions.betteragent.ts, actions.betteragent.ts",
      );
    }

    const tools: SyncTool[] = [];
    for (const file of loaded.files) {
      const rel = path.relative(cwd, file.filePath);
      log.success(
        `${rel} (${file.metadata.length} ${pluralize(file.metadata.length, "tool")})`,
      );
      for (const md of file.metadata) {
        try {
          tools.push(metadataToSyncTool(md));
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return fail(`${rel}: ${message}`);
        }
      }
    }

    if (tools.length === 0) {
      return fail("No tool definitions found in any file.");
    }

    log.step(
      `Prepared ${tools.length} ${pluralize(tools.length, "tool")} for sync.`,
    );

    if (args["dry-run"]) {
      log.info("Dry run — skipping API call.");
      for (const t of tools) {
        log.dim(`  ${formatType(t.type)} ${t.name}`);
      }
      return;
    }

    const client = createClient({
      baseUrl: apiUrl,
      secretKey: credential.secretKey,
    });

    let result: SyncResponse;
    try {
      result = await client.post<SyncResponse>("/api/v1/sync", { tools });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422 && err.data && typeof err.data === "object" && "issues" in err.data) {
          log.error(err.message);
          const issues = (err.data as { issues: Array<{ path: (string | number)[]; message: string }> }).issues;
          for (const issue of issues.slice(0, 10)) {
            log.hint(`${issue.path.join(".") || "request"}: ${issue.message}`);
          }
          process.exit(1);
        }
        return fail(`Sync failed: ${err.message}`);
      }
      const message = err instanceof Error ? err.message : String(err);
      return fail(`Could not reach ${apiUrl}: ${message}`);
    }

    log.success(
      `Synced. ${pc.green(`+${result.added}`)} added · ${pc.yellow(`~${result.updated}`)} updated · ${pc.red(`-${result.removed}`)} removed · ${pc.dim(`=${result.unchanged}`)} unchanged.`,
    );
  },
});

function pluralize(n: number, word: string): string {
  return n === 1 ? word : `${word}s`;
}

function formatType(type: "route" | "client_invocation"): string {
  return type === "route" ? pc.cyan("route") : pc.magenta("action");
}
