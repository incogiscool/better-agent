"use client";

import { useState } from "react";
import { Copy, Check, ArrowRight } from "@phosphor-icons/react";
import { CtaSection } from "@/components/landing/CtaSection";
import { Eyebrow, WRAP, SEC, SECHEAD, H2, SUB, CodeChip } from "@/components/landing/primitives";
import { cn } from "@/lib/utils";

const AGENT_PROMPT = `# BetterAgent Setup Prompt

You are helping a developer add BetterAgent to their Next.js project.
BetterAgent gives the app an AI assistant that can call routes, server
actions, and trigger client-side effects — no extra backend required.

---

## Step 1: Install packages

npm install -D @betteragent/cli
npm install @betteragent/react @betteragent/next

## Step 2: Authenticate

Ask the user for their BetterAgent secret key (format: ba_secret_...).
You can find it in the dashboard under project settings. Then run:

  npx betteragent login --key <secret-key>

## Step 3: Initialize

Run the setup wizard. It will prompt for a chat component variant.
Sidebar is a good default for most apps.

  npx betteragent init

## Step 4: Discover tools

Scan the project for existing Next.js routes and server actions:

  npx betteragent discover

Review the generated files and remove any routes the agent should not
access (admin-only endpoints, internal APIs, etc.).

## Step 5: Sync

Push the tool definitions to the BetterAgent backend:

  npx betteragent sync

## Step 6: Add the provider

In the root layout (e.g. app/layout.tsx), wrap children with
BetterAgentProvider. Replace endUserId with the authenticated
user's real ID from your auth system.

  import { BetterAgentProvider } from "@betteragent/react";
  import { serverActions } from "./server-actions.betteragent";

  export default function RootLayout({ children }) {
    return (
      <html>
        <body>
          <BetterAgentProvider
            clientKey={process.env.NEXT_PUBLIC_BETTERAGENT_CLIENT_KEY!}
            apiUrl={process.env.NEXT_PUBLIC_BETTERAGENT_API_URL}
            endUserId="user-id-here"
            serverActions={serverActions}
          >
            {children}
          </BetterAgentProvider>
        </body>
      </html>
    );
  }

Add to .env.local:

  NEXT_PUBLIC_BETTERAGENT_CLIENT_KEY=ba_client_...

The clientKey (ba_client_...) is safe to expose publicly.
Never expose the secretKey (ba_secret_...) in client-side code.

Also import and render the chat component that betteragent init installed.
The provider supplies context but renders no UI on its own. For the sidebar
variant, add it alongside your main content:

  import { ChatSidebar } from "@/components/chat/sidebar";

  <div className="flex h-screen">
    <main className="flex-1 overflow-y-auto">{children}</main>
    <ChatSidebar title="Assistant" greeting="Hi — how can I help?" />
  </div>

---

## Tool file reference (for manual edits after discovery)

Tool files teach the agent what it can do. Three file types:

### routes.betteragent.ts — HTTP routes called server-to-server

  import { defineRoute } from "@betteragent/next";
  import { z } from "zod";

  export const getUser = defineRoute({
    name: "getUser",
    method: "GET",
    path: "/api/user",
    description: "Get the current authenticated user's profile. Use when " +
      "the user asks about their account or profile details.",
    schema: z.object({}),
  });

  export const routes = [getUser];

### server-actions.betteragent.ts — Next.js Server Actions

  import { defineServerAction } from "@betteragent/next";
  import { z } from "zod";
  import { updateProfile } from "@/app/actions/profile";

  export const updateUserProfile = defineServerAction({
    name: "updateUserProfile",
    description: "Update the user's display name and bio. Only call after " +
      "they explicitly ask to change their name.",
    schema: z.object({
      name: z.string().min(1).max(100),
      bio:  z.string().max(500).optional(),
    }),
    handler: updateProfile,
  });

  export const serverActions = [updateUserProfile];

### actions.betteragent.ts — Browser-side effects

  import { defineAction } from "@betteragent/next";
  import { z } from "zod";

  export const openModal = defineAction({
    name: "openModal",
    description: "Open a modal or dialog. Use when the user asks to see or " +
      "edit something in a dialog.",
    schema: z.object({
      name: z.enum(["settings", "profile", "billing"]),
    }),
  });

  export const actions = [openModal];

Register client actions in BetterAgentProvider:

  <BetterAgentProvider
    clientKey={...}
    endUserId={...}
    actions={{
      openModal: ({ name }) => setOpenDialog(name),
    }}
  >

---

## Key facts

- Credits: 2 per conversation start · 1 per message · 3 per tool call
- Free plan: 500 credits/30-day period, no card required
- Run betteragent sync whenever tool files change
- Better descriptions = better agent decisions
  Describe *when* to use a tool, not just *what* it does
- Docs:          https://betteragent.dev/docs
- CLI reference: https://betteragent.dev/cli
- Tool files:    https://betteragent.dev/docs/tools`;

