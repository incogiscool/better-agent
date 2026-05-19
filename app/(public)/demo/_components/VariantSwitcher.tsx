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
import { CAMPAIGNS, type Campaign } from "../_data/campaigns";
import { LumenShell } from "./LumenShell";

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
    prompt:
      "Pause all campaigns under 1.2% engagement and notify their owners.",
    icon: <PauseCircle size={12} />,
  },
];

const CLIENT_KEY =
  process.env.NEXT_PUBLIC_BETTERAGENT_DEMO_CLIENT_KEY ?? "demo_key";
const API_URL = process.env.NEXT_PUBLIC_BETTERAGENT_API_URL;
const END_USER_ID = "demo_user";

export function VariantSwitcher() {
  const searchParams = useSearchParams();
  const variant = (searchParams.get("variant") ?? "sidebar") as Variant;
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([...CAMPAIGNS]);

  const actions = React.useMemo(
    () => ({
      searchCampaigns: ({
        query,
        status,
      }: {
        query?: string;
        status?: Campaign["status"];
      }) => {
        let results = campaigns;
        if (status) results = results.filter((c) => c.status === status);
        if (query) {
          const q = query.toLowerCase();
          results = results.filter((c) => c.name.toLowerCase().includes(q));
        }
        return {
          campaigns: results.map((c) => ({
            id: c.id,
            name: c.name,
            status: c.status,
            reach: c.reach,
            engagement: `${(c.engagement * 100).toFixed(1)}%`,
            cpm: `$${c.cpm.toFixed(2)}`,
          })),
          total: results.length,
        };
      },

      pauseCampaign: ({ id }: { id: string }) => {
        const campaign = campaigns.find((c) => c.id === id);
        if (!campaign) return { ok: false, error: `Campaign ${id} not found.` };
        if (campaign.status !== "live")
          return { ok: false, error: `Campaign ${id} is not live.` };
        setCampaigns((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, status: "paused" as const } : c,
          ),
        );
        return { ok: true, campaign: { ...campaign, status: "paused" } };
      },

      createCampaign: ({ name }: { name: string }) => {
        const id = `cmp_${Math.random().toString(36).slice(2, 6)}`;
        const campaign: Campaign = {
          id,
          name,
          reach: 0,
          spend: 0,
          cpm: 0,
          engagement: 0,
          status: "draft",
        };
        setCampaigns((prev) => [...prev, campaign]);
        return { ok: true, campaign };
      },
    }),
    [campaigns],
  );

  const shell = (children?: React.ReactNode) => (
    <LumenShell campaigns={campaigns}>{children}</LumenShell>
  );

  return (
    <BetterAgentProvider
      clientKey={CLIENT_KEY}
      apiUrl={API_URL}
      endUserId={END_USER_ID}
      actions={actions}
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

      <div className="pt-10">
        {variant === "sidebar" &&
          shell(
            <ChatSidebar
              title="Lumen agent"
              subtitle="3 tools · runs as you"
              greeting="Hi Rachel — I have access to your campaigns, audiences, and analytics endpoints. I can run them in sequence on your behalf. Try one of these."
              suggestedPrompts={SUGGESTED}
            />,
          )}
        {variant === "popup" && (
          <>
            {shell()}
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
            {shell()}
            <ChatCommandBar
              placeholder="Type a command, ask, or give an instruction…"
              suggestedPrompts={SUGGESTED}
              footerLabel="powered by betteragent"
            />
          </>
        )}
        {variant === "inline-bar" && (
          <div className="flex flex-col gap-4 p-6 pt-4">
            {shell()}
            <div className="sticky bottom-8">
              <ChatInlineBar placeholder="Tell Lumen what to do…" />
            </div>
          </div>
        )}
      </div>
    </BetterAgentProvider>
  );
}
