"use client";

import { CtaSection } from "@/components/landing/CtaSection";
import { Eyebrow, WRAP, SEC, SECHEAD, H2, SUB, DarkCode, CodeChip } from "@/components/landing/primitives";
import { cn } from "@/lib/utils";

// ── Command reference data ────────────────────────────────────

const COMMANDS = [
  {
    name: "login",
    desc: "Authenticate the CLI with a project secret key.",
    usage: "betteragent login [OPTIONS]",
    flags: [
      { flag: "--key <secret>",   desc: "Secret key (ba_secret_…). Prompted if omitted." },
      { flag: "--api-url <url>",  desc: "Override the API URL (or set BETTERAGENT_API_URL)." },
    ],
    example: `$ betteragent login --key ba_secret_abc123
✓ Signed in to acme-app (FREE).
  Credentials saved to ~/.betteragent/credentials.json`,
  },
  {
    name: "init",
    desc: "First-time setup wizard — installs a chat component, scaffolds tool files, writes .env.local.",
    usage: "betteragent init [OPTIONS]",
    flags: [
      { flag: "--cwd <dir>",  desc: "Working directory (default: current)." },
      { flag: "--yes",        desc: "Accept all defaults without prompting." },
    ],
    example: `$ betteragent init
✓ Signed in as acme-app (http://localhost:3000)

? Which chat variant? › sidebar

→ Installing sidebar...
✓ components/chat/sidebar.tsx
✓ components/chat/pieces/...

? Scan your project for tools? › yes
→ Found 8 routes · 4 server actions

✓ Done. Run betteragent sync to push.`,
  },
  {
    name: "discover",
    desc: "Scan your codebase for route handlers and server actions, then generate tool files.",
    usage: "betteragent discover [OPTIONS]",
    flags: [
      { flag: "--cwd <dir>",  desc: "Working directory (default: current)." },
      { flag: "--dry-run",    desc: "Preview generated files without writing." },
      { flag: "--yes",        desc: "Skip confirmation prompts." },
    ],
    example: `$ betteragent discover
✓ Found 11 route handlers · 9 server action exports

? Select routes to expose as tools › (multiselect)
? Select server actions to expose › (multiselect)
? Generate actions.betteragent.ts template? › yes

✓ routes.betteragent.ts (3 routes)
✓ server-actions.betteragent.ts (4 actions)
✓ actions.betteragent.ts (template)`,
  },
  {
    name: "sync",
    desc: "Push your local tool definitions to the BetterAgent backend.",
    usage: "betteragent sync [OPTIONS]",
    flags: [
      { flag: "--cwd <dir>",  desc: "Working directory (default: current)." },
      { flag: "--dry-run",    desc: "Validate without uploading." },
    ],
    example: `$ betteragent sync
Using betteragent.config.json
→ Loading tool files from .
✓ routes.betteragent.ts (3 tools)
✓ server-actions.betteragent.ts (4 tools)
→ Prepared 7 tools for sync.
✓ Synced. +7 added · ~0 updated · -0 removed · =0 unchanged.`,
  },
  {
    name: "add",
    desc: "Install a BetterAgent chat component into your project from the registry.",
    usage: "betteragent add [NAME] [OPTIONS]",
    flags: [
      { flag: "NAME",         desc: "Component: sidebar | chat-popup | cmd-k | inline-bar. Omit for interactive picker." },
      { flag: "--cwd <dir>",  desc: "Working directory (default: current)." },
      { flag: "--overwrite",  desc: "Overwrite existing files without prompting." },
      { flag: "--dry-run",    desc: "Show what would be installed without writing." },
    ],
    example: `$ betteragent add

? Which components do you want to install? (multiselect)
◉ sidebar        Right-side panel, always visible ✓
◯ chat-popup     Floating bottom-right button
◯ cmd-k          ⌘K overlay for power users
◯ inline-bar     Embedded input bar in the page

→ Installing sidebar...
✓ components/chat/sidebar.tsx
✓ components/chat/pieces/ (10 files)
✓ sidebar installed.`,
  },
  {
    name: "remove",
    desc: "Remove installed BetterAgent chat components from your project.",
    usage: "betteragent remove [NAME] [OPTIONS]",
    flags: [
      { flag: "NAME",        desc: "Component name. Omit for interactive picker of installed components." },
      { flag: "--cwd <dir>", desc: "Working directory (default: current)." },
      { flag: "--yes",       desc: "Skip confirmation prompt." },
    ],
    example: `$ betteragent remove
? Which components do you want to remove? (multiselect)
◉ sidebar  10 files · installed 2026-05-22

? Remove sidebar (10 files)? › yes
✓ components/chat/sidebar.tsx
✓ sidebar removed. 10 files deleted.`,
  },
  {
    name: "whoami",
    desc: "Show the currently authenticated project and re-verify credentials.",
    usage: "betteragent whoami",
    flags: [],
    example: `$ betteragent whoami
acme-app
  project:    cmpbilv2g00002rck...
  client key: ba_client_abc123...
  plan:       FREE
  api:        https://api.betteragent.dev`,
  },
  {
    name: "logout",
    desc: "Remove stored credentials from ~/.betteragent/credentials.json.",
    usage: "betteragent logout",
    flags: [],
    example: `$ betteragent logout
✓ Removed credentials at ~/.betteragent/credentials.json`,
  },
] as const;

