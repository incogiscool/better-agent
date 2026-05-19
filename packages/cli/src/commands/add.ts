import { spawnSync } from "node:child_process";
import path from "node:path";
import { defineCommand } from "citty";
import pc from "picocolors";
import { log, fail } from "../logger";
import {
  DEFAULT_API_URL,
  readCredential,
} from "../config/credentials";
import { readProjectConfig } from "../config/project";
import { writeRegistryFiles, type RegistryFile } from "../registry/install";
import { ApiError, createClient } from "../http/client";

type RegistryItem = {
  name: string;
  type: string;
  description: string;
  dependencies: string[];
  registryDependencies: string[];
  files: RegistryFile[];
};

export const addCommand = defineCommand({
  meta: {
    name: "add",
    description: "Install a BetterAgent chat component into your project.",
  },
  args: {
    name: {
      type: "positional",
      required: true,
      description: "Component name: sidebar | chat-popup | command-bar | inline-bar",
    },
    cwd: {
      type: "string",
      description: "Working directory (default: current).",
    },
    overwrite: {
      type: "boolean",
      description: "Overwrite existing files without prompting.",
    },
    "dry-run": {
      type: "boolean",
      description: "Show what would be installed without writing files.",
    },
  },
  async run({ args }) {
    const cwd = path.resolve((args.cwd as string | undefined) ?? process.cwd());
    const componentName = args.name as string;

    const { config } = await readProjectConfig(cwd);
    const credential = await readCredential();
    const apiUrl =
      config.apiUrl ??
      process.env.BETTERAGENT_API_URL ??
      credential?.apiUrl ??
      DEFAULT_API_URL;

    // Build a minimal client (no auth needed for public registry reads).
    const client = createClient({ baseUrl: apiUrl, secretKey: "" });

    log.step(`Fetching ${pc.bold(componentName)} from ${pc.dim(apiUrl)}`);

    let item: RegistryItem;
    try {
      item = await client.get<RegistryItem>(
        `/registry/components/${componentName}`,
      );
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          return fail(
            `Component "${componentName}" not found.`,
            "Available: sidebar · chat-popup · command-bar · inline-bar",
          );
        }
        return fail(`Registry error: ${err.message}`);
      }
      const message = err instanceof Error ? err.message : String(err);
      return fail(`Could not reach ${apiUrl}: ${message}`);
    }

    log.success(
      `Found ${pc.bold(item.name)}: ${item.description}`,
    );

    if (item.files.length === 0) {
      return fail("Registry returned no files.");
    }

    log.plain(
      `\n  ${item.files.length} files · ${item.dependencies.length} deps · ${item.registryDependencies.length} shadcn deps\n`,
    );

    if (args["dry-run"]) {
      log.info("Dry run — skipping file writes and installs.");
      for (const f of item.files) {
        log.dim(`  ${f.path}`);
      }
      return;
    }

    const { written, skipped } = await writeRegistryFiles({
      cwd,
      files: item.files,
      overwrite: !!args.overwrite,
    });

    for (const p of written) {
      log.success(path.relative(cwd, p));
    }
    for (const p of skipped) {
      log.warn(`${path.relative(cwd, p)} already exists — use --overwrite to replace`);
    }

    // Install npm deps
    if (item.dependencies.length > 0) {
      log.step(`Installing npm deps: ${item.dependencies.join(", ")}`);
      const res = spawnSync(
        "npm",
        ["install", "--save", ...item.dependencies],
        { cwd, stdio: "inherit" },
      );
      if (res.status !== 0) {
        log.warn("npm install did not exit cleanly. Run it manually:");
        log.plain(`  npm install ${item.dependencies.join(" ")}`);
      }
    }

    // Install shadcn deps
    if (item.registryDependencies.length > 0) {
      log.step(
        `Installing shadcn primitives: ${item.registryDependencies.join(", ")}`,
      );
      const shadcnBin = locateShadcnBin(cwd);
      if (shadcnBin) {
        const res = spawnSync(
          "npx",
          ["shadcn", "add", ...item.registryDependencies],
          { cwd, stdio: "inherit" },
        );
        if (res.status !== 0) {
          log.warn("shadcn add did not exit cleanly. Run it manually:");
          log.plain(`  npx shadcn add ${item.registryDependencies.join(" ")}`);
        }
      } else {
        log.warn("shadcn not found. Install the primitives manually:");
        log.plain(`  npx shadcn add ${item.registryDependencies.join(" ")}`);
      }
    }

    log.success(`\n${pc.bold(componentName)} installed.`);
    log.hint(
      `Import the theming CSS once in your globals.css:\n  @import "./components/chat/styles/betteragent.css";`,
    );
    log.hint(
      `Wrap your app with <BetterAgentProvider clientKey={…} endUserId={…}> from @betteragent/react.`,
    );
    log.hint(`Then drop in the component:\n  <${toComponentName(componentName)} />`);
  },
});

function locateShadcnBin(cwd: string): boolean {
  try {
    const res = spawnSync("npx", ["shadcn", "--version"], {
      cwd,
      stdio: "pipe",
    });
    return res.status === 0;
  } catch {
    return false;
  }
}

function toComponentName(name: string): string {
  return name
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}
