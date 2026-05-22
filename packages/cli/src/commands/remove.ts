import { promises as fs } from "node:fs";
import path from "node:path";
import { defineCommand } from "citty";
import pc from "picocolors";
import prompts from "prompts";
import { log, fail } from "../logger";
import { getInstalled, markRemoved } from "../registry/tracker";

export const removeCommand = defineCommand({
  meta: {
    name: "remove",
    description: "Remove installed BetterAgent chat components from your project.",
  },
  args: {
    name: {
      type: "positional",
      required: false,
      description: "Component name (omit for interactive picker).",
    },
    cwd: {
      type: "string",
      description: "Working directory (default: current).",
    },
    yes: {
      type: "boolean",
      description: "Skip confirmation prompts.",
    },
  },
  async run({ args }) {
    const cwd = path.resolve((args.cwd as string | undefined) ?? process.cwd());
    const yes = !!args.yes;
    const nameArg = args.name as string | undefined;

    const installed = await getInstalled(cwd);
    const installedNames = Object.keys(installed);

    if (installedNames.length === 0) {
      log.info("No components are tracked in betteragent.config.json.");
      log.hint("If you installed components manually, delete their files directly.");
      return;
    }

    let toRemove: string[] = [];

    if (!nameArg) {
      log.plain("");
      const { selected } = await prompts({
        type: "multiselect",
        name: "selected",
        message: "Which components do you want to remove?",
        hint: "Space to toggle, Enter to confirm",
        instructions: false,
        choices: installedNames.map((name) => {
          const entry = installed[name]!;
          const date = new Date(entry.installedAt).toLocaleDateString();
          return {
            title: `${name.padEnd(14)}  ${pc.dim(`${entry.files.length} files · installed ${date}`)}`,
            value: name,
            selected: false,
          };
        }),
      });

      if (!selected || (selected as string[]).length === 0) {
        log.info("Nothing selected.");
        return;
      }
      toRemove = selected as string[];
    } else {
      if (!installed[nameArg]) {
        return fail(
          `"${nameArg}" is not tracked as installed.`,
          `Installed: ${installedNames.join(", ") || "none"}`,
        );
      }
      toRemove = [nameArg];
    }

    // Confirm unless --yes
    if (!yes) {
      log.plain("");
      const fileCount = toRemove.reduce(
        (n, name) => n + (installed[name]?.files.length ?? 0),
        0,
      );
      const { confirm } = await prompts({
        type: "confirm",
        name: "confirm",
        message: `Remove ${toRemove.join(", ")} (${fileCount} files)?`,
        initial: false,
      });
      if (!confirm) {
        log.info("Cancelled.");
        return;
      }
    }

    log.plain("");

    for (const name of toRemove) {
      const entry = installed[name];
      if (!entry) continue;

      let deleted = 0;
      let missing = 0;

      for (const relPath of entry.files) {
        const abs = path.isAbsolute(relPath) ? relPath : path.join(cwd, relPath);
        try {
          await fs.unlink(abs);
          log.success(pc.dim(path.relative(cwd, abs)));
          deleted++;
        } catch (err) {
          if ((err as NodeJS.ErrnoException).code === "ENOENT") {
            log.dim(`  (already gone) ${path.relative(cwd, abs)}`);
            missing++;
          } else {
            log.warn(`Could not delete ${path.relative(cwd, abs)}: ${(err as Error).message}`);
          }
        }
      }

      await markRemoved(cwd, name);
      log.success(
        `${pc.bold(name)} removed. ${deleted} files deleted${missing > 0 ? `, ${missing} already absent` : ""}.`,
      );

      // Clean up empty directories left behind.
      await pruneEmptyDirs(path.join(cwd, "components", "chat"));
    }
  },
});

/**
 * Walk up from a directory, deleting empty directories until we hit the
 * project root or find a non-empty one.
 */
async function pruneEmptyDirs(dir: string): Promise<void> {
  try {
    const entries = await fs.readdir(dir);
    if (entries.length === 0) {
      await fs.rmdir(dir);
      await pruneEmptyDirs(path.dirname(dir));
    }
  } catch {
    // directory doesn't exist or can't be read — stop
  }
}