// ── Page ──────────────────────────────────────────────────────

export default function CliPage() {
  return (
    <>
      <CliHero />
      <CommandReference />
      <ConfigReference />
      <ToolFileReference />
      <CtaSection />
    </>
  );
}

function CliHero() {
  return (
    <section className="pt-24 pb-16 border-b border-border">
      <div className={cn(WRAP, "max-w-[760px]")}>
        <div className="flex flex-col gap-5">
          <Eyebrow>CLI Reference</Eyebrow>
          <h1 className="font-mono font-medium text-[56px] leading-[1.04] tracking-[-0.03em] m-0">
            Everything you need<br />from the terminal.
          </h1>
          <p className={SUB}>One CLI for auth, tool discovery, syncing, and component installation. Works with any Node ≥ 18 project.</p>
          <DarkCode language="bash">
            {"npm i -D @betteragent/cli"}
          </DarkCode>
        </div>
      </div>
    </section>
  );
}

function CommandReference() {
  return (
    <section className={SEC}>
      <div className={WRAP}>
        <div className={SECHEAD}>
          <Eyebrow>Commands</Eyebrow>
          <h2 className={H2}>Eight commands. Full lifecycle coverage.</h2>
        </div>
        <div className="flex flex-col gap-0.5">
          {COMMANDS.map((cmd) => (
            <CommandCard key={cmd.name} cmd={cmd} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CommandCard({ cmd }: { cmd: typeof COMMANDS[number] }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden mb-3">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border bg-muted">
        <span className="font-mono font-semibold text-[15px] text-primary">
          betteragent {cmd.name}
        </span>
        <span className="font-sans text-[13px] text-muted-foreground">{cmd.desc}</span>
      </div>

      <div className={cn("grid gap-0", cmd.flags.length > 0 ? "grid-cols-2" : "grid-cols-1")}>
        {cmd.flags.length > 0 && (
          <div className="p-4 px-5 border-r border-border">
            <div className="font-mono text-[10px] tracking-[0.06em] uppercase text-muted-foreground mb-3">Options</div>
            <div className="flex flex-col gap-2">
              {cmd.flags.map(({ flag, desc }) => (
                <div key={flag} className="grid grid-cols-[auto_1fr] gap-3 items-baseline">
                  <code className="font-mono text-xs text-foreground whitespace-nowrap">{flag}</code>
                  <span className="font-sans text-xs text-muted-foreground leading-relaxed">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 px-5">
          <div className="font-mono text-[10px] tracking-[0.06em] uppercase text-muted-foreground mb-3">Example</div>
          <pre className="m-0 font-mono text-xs leading-[1.7] text-foreground bg-muted border border-border rounded-[var(--radius-md)] p-[12px_14px] overflow-auto">
            {cmd.example}
          </pre>
        </div>
      </div>
    </div>
  );
}

function ConfigReference() {
  return (
    <section className={SEC}>
      <div className={WRAP}>
        <div className={SECHEAD}>
          <Eyebrow>Configuration</Eyebrow>
          <h2 className={H2}>betteragent.config.json</h2>
          <p className={SUB}>Optional per-project config. Place it alongside your tool files. All fields are optional — the CLI falls back to credentials and defaults.</p>
        </div>
        <div className="grid grid-cols-2 gap-6 items-start">
          <DarkCode language="json">
            {`{
  // API URL — overrides BETTERAGENT_API_URL
  // and the URL stored in credentials.
  "apiUrl": "http://localhost:3000",

  // Project ID — override for monorepos
  // where you sync to a specific project.
  "projectId": "cmpbilv2g00002rck...",

  // Custom tool file paths
  "files": {
    "routes":        "./routes.betteragent.ts",
    "serverActions": "./server-actions.betteragent.ts",
    "actions":       "./actions.betteragent.ts"
  },

  // Installed components (managed by CLI)
  "installed": {
    "sidebar": {
      "files": ["components/chat/sidebar.tsx", "..."],
      "installedAt": "2026-05-22T10:00:00.000Z"
    }
  }
}`}
          </DarkCode>
          <div className="flex flex-col gap-4">
            <div className="p-[14px_16px] border border-border rounded-[var(--radius-md)]">
              <div className="font-mono font-semibold text-[13px] mb-1.5">Env var override</div>
              <div className="font-sans text-[13px] text-muted-foreground leading-[1.55]">
                <CodeChip>BETTERAGENT_API_URL</CodeChip> overrides <CodeChip>apiUrl</CodeChip> from config and credentials. Useful in CI/CD.
              </div>
            </div>
            <div className="p-[14px_16px] border border-border rounded-[var(--radius-md)]">
              <div className="font-mono font-semibold text-[13px] mb-1.5">Resolution order</div>
              <div className="font-sans text-[13px] text-muted-foreground leading-[1.55]">
                <ol className="m-0 pl-4 flex flex-col gap-1">
                  <li>CLI flag (<CodeChip>--api-url</CodeChip>)</li>
                  <li>Env var (<CodeChip>BETTERAGENT_API_URL</CodeChip>)</li>
                  <li>betteragent.config.json <CodeChip>apiUrl</CodeChip></li>
                  <li>Stored credentials</li>
                  <li>Production default (<CodeChip>https://api.betteragent.dev</CodeChip>)</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ToolFileReference() {
  return (
    <section className={SEC}>
      <div className={WRAP}>
        <div className={SECHEAD}>
          <Eyebrow>Tool files</Eyebrow>
          <h2 className={H2}>Three files. Full tool coverage.</h2>
          <p className={SUB}>Generated by <CodeChip>betteragent discover</CodeChip> or written by hand. Each exports an array that <CodeChip>betteragent sync</CodeChip> reads and pushes to the backend.</p>
        </div>
        <div className="flex flex-col gap-6">
          {([
            {
              title: "routes.betteragent.ts",
              desc: "HTTP endpoints the agent calls server-to-server.",
              code: `import { z } from "zod";
import { defineRoute } from "@betteragent/next";

export const listProjects = defineRoute({
  name: "listProjects",
  method: "GET",
  path: "/api/projects",
  description: "List projects owned by the current user.",
  schema: z.object({ q: z.string().optional() }),
});

export const routes = [listProjects];`,
            },
            {
              title: "server-actions.betteragent.ts",
              desc: "Next.js Server Actions the agent invokes through the framework.",
              code: `import { z } from "zod";
import { defineServerAction } from "@betteragent/next";

export const createProject = defineServerAction({
  name: "createProject",
  description: "Create a project for the current user.",
  schema: z.object({ name: z.string().min(1) }),
  async handler({ name }) {
    // your normal server action body
  },
});

export const serverActions = [createProject];`,
            },
            {
              title: "actions.betteragent.ts",
              desc: "Browser-side effects — navigation, modals, UI state.",
              code: `import { z } from "zod";
import { defineAction } from "@betteragent/next";

export const openSettings = defineAction({
  name: "openSettings",
  description: "Opens the settings modal.",
  schema: z.object({
    tab: z.enum(["profile", "billing", "team"]).optional(),
  }),
});

export const actions = [openSettings];`,
            },
          ] as const).map(({ title, desc, code }) => (
            <div key={title} className="grid grid-cols-[260px_1fr] gap-6 items-start">
              <div className="pt-1">
                <div className="font-mono font-semibold text-sm mb-2 text-primary">{title}</div>
                <div className="font-sans text-[13px] text-muted-foreground leading-[1.55]">{desc}</div>
              </div>
              <DarkCode language="typescript">{code}</DarkCode>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
