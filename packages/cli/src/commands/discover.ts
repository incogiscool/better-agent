import path from "node:path";
import { defineCommand } from "citty";
import pc from "picocolors";
import { log } from "../logger";
import { runDiscovery } from "../discovery/run-discovery";

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

    const wrote = await runDiscovery({ cwd, dryRun, yes });

    if (wrote && !dryRun) {
      log.plain("");
      log.step(`Next: run ${pc.bold("betteragent sync")} to push your tools to the backend.`);
      log.hint(
        "Fill in the schema: z.object({}) placeholders — they tell the agent what parameters each tool accepts.",
      );
    }
  },
});
