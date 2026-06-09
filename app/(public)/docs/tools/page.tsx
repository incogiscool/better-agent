"use client";

import Link from "next/link";
import { CtaSection } from "@/components/landing/CtaSection";
import { Eyebrow, WRAP, SEC, SECHEAD, H2, SUB, DarkCode, CodeChip } from "@/components/landing/primitives";
import { cn } from "@/lib/utils";

export default function ToolsPage() {
  return (
    <>
      <ToolsHero />
      <WhatAreToolFilesSection />
      <RouteToolsSection />
      <ServerActionsSection />
      <ClientActionsSection />
      <DescriptionTipsSection />
      <SyncWorkflowSection />
      <CtaSection />
    </>
  );
}

function ToolsHero() {
  return (
    <section className="pt-24 pb-16 border-b border-border">
      <div className={cn(WRAP, "max-w-[760px]")}>
        <div className="flex flex-col gap-5">
          <Eyebrow>Tool Files</Eyebrow>
          <h1 className="font-mono font-medium text-[56px] leading-[1.04] tracking-[-0.03em] m-0">
            Three files.<br />Full tool coverage.
          </h1>
          <p className={SUB}>
            Tool files are how the agent learns what it can do in your app. Define HTTP routes,
            server actions, and browser-side effects — then sync once. The agent calls them automatically.
          </p>
        </div>
      </div>
    </section>
  );
}

