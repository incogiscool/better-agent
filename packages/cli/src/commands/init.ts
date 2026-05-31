import { spawnSync } from "node:child_process";
import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { defineCommand } from "citty";
import pc from "picocolors";
import prompts from "prompts";
import { log, fail } from "../logger";
import { readCredential } from "../config/credentials";
import { readProjectConfig, DEFAULT_FILES } from "../config/project";
import { runDiscovery } from "../discovery/run-discovery";
import { generateRoutesFile, generateServerActionsFile, generateActionsTemplate } from "../generator/tool-files";

const VARIANTS = [
  { title: "sidebar     — right-side panel, always visible",   value: "sidebar" },
  { title: "chat-popup  — floating bottom-right button",       value: "chat-popup" },
  { title: "cmd-k       — ⌘K overlay for power users",        value: "cmd-k" },
  { title: "inline-bar  — embedded input bar in the page",    value: "inline-bar" },
] as const;

export const initCommand = defineCommand({
  meta: {
    name: "init",
    description: "First-time setup wizard: install a chat component, scaffold tools, and configure your project.",
  },
  args: {
    cwd: {
      type: "string",
      description: "Working directory (default: current).",
    },
    yes: {
      type: "boolean",
      description: "Accept all defaults without prompting.",
    },
  },
  async run({ args }) {
    const cwd = path.resolve((args.cwd as string | undefined) ?? process.cwd());
    const yes = !!args.yes;

    log.plain(pc.bold("\n  betteragent init\n"));

    // ── Step 1: credentials ────────────────────────────────────────────────
    const credential = await readCredential();
    if (!credential) {
      return fail(
        "Not signed in.",
        "Run `betteragent login --key <secret>` first.",
      );
    }
    log.success(`Signed in as ${pc.bold(credential.projectName)} (${credential.apiUrl})`);

    // ── Step 2: pick a chat component ────────────────────────────────────
    log.plain("");
    let component: string;

    if (yes) {
      component = "sidebar";
      log.info(`Using default component: ${pc.bold(component)}`);
    } else {
      const res = await prompts({
        type: "select",
        name: "component",
        message: "Which chat variant do you want to install?",
        choices: VARIANTS.map((v) => ({ ...v })),
        initial: 0,
      });
      if (!res.component) return fail("Cancelled.");
      component = res.component as string;
    }

    // Run `betteragent add <component>` via the built CLI entry point so the
    // full add flow (manifest fetch, file write, shadcn install) runs.
    log.plain("");
    log.step(`Installing ${pc.bold(component)} component…`);

    const cliEntry = fileURLToPath(new URL("../cli.js", import.meta.url));
    const addResult = spawnSync("node", [cliEntry, "add", component, "--cwd", cwd], {
      stdio: "inherit",
    });
    if (addResult.status !== 0) {
      log.warn("`betteragent add` exited with an error. Continuing…");
    }

    // ── Step 3: discover tools ────────────────────────────────────────────
    log.plain("");
    let wantDiscover = yes;

    if (!yes) {
      const res = await prompts({
        type: "confirm",
        name: "want",
        message: "Scan your project for routes and server actions to expose as tools?",
        initial: true,
      });
      if (res.want === undefined) return fail("Cancelled.");
      wantDiscover = res.want as boolean;
    }

    if (wantDiscover) {
      await runDiscovery({ cwd, yes });
    } else {
      // Write minimal empty tool files so sync has something to load.
      const { config } = await readProjectConfig(cwd);
      const filePaths = {
        routes: path.resolve(cwd, config.files?.routes ?? DEFAULT_FILES.routes),
        serverActions: path.resolve(cwd, config.files?.serverActions ?? DEFAULT_FILES.serverActions),
        actions: path.resolve(cwd, config.files?.actions ?? DEFAULT_FILES.actions),
      };
      for (const [key, dest] of Object.entries(filePaths)) {
        const exists = await fs.access(dest).then(() => true).catch(() => false);
        if (!exists) {
          let content = "";
          if (key === "routes") content = generateRoutesFile(cwd, []);
          else if (key === "serverActions") content = generateServerActionsFile(cwd, []);
          else content = generateActionsTemplate();
          await fs.writeFile(dest, content, "utf-8");
          log.success(`${path.relative(cwd, dest)} ${pc.dim("(empty)")}`);
        }
      }
      log.hint("Run `betteragent discover` when you're ready to expose routes and server actions.");
    }

    // ── Step 4: .env.local ────────────────────────────────────────────────
    log.plain("");
    log.step("Setting up environment variables…");

    const envPath = path.join(cwd, ".env.local");
    let envContent = "";
    try {
      envContent = await fs.readFile(envPath, "utf-8");
    } catch {
      // file doesn't exist yet — will be created
    }

    const lines: string[] = [];

    if (envContent.includes("NEXT_PUBLIC_BETTERAGENT_CLIENT_KEY")) {
      log.info("NEXT_PUBLIC_BETTERAGENT_CLIENT_KEY already set — skipping.");
    } else {
      lines.push(`NEXT_PUBLIC_BETTERAGENT_CLIENT_KEY=${credential.clientKey}`);
      log.success("Added NEXT_PUBLIC_BETTERAGENT_CLIENT_KEY");
    }

    const isLocalDev = credential.apiUrl.includes("localhost") || credential.apiUrl.includes("127.0.0.1");
    let addApiUrl = isLocalDev;

    if (!envContent.includes("NEXT_PUBLIC_BETTERAGENT_API_URL")) {
      if (!yes && !isLocalDev) {
        const res = await prompts({
          type: "confirm",
          name: "want",
          message: `Add NEXT_PUBLIC_BETTERAGENT_API_URL=${credential.apiUrl} for this environment?`,
          initial: false,
        });
        addApiUrl = !!(res.want);
      }

      if (addApiUrl) {
        lines.push(`NEXT_PUBLIC_BETTERAGENT_API_URL=${credential.apiUrl}`);
        log.success(`Added NEXT_PUBLIC_BETTERAGENT_API_URL=${credential.apiUrl}`);
      }
    }

    if (lines.length > 0) {
      const separator = envContent.length > 0 && !envContent.endsWith("\n") ? "\n" : "";
      await fs.writeFile(envPath, envContent + separator + lines.join("\n") + "\n", "utf-8");
    }

    // ── Step 5: betteragent.config.json ───────────────────────────────────
    const configPath = path.join(cwd, "betteragent.config.json");
    const configExists = await fs.access(configPath).then(() => true).catch(() => false);

    if (!configExists) {
      const config = {
        apiUrl: credential.apiUrl,
        files: {
          routes: `./${DEFAULT_FILES.routes}`,
          serverActions: `./${DEFAULT_FILES.serverActions}`,
          actions: `./${DEFAULT_FILES.actions}`,
        },
      };
      await fs.writeFile(configPath, JSON.stringify(config, null, 2) + "\n", "utf-8");
      log.success("betteragent.config.json written");
    } else {
      log.info("betteragent.config.json already exists — skipping.");
    }

    // ── Step 6: next steps ────────────────────────────────────────────────
    log.plain(`
${pc.bold("  ✓ Done! Here's what to do next:")}

  ${pc.dim("1.")} Wrap your app with ${pc.bold("<BetterAgentProvider>")} from ${pc.cyan("betteragent-react")}.
     Import ${pc.yellow("serverActions")} from your tool file so server-action tools are dispatched:

       ${pc.dim("import")} { BetterAgentProvider } ${pc.dim("from")} ${pc.green('"betteragent-react"')};
       ${pc.dim("import")} { serverActions } ${pc.dim("from")} ${pc.green('"./server-actions.betteragent"')};

       ${pc.dim("<")}${pc.cyan("BetterAgentProvider")}
         clientKey={process.env.NEXT_PUBLIC_BETTERAGENT_CLIENT_KEY!}
         apiUrl={process.env.NEXT_PUBLIC_BETTERAGENT_API_URL}
         endUserId={currentUser.id}
         serverActions={serverActions}
         actions={{ ${pc.dim("/* your client action handlers here */")} }}
       ${pc.dim(">")}
         {children}
       ${pc.dim("</")}${pc.cyan("BetterAgentProvider")}${pc.dim(">")}

  ${pc.dim("2.")} Render the installed chat component somewhere in your layout.
     The provider only supplies context — it renders no UI on its own.

  ${pc.dim("3.")} Fill in the ${pc.yellow("schema: z.object({})")} placeholders in your tool files.

  ${pc.dim("4.")} Run ${pc.bold("betteragent sync")} to push your tools to the backend.
`);
  },
});
