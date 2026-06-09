import { spawnSync } from "node:child_process";
import path from "node:path";
import { defineCommand } from "citty";
import pc from "picocolors";
import prompts from "prompts";
import { log, fail } from "../logger";
import { DEFAULT_API_URL, readCredential } from "../config/credentials";
import { readProjectConfig } from "../config/project";
import { writeRegistryFiles } from "../registry/install";
import { makeRegistryClient, type RegistryComponent } from "../registry/client";
import { markInstalled, getInstalled } from "../registry/tracker";

export const addCommand = defineCommand({
  meta: {
    name: "add",
    description: "Install BetterAgent chat components into your project.",
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
    overwrite: {
      type: "boolean",
      description: "Overwrite existing files without prompting.",
    },
    "dry-run": {
      type: "boolean",
      description: "Show what would be installed without writing files.",
    },
    "api-url": {
      type: "string",
      description: "API URL override (or set BETTERAGENT_API_URL).",
    },
  },
  async run({ args }) {
    const cwd = path.resolve((args.cwd as string | undefined) ?? process.cwd());
    const overwrite = !!args.overwrite;
    const dryRun = !!args["dry-run"];

    const { config } = await readProjectConfig(cwd);
    const credential = await readCredential();
    const apiUrl =
      (args["api-url"] as string | undefined) ??
      process.env.BETTERAGENT_API_URL ??
      config.apiUrl ??
      credential?.apiUrl ??
      DEFAULT_API_URL;

    const registry = makeRegistryClient(apiUrl);
    const installed = await getInstalled(cwd);

    let toInstall: string[] = [];
    const nameArg = args.name as string | undefined;

    if (!nameArg) {
      log.step("Fetching component list from " + apiUrl + "...");
      let index;
      try {
        index = await registry.fetchIndex();
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return fail("Could not reach registry: " + message);
      }

      if (index.items.length === 0) return fail("Registry returned no components.");
      log.plain("");

      const { selected } = await prompts({
        type: "multiselect",
        name: "selected",
        message: "Which components do you want to install?",
        hint: "Space to toggle, Enter to confirm",
        instructions: false,
        choices: index.items.map((item) => ({
          title: formatChoice(item.name, item.description, installed[item.name] != null),
          value: item.name,
          selected: false,
        })),
      });

      if (!selected || (selected as string[]).length === 0) {
        log.info("Nothing selected.");
        return;
      }
      toInstall = selected as string[];
    } else {
      toInstall = [nameArg];
    }

    log.plain("");
    for (const name of toInstall) {
      await installOne({ name, cwd, overwrite, dryRun, registry, installed });
      log.plain("");
    }
  },
});

export async function installOne({
  name, cwd, overwrite, dryRun, registry, installed,
}: {
  name: string;
  cwd: string;
  overwrite: boolean;
  dryRun: boolean;
  registry: ReturnType<typeof makeRegistryClient>;
  installed: Record<string, unknown>;
}) {
  const isUpdate = installed[name] != null;
  log.step(isUpdate ? "Updating " + name + "..." : "Installing " + name + "...");

  let item: RegistryComponent;
  try {
    item = await registry.fetchComponent(name);
  } catch (err) {
    log.error(err instanceof Error ? err.message : String(err));
    return;
  }

  if (item.files.length === 0) { log.warn(name + ": no files in registry — skipping."); return; }

  log.dim("  " + item.files.length + " files · " + item.dependencies.length + " deps · " + item.registryDependencies.length + " shadcn deps");

  if (dryRun) {
    log.info("Dry run — no files written.");
    for (const f of item.files) log.dim("  " + f.path);
    return;
  }

  const { written, skipped } = await writeRegistryFiles({ cwd, files: item.files, overwrite });
  for (const p of written) log.success(path.relative(cwd, p));
  for (const p of skipped) log.warn(path.relative(cwd, p) + " already exists — use --overwrite to replace");

  await markInstalled(cwd, name, item.files.map((f) => path.join(cwd, f.path)));

  if (item.dependencies.length > 0) {
    log.step("Installing npm deps: " + item.dependencies.join(", "));
    const r = spawnSync("npm", ["install", "--save", ...item.dependencies], { cwd, stdio: "inherit" });
    if (r.status !== 0) { log.warn("npm install failed. Run manually:"); log.plain("  npm install " + item.dependencies.join(" ")); }
  }

  if (item.registryDependencies.length > 0) {
    log.step("Installing shadcn primitives: " + item.registryDependencies.join(", "));
    if (locateShadcnBin(cwd)) {
      const r = spawnSync("npx", ["shadcn", "add", ...item.registryDependencies], { cwd, stdio: "inherit" });
      if (r.status !== 0) { log.warn("shadcn add failed. Run manually:"); log.plain("  npx shadcn add " + item.registryDependencies.join(" ")); }
    } else {
      log.warn("shadcn not found. Run manually:"); log.plain("  npx shadcn add " + item.registryDependencies.join(" "));
    }
  }

  log.success(name + (isUpdate ? " updated." : " installed."));
  if (!isUpdate) {
    log.hint("Import theming once:\n  @import \"./components/chat/styles/betteragent.css\";");
    log.hint("Drop in the component:\n  <" + toComponentName(name) + " />");
  }
}

function formatChoice(name: string, description: string, isInstalled: boolean): string {
  return name.padEnd(14) + "  " + pc.dim(description) + (isInstalled ? pc.green(" ✓") : "");
}

function locateShadcnBin(cwd: string): boolean {
  try { return spawnSync("npx", ["shadcn", "--version"], { cwd, stdio: "pipe" }).status === 0; }
  catch { return false; }
}

function toComponentName(name: string): string {
  return name.split("-").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join("");
}
