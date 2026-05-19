"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MagnifyingGlass, ChartBar, PauseCircle } from "@phosphor-icons/react";
import { BetterAgentProvider } from "@betteragent/react";
import {
  ChatSidebar,
  ChatPopup,
  ChatCommandBar,
  ChatInlineBar,
} from "@/components/chat";
import type { SuggestedPrompt } from "@/components/chat";
import { LumenShell } from "./LumenShell";
import {
  searchCampaigns,
  pauseCampaign,
  createCampaign,
} from "../_actions/server-actions";

const VARIANTS = ["sidebar", "popup", "command-bar", "inline-bar"] as const;
type Variant = (typeof VARIANTS)[number];

const SUGGESTED: SuggestedPrompt[] = [
  {
    label: "Find the top 4 running influencers in Canada and draft a campaign",
    prompt:
      "Find the top 4 running influencers in Canada and draft a campaign for our new Trail Runner II launch.",
    icon: <MagnifyingGlass size={12} />,
  },
  {
    label: "What's the audience overlap between our last 3 campaigns?",
    prompt: "What's the audience overlap between our last 3 campaigns?",
    icon: <ChartBar size={12} />,
  },
  {
    label: "Pause all campaigns under 1.2% engagement and notify their owners.",
    prompt: "Pause all campaigns under 1.2% engagement and notify their owners.",
    icon: <PauseCircle size={12} />,
  },
];

const CLIENT_KEY =
  process.env.NEXT_PUBLIC_BETTERAGENT_DEMO_CLIENT_KEY ?? "demo_key";
const END_USER_ID = "demo_user";

export function VariantSwitcher() {
  const searchParams = useSearchParams();
  const variant = (searchParams.get("variant") ?? "sidebar") as Variant;

  return (
    <BetterAgentProvider
      clientKey={CLIENT_KEY}
      endUserId={END_USER_ID}
      serverActions={[searchCampaigns, pauseCampaign, createCampaign]}
    >
      {/* Variant tabs */}
      <div className="fixed left-0 right-0 top-0 z-50 flex items-center gap-1 border-b border-border bg-background px-4 py-2 text-[11px]">
        <span className="mr-2 font-mono text-muted-foreground">VARIANT</span>
        {VARIANTS.map((v) => (
          <Link
            key={v}
            href={`?variant=${v}`}
            className={`border px-2.5 py-1 font-mono transition-colors ${
              variant === v
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-foreground/40"
            }`}
          >
            {v}
          </Link>
        ))}
        <span className="ml-auto font-mono text-muted-foreground/60">
          running on Lumen — a demo marketing host
        </span>
      </div>

      {/* Add top padding so tabs don't overlap content */}
      <div className="pt-10">
        {variant === "sidebar" && (
          <LumenShell>
            <ChatSidebar
              title="Lumen agent"
              subtitle="3 tools · runs as you"
              greeting="Hi Rachel — I have access to your campaigns, audiences, and analytics endpoints. I can run them in sequence on your behalf. Try one of these."
              suggestedPrompts={SUGGESTED}
            />
          </LumenShell>
        )}

        {variant === "popup" && (
          <>
            <LumenShell />
            <ChatPopup
              title="Lumen agent"
              greeting="Hey — I can run any of Lumen's actions for you. Search, draft, schedule, pause. Where should we start?"
              suggestedPrompts={SUGGESTED}
              defaultOpen
            />
          </>
        )}

        {variant === "command-bar" && (
          <>
            <LumenShell />
            <ChatCommandBar
              placeholder="Type a command, ask, or give an instruction…"
              suggestedPrompts={SUGGESTED}
              footerLabel="powered by betteragent"
            />
          </>
        )}

        {variant === "inline-bar" && (
          <div className="flex flex-col gap-4 p-6 pt-4">
            <LumenShell />
            <ChatInlineBar placeholder="Tell Lumen what to do…" />
          </div>
        )}
      </div>
    </BetterAgentProvider>
  );
}
