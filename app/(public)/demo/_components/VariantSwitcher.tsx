"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MagnifyingGlass, ChartBar, PauseCircle } from "@phosphor-icons/react";
import { BetterAgentProvider } from "betteragent-react";
import {
  ChatSidebar,
  ChatPopup,
  ChatCmdk,
  ChatInlineBar,
  ChatDrawer,
} from "@/components/chat";
import type { SuggestedPrompt } from "@/components/chat";
import { CAMPAIGNS, type Campaign } from "../_data/campaigns";
import { INFLUENCERS, type Influencer } from "../_data/influencers";
import { LumenShell, type ActiveTab, type LumenShellProps } from "./LumenShell";
import { CodePanel } from "./CodePanel";

const VARIANTS = ["sidebar", "popup", "cmdk", "inline-bar", "drawer"] as const;
type Variant = (typeof VARIANTS)[number];

const SUGGESTED: SuggestedPrompt[] = [
  {
    label: "Find top running influencers in Canada and launch a campaign",
    prompt:
      "Find the top running influencers in Canada, create a campaign called 'Trail Runner II Launch' with a $10,000 budget, assign each of them to it, then show me the influencers tab.",
    icon: <MagnifyingGlass size={12} />,
  },
  {
    label: "Pause underperforming campaigns",
    prompt:
      "Search for all live campaigns, find the ones with engagement under 1.5%, and pause them.",
    icon: <PauseCircle size={12} />,
  },
  {
    label: "Show me this week's analytics",
    prompt:
      "Get analytics for the last 7 days and tell me which campaign has the best engagement rate. Then switch to the analytics tab.",
    icon: <ChartBar size={12} />,
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
  const [influencers, setInfluencers] = React.useState<Influencer[]>([
    ...INFLUENCERS,
  ]);
  const [activeTab, setActiveTab] = React.useState<ActiveTab>("campaigns");
  const [showCode, setShowCode] = React.useState(false);
  const [isMac, setIsMac] = React.useState(true);
  const [cmdkOpen, setCmdkOpen] = React.useState(false);

  // Refs so action closures always read the latest state, not a stale snapshot
  const campaignsRef = React.useRef(campaigns);
  campaignsRef.current = campaigns;
  const influencersRef = React.useRef(influencers);
  influencersRef.current = influencers;

  React.useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/.test(navigator.platform));
  }, []);

  // Actions use refs for reads so they always see the latest state even when
  // the agent fires multiple tool calls before React re-renders.
  const actions = React.useMemo(
    () => ({
      searchCampaigns: ({
        query,
        status,
      }: {
        query?: string;
        status?: Campaign["status"];
      }) => {
        let results = campaignsRef.current;
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
            budget: c.budget,
            engagement: `${(c.engagement * 100).toFixed(1)}%`,
            cpm: `$${c.cpm.toFixed(2)}`,
          })),
          total: results.length,
        };
      },

      pauseCampaign: ({ id }: { id: string }) => {
        const campaign = campaignsRef.current.find((c) => c.id === id);
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

      resumeCampaign: ({ id }: { id: string }) => {
        const campaign = campaignsRef.current.find((c) => c.id === id);
        if (!campaign) return { ok: false, error: `Campaign ${id} not found.` };
        if (campaign.status !== "paused")
          return { ok: false, error: `Campaign ${id} is not paused.` };
        setCampaigns((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, status: "live" as const } : c,
          ),
        );
        return { ok: true, campaign: { ...campaign, status: "live" } };
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
          budget: 0,
        };
        setCampaigns((prev) => [...prev, campaign]);
        campaignsRef.current = [...campaignsRef.current, campaign];
        return { ok: true, campaign };
      },

      updateCampaignBudget: ({
        id,
        budget,
      }: {
        id: string;
        budget: number;
      }) => {
        const campaign = campaignsRef.current.find((c) => c.id === id);
        if (!campaign) return { ok: false, error: `Campaign ${id} not found.` };
        setCampaigns((prev) =>
          prev.map((c) => (c.id === id ? { ...c, budget } : c)),
        );
        campaignsRef.current = campaignsRef.current.map((c) =>
          c.id === id ? { ...c, budget } : c,
        );
        return { ok: true, campaign: { ...campaign, budget } };
      },

      bulkPause: ({ ids }: { ids: string[] }) => {
        const topause = campaignsRef.current.filter(
          (c) => ids.includes(c.id) && c.status === "live",
        );
        setCampaigns((prev) =>
          prev.map((c) =>
            ids.includes(c.id) && c.status === "live"
              ? { ...c, status: "paused" as const }
              : c,
          ),
        );
        campaignsRef.current = campaignsRef.current.map((c) =>
          ids.includes(c.id) && c.status === "live"
            ? { ...c, status: "paused" as const }
            : c,
        );
        return { ok: true, paused: topause.length, ids: topause.map((c) => c.id) };
      },

      searchInfluencers: ({
        query,
        platform,
        country,
        minFollowers,
        niche,
      }: {
        query?: string;
        platform?: Influencer["platform"];
        country?: string;
        minFollowers?: number;
        niche?: string;
      }) => {
        let results = influencersRef.current;
        if (platform) results = results.filter((i) => i.platform === platform);
        if (country)
          results = results.filter(
            (i) => i.country.toLowerCase() === country.toLowerCase(),
          );
        if (minFollowers !== undefined)
          results = results.filter((i) => i.followers >= minFollowers);
        if (niche)
          results = results.filter((i) =>
            i.niche.some((n) => n.toLowerCase().includes(niche.toLowerCase())),
          );
        if (query) {
          const q = query.toLowerCase();
          results = results.filter(
            (i) =>
              i.name.toLowerCase().includes(q) ||
              i.handle.toLowerCase().includes(q),
          );
        }
        return {
          influencers: results.map((i) => ({
            id: i.id,
            name: i.name,
            handle: i.handle,
            platform: i.platform,
            followers: i.followers,
            engagementRate: `${(i.engagementRate * 100).toFixed(1)}%`,
            country: i.country,
            niche: i.niche,
          })),
          total: results.length,
        };
      },

      assignInfluencerToCampaign: ({
        influencerId,
        campaignId,
      }: {
        influencerId: string;
        campaignId: string;
      }) => {
        const influencer = influencersRef.current.find((i) => i.id === influencerId);
        if (!influencer)
          return { ok: false, error: `Influencer ${influencerId} not found.` };
        const campaign = campaignsRef.current.find((c) => c.id === campaignId);
        if (!campaign)
          return { ok: false, error: `Campaign ${campaignId} not found.` };
        if (influencer.assignedCampaignIds.includes(campaignId))
          return { ok: false, error: "Already assigned." };
        const updated = {
          ...influencer,
          assignedCampaignIds: [...influencer.assignedCampaignIds, campaignId],
        };
        setInfluencers((prev) =>
          prev.map((i) => (i.id === influencerId ? updated : i)),
        );
        influencersRef.current = influencersRef.current.map((i) =>
          i.id === influencerId ? updated : i,
        );
        return {
          ok: true,
          influencer: updated,
          campaign: { id: campaign.id, name: campaign.name },
        };
      },

      getAnalytics: ({
        campaignId,
        days = 7,
      }: {
        campaignId?: string;
        days?: number;
      }) => {
        const targets = campaignId
          ? campaignsRef.current.filter((c) => c.id === campaignId)
          : campaignsRef.current.filter((c) => c.status === "live");
        return {
          days,
          campaigns: targets.map((c) => ({
            id: c.id,
            name: c.name,
            dailyReach: Math.round(c.reach / days),
            dailySpend: +(c.spend / days).toFixed(2),
            engagement: `${(c.engagement * 100).toFixed(1)}%`,
            totalReach: c.reach,
            totalSpend: c.spend,
          })),
        };
      },

      switchTab: ({ tab }: { tab: ActiveTab }) => {
        setActiveTab(tab);
        return { ok: true, tab };
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const shellProps: Omit<LumenShellProps, "children"> = {
    campaigns,
    influencers,
    activeTab,
    onTabChange: setActiveTab,
  };

  const shell = (children?: React.ReactNode) => (
    <LumenShell {...shellProps}>{children}</LumenShell>
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
        <Link
          href="/"
          className="mr-3 inline-flex shrink-0 items-center gap-1.5 font-mono font-semibold text-foreground hover:text-primary transition-colors"
          aria-label="Back to betteragent.dev"
        >
          <svg width="14" height="14" viewBox="0 0 32 32" fill="none" aria-hidden>
            <path
              d="M11 8 L20 16 L11 24"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          betteragent
        </Link>
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          <span className="mr-2 hidden shrink-0 font-mono text-muted-foreground sm:inline">
            VARIANT
          </span>
          {VARIANTS.map((v) => (
            <Link
              key={v}
              href={`?variant=${v}`}
              className={`shrink-0 border px-2.5 py-1 font-mono transition-colors ${
                variant === v
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-foreground/40"
              }`}
            >
              {v}
            </Link>
          ))}
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <span className="hidden font-mono text-[10px] text-muted-foreground lg:inline">
            New here?
          </span>
          <button
            onClick={() => setShowCode((v) => !v)}
            className="font-mono text-[10px] text-muted-foreground hover:text-foreground border border-border px-2 py-1 transition-colors"
          >
            &lt;/&gt; How it&apos;s built
          </button>
        </div>
      </div>

      <div className="pt-10">
        {variant === "sidebar" &&
          shell(
            <ChatSidebar
              title="Lumen agent"
              subtitle="10 tools · runs as you"
              greeting="Hi Rachel — I have access to your campaigns, influencers, and analytics. I can run them in sequence on your behalf. Try one of these."
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
        {variant === "cmdk" && (
          <>
            {shell()}
            <ChatCmdk
              placeholder="Type a command, ask, or give an instruction…"
              suggestedPrompts={SUGGESTED}
              trigger={null}
              open={cmdkOpen}
              onOpenChange={setCmdkOpen}
            />
            <button
              type="button"
              onClick={() => setCmdkOpen(true)}
              aria-label="Open the agent"
              className="fixed bottom-8 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-background/90 px-4 py-2 shadow-md backdrop-blur-sm font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="sm:hidden">Tap to ask the agent</span>
              <span className="hidden items-center gap-2 sm:flex">
                Press
                {isMac ? (
                  <kbd className="inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-foreground">
                    ⌘K
                  </kbd>
                ) : (
                  <>
                    <kbd className="inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-foreground">
                      Ctrl
                    </kbd>
                    +
                    <kbd className="inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-foreground">
                      K
                    </kbd>
                  </>
                )}
                to open the agent
              </span>
            </button>
          </>
        )}
        {variant === "inline-bar" && (
          <>
            {shell()}
            <div className="fixed bottom-8 left-0 right-0 px-6 z-40">
              <ChatInlineBar placeholder="Tell Lumen what to do…" />
            </div>
          </>
        )}
        {variant === "drawer" && (
          <>
            {shell()}
            <ChatDrawer
              title="Lumen agent"
              greeting="Hey — I can run any of Lumen's actions for you. Search, draft, schedule, pause. Where should we start?"
              suggestedPrompts={SUGGESTED}
              defaultOpen
            />
          </>
        )}
      </div>

      <CodePanel open={showCode} onClose={() => setShowCode(false)} />
    </BetterAgentProvider>
  );
}