const WHAT_IT_DOES = [
  "Installs @betteragent/cli, @betteragent/react, and @betteragent/next",
  "Prompts you for your secret key and authenticates the CLI",
  "Runs betteragent init to scaffold a chat component",
  "Runs betteragent discover to generate tool files from your codebase",
  "Runs betteragent sync to push tool definitions to the backend",
  "Wraps your root layout with BetterAgentProvider and registers your server actions",
  "Renders the chat component the wizard installed",
  "Adds NEXT_PUBLIC_BETTERAGENT_CLIENT_KEY to .env.local",
];

export default function AgentPage() {
  return (
    <>
      <AgentHero />
      <HowToUseSection />
      <PromptSection />
      <WhatItDoesSection />
      <CtaSection />
    </>
  );
}

function AgentHero() {
  return (
    <section className="pt-24 pb-16 border-b border-border">
      <div className={cn(WRAP, "max-w-[760px]")}>
        <div className="flex flex-col gap-5">
          <Eyebrow>AI Setup Prompt</Eyebrow>
          <h1 className="font-mono font-medium text-[56px] leading-[1.04] tracking-[-0.03em] m-0">
            Set up BetterAgent<br />with your AI IDE.
          </h1>
          <p className={SUB}>
            Copy the prompt below and paste it into Claude Code, Cursor, or any AI coding assistant.
            Your agent will handle the full setup — packages, auth, tool discovery, and provider wiring.
          </p>
        </div>
      </div>
    </section>
  );
}

function HowToUseSection() {
  return (
    <section className={SEC}>
      <div className={WRAP}>
        <div className={SECHEAD}>
          <Eyebrow>How to use</Eyebrow>
          <h2 className={H2}>Three steps.</h2>
        </div>
        <div className="flex flex-col gap-0">
          {[
            {
              n: "01",
              title: "Copy the prompt",
              desc: "Click the copy button below to copy the full setup prompt to your clipboard.",
            },
            {
              n: "02",
              title: "Paste into your AI IDE",
              desc: (
                <>
                  Open a new session in <strong className="text-foreground font-medium">Claude Code</strong>,{" "}
                  <strong className="text-foreground font-medium">Cursor</strong>, or any AI coding assistant
                  with access to your project. Paste the prompt and send it.
                </>
              ),
            },
            {
              n: "03",
              title: "Your agent handles the rest",
              desc: "The AI will walk through each step, ask for your secret key, and complete the full setup. You'll have a working agent UI in your app within minutes.",
            },
          ].map(({ n, title, desc }, i, arr) => (
            <div key={n} className="flex gap-6 items-start">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full border border-border bg-muted font-mono text-[12px] text-muted-foreground shrink-0">
                  {n}
                </div>
                {i < arr.length - 1 && (
                  <div className="w-px h-8 bg-border mt-1" />
                )}
              </div>
              <div className={cn("flex flex-col gap-1", i < arr.length - 1 ? "pb-8" : "")}>
                <div className="font-mono font-semibold text-[14px]">{title}</div>
                <p className="font-sans text-[13px] text-muted-foreground leading-[1.55] m-0">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PromptSection() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(AGENT_PROMPT).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <section className={SEC}>
      <div className={WRAP}>
        <div className={SECHEAD}>
          <Eyebrow>The prompt</Eyebrow>
          <h2 className={H2}>Copy and paste.</h2>
          <p className={SUB}>
            The raw version is also available at{" "}
            <CodeChip>/agent-setup.md</CodeChip> if you want to fetch it directly.
          </p>
        </div>
        <div className="relative">
          <div className="bg-[oklch(0.145_0_0)] border border-[oklch(1_0_0/10%)] rounded-xl overflow-hidden font-mono text-[12px] leading-[1.7]">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[oklch(1_0_0/10%)] text-[11px] text-[oklch(0.65_0_0)]">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-[9px] h-[9px] rounded-full bg-[oklch(1_0_0/15%)] inline-block" />
                  ))}
                </div>
                <span>betteragent-setup.md</span>
              </div>
              <button
                onClick={handleCopy}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-md border text-[11px] font-mono transition-colors",
                  copied
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-[oklch(1_0_0/15%)] bg-[oklch(1_0_0/5%)] text-[oklch(0.75_0_0)] hover:bg-[oklch(1_0_0/10%)] hover:text-[oklch(0.95_0_0)]",
                )}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="p-[18px_22px] text-[oklch(0.985_0_0)] whitespace-pre overflow-x-auto max-h-[560px] overflow-y-auto m-0">
              {AGENT_PROMPT}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhatItDoesSection() {
  return (
    <section className={SEC}>
      <div className={WRAP}>
        <div className={SECHEAD}>
          <Eyebrow>What the agent will do</Eyebrow>
          <h2 className={H2}>Full setup, automatically.</h2>
        </div>
        <div className="flex flex-col gap-3">
          {WHAT_IT_DOES.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 border border-primary/20 shrink-0 mt-0.5">
                <ArrowRight size={10} className="text-primary" />
              </div>
              <span className="font-sans text-[14px] text-foreground leading-snug">{item}</span>
            </div>
          ))}
        </div>
        <p className="font-sans text-[13px] text-muted-foreground leading-[1.55] mt-8">
          Prefer to do it by hand?{" "}
          <a href="/docs/quickstart" className="underline underline-offset-2">
            Follow the step-by-step quickstart instead.
          </a>
        </p>
      </div>
    </section>
  );
}
