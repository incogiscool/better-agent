import { promises as fs } from "node:fs";
import path from "node:path";
import { defineCommand } from "citty";
import pc from "picocolors";
import prompts from "prompts";
import { log, fail } from "../logger";
import { readProjectConfig, DEFAULT_FILES } from "../config/project";
import { scanRoutes, type RouteCandidate } from "../scanner/routes";
import { scanServerActions, type ServerActionCandidate } from "../scanner/server-actions";
import {
  generateRoutesFile,
  generateServerActionsFile,
  generateActionsTemplate,
} from "../generator/tool-files";

export const discoverCommand = defineCommand({
  meta: {
    name: "discover",
    description: "Scan your project for tool candidates and generate tool files.",
  },
  args: {
    cwd: {
      type: "string",
      description: "Working directory (default: current).",
    },
    "dry-run": {
      type: "boolean",
      description: "Preview what would be generated without writing files.",
    },
    yes: {
      type: "boolean",
      description: "Skip confirmation prompts and overwrite existing files.",
    },
  },
  async run({ args }) {
    const cwd = path.resolve((args.cwd as string | undefined) ?? process.cwd());
    const dryRun = !!args["dry-run"];
    const yes = !!args.yes;

    log.step(`Scanning ${pc.dim(cwd)}…`);

    const [routes, serverActions] = await Promise.all([
      scanRoutes(cwd),
      scanServerActions(cwd),
    ]);

    if (routes.length === 0 && serverActions.length === 0) {
      log.warn("No route handlers or server actions found.");
      log.hint(
        "Make sure you're running this from a Next.js project root with app/api/ routes or 'use server' files.",
      );
      return;
    }

    log.success(
      `Found ${pc.bold(String(routes.length))} route handlers · ${pc.bold(String(serverActions.length))} server action exports`,
    );

    // --- Route selection ---
    let selectedRoutes: RouteCandidate[] = [];

    if (routes.length > 0) {
      log.plain("");
      const routeChoices = routes.map((r) => ({
        title: `${pc.cyan(r.method.padEnd(7))} ${r.routePath} ${pc.dim(path.relative(cwd, r.filePath))}`,
        value: r,
        selected: true,
      }));

      const { picked } = await prompts({
        type: "multiselect",
        name: "picked",
        message: "Select route handlers to expose as tools",
        choices: routeChoices,
        hint: "Space to toggle, Enter to confirm",
        instructions: false,
      });

      if (picked === undefined) fail("Cancelled.");
      selectedRoutes = picked as RouteCandidate[];
    }

    // --- Server action selection ---
    let selectedActions: ServerActionCandidate[] = [];

    if (serverActions.length > 0) {
      log.plain("");
      const actionChoices = serverActions.map((a) => ({
        title: `${pc.bold(a.exportName)} ${pc.dim(path.relative(cwd, a.filePath))} ${a.alreadyWrapped ? pc.green("[wrapped]") : ""}`,
        value: a,
        selected: !a.exportName.startsWith("_"),
      }));

      const { picked } = await prompts({
        type: "multiselect",
        name: "picked",
        message: "Select server actions to expose as tools",
        choices: actionChoices,
        hint: "Space to toggle, Enter to confirm",
        instructions: false,
      });

      if (picked === undefined) fail("Cancelled.");
      selectedActions = picked as ServerActionCandidate[];
    }

    // --- Client actions template ---
    log.plain("");
    const { includeActions } = await prompts({
      type: "confirm",
      name: "includeActions",
      message: "Generate actions.betteragent.ts template for client-side actions?",
      initial: true,
    });

    if (includeActions === undefined) fail("Cancelled.");

    // --- Determine output paths ---
    const { config } = await readProjectConfig(cwd);
    const filePaths = {
      routes: path.resolve(
        cwd,
        config.files?.routes ?? DEFAULT_FILES.routes,
      ),
      serverActions: path.resolve(
        cwd,
        config.files?.serverActions ?? DEFAULT_FILES.serverActions,
      ),
      actions: path.resolve(
        cwd,
        config.files?.actions ?? DEFAULT_FILES.actions,
      ),
    };

    const toWrite: Array<{ dest: string; content: string; label: string; count: string }> = [];

    if (selectedRoutes.length > 0 || routes.length === 0) {
      toWrite.push({
        dest: filePaths.routes,
        content: generateRoutesFile(cwd, selectedRoutes),
        label: "routes.betteragent.ts",
        count: `${selectedRoutes.length} routes`,
      });
    }

    if (selectedActions.length > 0 || serverActions.length === 0) {
      toWrite.push({
        dest: filePaths.serverActions,
        content: generateServerActionsFile(cwd, selectedActions),
        label: "server-actions.betteragent.ts",
        count: `${selectedActions.length} actions`,
      });
    }

    if (includeActions) {
      toWrite.push({
        dest: filePaths.actions,
        content: generateActionsTemplate(),
        label: "actions.betteragent.ts",
        count: "template",
      });
    }

    if (toWrite.length === 0) {
      log.info("Nothing to write — no tools selected.");
      return;
    }

    // --- Overwrite checks ---
    log.plain("");
    for (const item of toWrite) {
      const exists = await fs
        .access(item.dest)
        .then(() => true)
        .catch(() => false);

      if (exists && !yes) {
        const { overwrite } = await prompts({
          type: "confirm",
          name: "overwrite",
          message: `${path.relative(cwd, item.dest)} already exists. Overwrite?`,
          initial: false,
        });
        if (!overwrite) {
          log.warn(`Skipped ${path.relative(cwd, item.dest)}`);
          item.content = ""; // mark as skip
        }
      }
    }

    // --- Write files ---
    if (dryRun) {
      log.info("Dry run — no files written.");
      for (const item of toWrite) {
        if (!item.content) continue;
        log.plain(`\n${pc.bold(item.label)} (${item.count}):`);
        item.content.split("\n").forEach((l) => log.dim("  " + l));
      }
      return;
    }

    for (const item of toWrite) {
      if (!item.content) continue;
      await fs.writeFile(item.dest, item.content, "utf-8");
      log.success(
        `${path.relative(cwd, item.dest)} ${pc.dim(`(${item.count})`)}`,
      );
    }

    log.plain("");
    log.step(
      `Next: run ${pc.bold("betteragent sync")} to push your tools to the backend.`,
    );
    log.hint(
      "Fill in the schema: z.object({}) placeholders before syncing — they tell the agent what parameters each tool accepts.",
    );
  },
});
