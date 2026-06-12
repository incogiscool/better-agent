"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { CodeChip } from "@/components/landing/primitives";
import { DOCS_URL } from "@/lib/const/DOCS_URL";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "define", label: "1 · Define" },
  { id: "provider", label: "2 · Provider" },
  { id: "render", label: "3 · Render" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const CAPTIONS: Record<Exclude<TabId, "overview">, string> = {
  define:
    "Tool definitions live in actions.betteragent.ts. betteragent sync pushes them to the backend.",
  provider:
    "Wrap your app and supply the matching handlers — what actually runs when the agent calls a tool.",
  render:
    "Drop in a chat component (installed by betteragent init — it's the same one on this page).",
};

const CODE: Record<Exclude<TabId, "overview">, string> = {
  define: `// actions.betteragent.ts — your tool definitions
import { z } from "zod";
import { defineAction } from "betteragent-next";

export const pauseCampaign = defineAction({
  name: "pauseCampaign",
  description: "Pause a single live campaign by its ID.",
  schema: z.object({ id: z.string() }),
});

export const switchTab = defineAction({
  name: "switchTab",
  description: "Navigate to a tab in the Lumen UI.",
  schema: z.object({
    tab: z.enum(["campaigns", "influencers", "analytics"]),
  }),
});

// …8 more in this demo. Then push to the backend:
//   npx betteragent sync`,

  provider: `import { BetterAgentProvider } from "betteragent-react";

<BetterAgentProvider
  clientKey={process.env.NEXT_PUBLIC_BETTERAGENT_CLIENT_KEY}
  endUserId={currentUser.id}
  actions={{
    // each handler runs when the agent calls that tool
    pauseCampaign: ({ id }) => {
      setCampaigns(prev =>
        prev.map(c => c.id === id ? { ...c, status: "paused" } : c)
      );
      return { ok: true };
    },
    switchTab: ({ tab }) => {
      setActiveTab(tab);
      return { ok: true };
    },
  }}
>
  <YourApp />
</BetterAgentProvider>`,

  render: `// installed by \`betteragent init\`
import { ChatSidebar } from "@/components/chat/sidebar";

<ChatSidebar
  title="Lumen agent"
  greeting="Hi — I can run your campaigns,
    influencers, and analytics."
/>`,
};

export function CodePanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = React.useState<TabId>("overview");
  const [copied, setCopied] = React.useState(false);

  function copy() {
    if (tab === "overview") return;
    navigator.clipboard.writeText(CODE[tab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()} direction="right">
      <DrawerContent className="sm:max-w-[540px] flex flex-col">
        <DrawerHeader className="border-b border-border pb-3 shrink-0">
          <DrawerTitle className="font-mono text-sm">How it works</DrawerTitle>
          <div className="flex flex-wrap items-center gap-1 mt-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`font-mono text-[11px] px-2.5 py-1 border whitespace-nowrap shrink-0 transition-colors ${
                  tab === t.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground/40"
                }`}
              >
                {t.label}
              </button>
            ))}
            {tab !== "overview" && (
              <button
                onClick={copy}
                className="ml-auto font-mono text-[11px] px-2.5 py-1 border border-border whitespace-nowrap shrink-0 text-muted-foreground hover:border-foreground/40 transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            )}
          </div>
        </DrawerHeader>

        {tab === "overview" ? (
          <Overview />
        ) : (
          <div className="flex-1 overflow-auto flex flex-col">
            <p className="shrink-0 px-4 py-3 font-sans text-xs leading-relaxed text-muted-foreground border-b border-border">
              {CAPTIONS[tab]}
            </p>
            <pre className="m-0 flex-1 font-mono text-xs leading-[1.7] text-zinc-100 bg-zinc-950 p-4 overflow-auto">
              {CODE[tab]}
            </pre>
          </div>
        )}

        <DocsFooter />
      </DrawerContent>
    </Drawer>
  );
}

function Overview() {
  return (
    <div className="flex-1 overflow-auto p-5 font-sans text-[13px] leading-[1.65] text-muted-foreground space-y-5">
      <div className="space-y-2">
        <h4 className="font-mono text-xs uppercase tracking-[0.06em] text-foreground m-0">
          What you&apos;re looking at
        </h4>
        <p className="m-0">
          This is a mock dashboard (&ldquo;Lumen&rdquo;) — nothing here hits a
          real backend. The agent&apos;s tools are plain functions running in
          your browser; only the chat turn itself calls the BetterAgent API. Ask
          it to do something and it reads and updates this UI through those
          functions.
        </p>
      </div>

      <div className="space-y-2">
        <h4 className="font-mono text-xs uppercase tracking-[0.06em] text-foreground m-0">
          How you&apos;d build it — 3 steps
        </h4>
        <ol className="m-0 pl-4 space-y-1.5 list-decimal">
          <li>
            <strong className="text-foreground font-medium">Define</strong> your
            tools with <CodeChip>defineAction</CodeChip>, then{" "}
            <CodeChip>betteragent sync</CodeChip>.
          </li>
          <li>
            <strong className="text-foreground font-medium">Wrap</strong> your
            app in <CodeChip>BetterAgentProvider</CodeChip> and pass the matching
            handlers.
          </li>
          <li>
            <strong className="text-foreground font-medium">Render</strong> a
            chat component.
          </li>
        </ol>
        <p className="m-0 text-xs">
          ≈5 minutes on an existing Next.js app.
        </p>
      </div>

      <div className="space-y-2">
        <h4 className="font-mono text-xs uppercase tracking-[0.06em] text-foreground m-0">
          The one concept
        </h4>
        <p className="m-0">
          A tool has two halves: its{" "}
          <strong className="text-foreground font-medium">contract</strong>{" "}
          (name, description, schema) lives in{" "}
          <CodeChip>actions.betteragent.ts</CodeChip> and is synced to the
          backend, while its{" "}
          <strong className="text-foreground font-medium">handler</strong> lives
          in the provider&apos;s <CodeChip>actions</CodeChip> map and is what
          actually runs. Walk through both in the tabs above.
        </p>
      </div>
    </div>
  );
}

function DocsFooter() {
  return (
    <div className="shrink-0 border-t border-border px-4 py-3 flex items-center gap-4 font-mono text-[11px]">
      <Link
        href={`${DOCS_URL}/quickstart`}
        className="inline-flex items-center gap-1 text-foreground hover:text-primary transition-colors"
      >
        Full setup — 8 steps <ArrowUpRight size={11} />
      </Link>
      <Link
        href={`${DOCS_URL}/tools`}
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        Tool file reference <ArrowUpRight size={11} />
      </Link>
    </div>
  );
}