function WhatAreToolFilesSection() {
  return (
    <section className={SEC}>
      <div className={WRAP}>
        <div className={SECHEAD}>
          <Eyebrow>Overview</Eyebrow>
          <h2 className={H2}>What are tool files?</h2>
          <p className={SUB}>
            Tool files declare what capabilities your agent has. Without them, the agent can only respond
            in text — it can{"’"}t actually do anything in your app.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            {
              file: "routes.betteragent.ts",
              desc: "HTTP endpoints the agent calls server-to-server via fetch. Good for REST APIs, data fetching, and mutations that already have route handlers.",
            },
            {
              file: "server-actions.betteragent.ts",
              desc: "Next.js Server Actions the agent calls through your provider. The SDK dispatches them from the browser, but they execute on the server with full session context — good for form mutations, database writes, and authenticated work.",
            },
            {
              file: "actions.betteragent.ts",
              desc: "Browser-side effects the agent triggers on the client — opening modals, navigating, refreshing state. These run in the user's browser, not the server.",
            },
          ].map(({ file, desc }) => (
            <div key={file} className="p-5 border border-border rounded-lg flex flex-col gap-2">
              <div className="font-mono font-semibold text-[12px] text-primary">{file}</div>
              <p className="font-sans text-[13px] text-muted-foreground leading-[1.55] m-0">{desc}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 p-5 border border-border rounded-lg bg-muted/30">
          <div className="font-mono font-semibold text-[13px]">Discovery vs. manual authoring</div>
          <p className="font-sans text-[13px] text-muted-foreground leading-[1.55] m-0">
            Run <CodeChip>betteragent discover</CodeChip> to scaffold the three files with one entry per
            selected handler and empty Zod schemas. Fill in the descriptions and schemas by hand, or write
            tools from scratch for things discovery can{"’"}t detect (e.g. third-party API calls). Both
            approaches produce the same file format — there{"’"}s no lock-in to either.
          </p>
        </div>
      </div>
    </section>
  );
}

function RouteToolsSection() {
  return (
    <section className={SEC}>
      <div className={WRAP}>
        <div className={SECHEAD}>
          <Eyebrow>routes.betteragent.ts</Eyebrow>
          <h2 className={H2}>HTTP routes as agent tools.</h2>
          <p className={SUB}>
            Use <CodeChip>defineRoute</CodeChip> from <CodeChip>betteragent-next</CodeChip> to expose any HTTP
            endpoint as a tool. The chat engine performs a server-to-server request using the{" "}
            <CodeChip>baseUrl</CodeChip> you configured in your project settings.
          </p>
        </div>
        <div className="grid grid-cols-[1fr_320px] gap-8 items-start">
          <DarkCode language="typescript">
            {`import { defineRoute } from "betteragent-next";
import { z } from "zod";

// GET with optional query params
export const searchProducts = defineRoute({
  name: "searchProducts",
  method: "GET",
  path: "/api/products",
  description:
    "Search the product catalogue. Use when the user asks to find, " +
    "list, or browse products.",
  schema: z.object({
    q:        z.string().optional().describe("Search query"),
    category: z.string().optional().describe("Filter by category slug"),
    limit:    z.number().int().min(1).max(50).optional(),
  }),
});

// POST with a body
export const createOrder = defineRoute({
  name: "createOrder",
  method: "POST",
  path: "/api/orders",
  description:
    "Place a new order for the current user. Only call this after " +
    "explicitly confirming the items and total with the user.",
  schema: z.object({
    items: z.array(
      z.object({
        productId: z.string(),
        quantity:  z.number().int().min(1),
      }),
    ),
  }),
});

export const routes = [searchProducts, createOrder];`}
          </DarkCode>
          <div className="flex flex-col gap-3">
            {[
              { field: "name", desc: "Unique identifier used in tool calls. camelCase recommended." },
              { field: "method", desc: "HTTP method: GET · POST · PUT · PATCH · DELETE." },
              { field: "path", desc: "Path appended to your project's baseUrl setting." },
              { field: "description", desc: "Natural-language description the agent uses to decide when to call this tool." },
              { field: "schema", desc: "Zod schema for the input. GET params become query string; POST/PUT become JSON body." },
            ].map(({ field, desc }) => (
              <div key={field} className="p-[12px_14px] border border-border rounded-lg">
                <div className="font-mono text-[12px] text-primary mb-1">{field}</div>
                <p className="font-sans text-[12px] text-muted-foreground leading-[1.5] m-0">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ServerActionsSection() {
  return (
    <section className={SEC}>
      <div className={WRAP}>
        <div className={SECHEAD}>
          <Eyebrow>server-actions.betteragent.ts</Eyebrow>
          <h2 className={H2}>Server actions as agent tools.</h2>
          <p className={SUB}>
            Use <CodeChip>defineServerAction</CodeChip> to expose a Next.js Server Action as a tool.
            The React SDK dispatches calls from the browser — the handler runs on the server via the normal
            server-action mechanism, so session context and auth are available as usual.
          </p>
        </div>
        <div className="grid grid-cols-[1fr_300px] gap-8 items-start">
          <DarkCode language="typescript">
            {`"use server";
// ^ Required. This file is a "use server" module — Next.js compiles
// each exported async function as a callable server action.

import { defineServerAction } from "betteragent-next";
import { z } from "zod";

// Import handlers from your own "use server" files.
import { updateProfile } from "@/app/actions/profile";
import { sendInvoice }  from "@/app/actions/billing";

// Export each action individually — no array export.
// The generated AgentProvider imports this file automatically.

export const updateDisplayName = defineServerAction({
  name: "updateDisplayName",
  description:
    "Update the user's display name. Use when the user explicitly " +
    "asks to change their name.",
  schema: z.object({
    name: z.string().min(1).max(100),
  }),
  handler: updateProfile,
});

export const sendUserInvoice = defineServerAction({
  name: "sendUserInvoice",
  description:
    "Re-send an invoice to the user's email address. " +
    "Only call this when explicitly requested.",
  schema: z.object({
    invoiceId: z.string(),
  }),
  handler: sendInvoice,
});`}
          </DarkCode>
          <div className="flex flex-col gap-3">
            <div className="p-[12px_14px] border border-border rounded-lg">
              <div className="font-mono text-[12px] text-primary mb-1">{"\"use server\""} required</div>
              <p className="font-sans text-[12px] text-muted-foreground leading-[1.5] m-0">
                The file must start with <CodeChip>{"\"use server\""}</CodeChip>. This makes each exported
                async function a real Next.js server action reference, callable from the browser.
              </p>
            </div>
            <div className="p-[12px_14px] border border-border rounded-lg">
              <div className="font-mono text-[12px] text-primary mb-1">handler</div>
              <p className="font-sans text-[12px] text-muted-foreground leading-[1.5] m-0">
                Must be imported from one of your own <CodeChip>{"\"use server\""}</CodeChip> files —
                not defined inline. Input is Zod-validated before the handler is called.
              </p>
            </div>
            <div className="p-[12px_14px] border border-border rounded-lg">
              <div className="font-mono text-[12px] text-primary mb-1">No array export</div>
              <p className="font-sans text-[12px] text-muted-foreground leading-[1.5] m-0">
                Export each action individually. <CodeChip>{"\"use server\""}</CodeChip> files cannot
                export arrays — the generated <CodeChip>AgentProvider</CodeChip> uses{" "}
                <CodeChip>{"import *"}</CodeChip> to pick them all up automatically.
              </p>
            </div>
            <div className="p-[12px_14px] border border-border rounded-lg">
              <div className="font-mono text-[12px] text-primary mb-1">Return value</div>
              <p className="font-sans text-[12px] text-muted-foreground leading-[1.5] m-0">
                Whatever the handler returns is serialised and sent back to the agent as the tool
                result. Keep it concise — the agent uses it to decide the next step.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ClientActionsSection() {
  return (
    <section className={SEC}>
      <div className={WRAP}>
        <div className={SECHEAD}>
          <Eyebrow>actions.betteragent.ts</Eyebrow>
          <h2 className={H2}>Browser actions as agent tools.</h2>
          <p className={SUB}>
            Use <CodeChip>defineAction</CodeChip> to declare pure client-side effects — opening modals,
            navigating, refreshing UI state. The agent emits an <CodeChip>action_call</CodeChip> event;
            the React SDK dispatches it locally in the user{"’"}s browser.
          </p>
        </div>
        <div className="grid grid-cols-[1fr_1fr] gap-8 items-start">
          <div className="flex flex-col gap-6">
            <DarkCode language="typescript">
              {`// actions.betteragent.ts
import { defineAction } from "betteragent-next";
import { z } from "zod";

export const openModal = defineAction({
  name: "openModal",
  description:
    "Open a dialog or modal panel. Use when the user " +
    "asks to edit or view something in a dialog.",
  schema: z.object({
    name: z.enum(["settings", "profile", "billing"]),
  }),
});

export const navigate = defineAction({
  name: "navigate",
  description:
    "Navigate to a different page in the app. Only use " +
    "for navigation the user explicitly requests.",
  schema: z.object({
    path: z.string().describe("App path, e.g. /dashboard/projects"),
  }),
});

export const actions = [openModal, navigate];`}
            </DarkCode>
          </div>
          <div className="flex flex-col gap-6">
            <p className="font-sans text-[13px] text-muted-foreground leading-[1.55] m-0">
              Register handlers by adding an <CodeChip>actions</CodeChip> prop to the generated{" "}
              <CodeChip>AgentProvider</CodeChip> in{" "}
              <CodeChip>components/betteragent-provider.tsx</CodeChip> — a map from action name to
              handler function.
            </p>
            <DarkCode language="tsx">
              {`// components/betteragent-provider.tsx
"use client";

import { BetterAgentProvider } from "betteragent-react";
import * as serverActions from "@/server-actions.betteragent";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AgentProvider({ children, ...props }) {
  const router = useRouter();
  const [dialog, setDialog] = useState<string | null>(null);

  return (
    <BetterAgentProvider
      {...props}
      serverActions={serverActions}
      actions={{
        openModal: ({ name }) => setDialog(name),
        navigate:  ({ path }) => router.push(path),
      }}
    >
      {children}
      <SettingsDialog open={dialog === "settings"} />
    </BetterAgentProvider>
  );
}`}
            </DarkCode>
          </div>
        </div>
      </div>
    </section>
  );
}

function DescriptionTipsSection() {
  return (
    <section className={SEC}>
      <div className={WRAP}>
        <div className={SECHEAD}>
          <Eyebrow>Best practices</Eyebrow>
          <h2 className={H2}>Better descriptions, better decisions.</h2>
          <p className={SUB}>
            The agent picks tools based on their descriptions. Vague descriptions lead to wrong tool calls
            or no tool calls at all.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="font-mono text-[12px] text-destructive tracking-[0.04em] uppercase mb-3">Avoid — too vague</div>
            <div className="flex flex-col gap-2">
              {[
                `description: "Get projects"`,
                `description: "Update user"`,
                `description: "Open modal"`,
              ].map((ex) => (
                <pre
                  key={ex}
                  className="m-0 font-mono text-xs leading-[1.7] text-muted-foreground bg-muted border border-border rounded-[var(--radius-md)] p-[10px_14px] line-through decoration-destructive/50"
                >
                  {ex}
                </pre>
              ))}
            </div>
          </div>
          <div>
            <div className="font-mono text-[12px] text-primary tracking-[0.04em] uppercase mb-3">Better — says when to call it</div>
            <div className="flex flex-col gap-2">
              {[
                `description: "List the current user's projects. Use when they\n ask to see, find, or browse their projects."`,
                `description: "Update the user's profile name and bio. Only call\n after they explicitly ask to change their name."`,
                `description: "Open the settings dialog. Use when the user asks\n to change their account settings or preferences."`,
              ].map((ex) => (
                <pre
                  key={ex}
                  className="m-0 font-mono text-xs leading-[1.7] text-foreground bg-muted border border-border rounded-[var(--radius-md)] p-[10px_14px]"
                >
                  {ex}
                </pre>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { title: "Be specific about when", tip: "Include \"Use when the user asks to...\" — this directly maps to intent." },
            { title: "Add safety guardrails", tip: "For destructive actions, add \"Only call after explicit user confirmation.\"" },
            { title: "Describe parameters too", tip: "Use .describe() on Zod fields to give the agent context about each param." },
          ].map(({ title, tip }) => (
            <div key={title} className="p-[14px_16px] border border-border rounded-lg">
              <div className="font-mono font-semibold text-[13px] mb-1.5">{title}</div>
              <p className="font-sans text-[13px] text-muted-foreground leading-[1.5] m-0">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SyncWorkflowSection() {
  return (
    <section className={SEC}>
      <div className={WRAP}>
        <div className={SECHEAD}>
          <Eyebrow>Sync</Eyebrow>
          <h2 className={H2}>Keep tools in sync.</h2>
          <p className={SUB}>
            Run <CodeChip>betteragent sync</CodeChip> whenever your tool files change. The CLI diffs against
            what{"’"}s already on the backend and reports added, updated, removed, and unchanged tools.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 items-start">
          <div className="flex flex-col gap-6">
            <DarkCode language="bash">
              {"# Push changes\nnpx betteragent sync\n\n→ Loading tool files from .\n✓ routes.betteragent.ts (3 tools)\n✓ server-actions.betteragent.ts (4 tools)\n✓ Synced. +2 added · ~1 updated · -0 removed · =4 unchanged."}
            </DarkCode>
            <DarkCode language="bash">
              {"# Validate without pushing\nnpx betteragent sync --dry-run\n\n→ Dry run — no changes will be made.\n✓ routes.betteragent.ts (3 tools)\n✓ server-actions.betteragent.ts (4 tools)\n  Would push: +2 added · ~1 updated · -0 removed · =4 unchanged."}
            </DarkCode>
          </div>
          <div className="flex flex-col gap-3">
            <div className="p-[14px_16px] border border-border rounded-lg">
              <div className="font-mono font-semibold text-[13px] mb-1.5">When to sync</div>
              <ul className="font-sans text-[13px] text-muted-foreground leading-[1.55] m-0 pl-4 flex flex-col gap-1">
                <li>After adding or removing a tool</li>
                <li>After editing a description or schema</li>
                <li>Before deploying to production</li>
                <li>After renaming a route handler or action</li>
              </ul>
            </div>
            <div className="p-[14px_16px] border border-border rounded-lg">
              <div className="font-mono font-semibold text-[13px] mb-1.5">CI/CD tip</div>
              <p className="font-sans text-[13px] text-muted-foreground leading-[1.55] m-0">
                Add <CodeChip>betteragent sync</CodeChip> to your deploy pipeline so tools stay in sync
                on every production deploy. Set <CodeChip>BETTERAGENT_API_URL</CodeChip> for environment-specific URLs.
              </p>
            </div>
            <p className="font-sans text-[13px] text-muted-foreground leading-[1.55] m-0">
              Full CLI reference: <Link href="/cli" className="underline underline-offset-2">betteragent.dev/cli</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
