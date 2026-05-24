"use client";

import * as React from "react";
import type { Campaign } from "../_data/campaigns";
import type { Influencer } from "../_data/influencers";

export type ActiveTab = "campaigns" | "influencers" | "analytics";

export type LumenShellProps = {
  campaigns: Campaign[];
  influencers: Influencer[];
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  children?: React.ReactNode;
};

function formatReach(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function formatCurrency(n: number): string {
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toFixed(2)}`;
}

function StatusBadge({ status }: { status: Campaign["status"] }) {
  const cls =
    status === "live"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
      : status === "paused"
        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
        : "bg-muted text-muted-foreground";
  return (
    <span className={`inline-block px-1.5 py-0.5 text-[10px] font-mono ${cls}`}>
      {status}
    </span>
  );
}

function PlatformBadge({ platform }: { platform: Influencer["platform"] }) {
  const label =
    platform === "instagram" ? "IG" : platform === "tiktok" ? "TK" : "YT";
  const cls =
    platform === "instagram"
      ? "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400"
      : platform === "tiktok"
        ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  return (
    <span className={`inline-block px-1.5 py-0.5 text-[10px] font-mono ${cls}`}>
      {label}
    </span>
  );
}

function CampaignsTab({ campaigns }: { campaigns: Campaign[] }) {
  const totalReach = campaigns.reduce((s, c) => s + c.reach, 0);
  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0);
  const avgCpm =
    campaigns.reduce((s, c) => s + c.cpm, 0) / (campaigns.length || 1);
  const avgEngagement =
    campaigns.reduce((s, c) => s + c.engagement, 0) / (campaigns.length || 1);

  return (
    <>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Campaigns</h1>
        <p className="text-xs text-muted-foreground">
          {campaigns.filter((c) => c.status === "live").length} active · last 30
          days
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-4">
        {[
          { label: "REACH", value: formatReach(totalReach), hint: "+18%" },
          { label: "SPEND", value: formatCurrency(totalSpend), hint: null },
          { label: "AVG CPM", value: `$${avgCpm.toFixed(2)}`, hint: null },
          {
            label: "ENGAGEMENT",
            value: `${(avgEngagement * 100).toFixed(1)}%`,
            hint: "+0.4",
          },
        ].map((s) => (
          <div key={s.label} className="bg-background p-4">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {s.label}
            </div>
            <div className="mt-1 text-xl font-semibold">
              {s.value}
              {s.hint && (
                <span className="ml-1 text-xs text-emerald-600">{s.hint}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border border-border">
        <div className="grid grid-cols-[minmax(80px,1fr)_2fr_1fr_1fr_1fr_1fr] gap-px border-b border-border bg-border text-[10px] uppercase tracking-widest text-muted-foreground">
          {["ID", "NAME", "REACH", "BUDGET", "CPM", "STATUS"].map((h) => (
            <div key={h} className="bg-muted/50 px-4 py-2">
              {h}
            </div>
          ))}
        </div>
        {campaigns.map((c) => (
          <div
            key={c.id}
            className="grid grid-cols-[minmax(80px,1fr)_2fr_1fr_1fr_1fr_1fr] gap-px bg-border text-xs"
          >
            <div className="bg-background px-4 py-3 font-mono text-muted-foreground">
              {c.id}
            </div>
            <div className="bg-background px-4 py-3 font-medium">{c.name}</div>
            <div className="bg-background px-4 py-3 font-mono">
              {formatReach(c.reach)}
            </div>
            <div className="bg-background px-4 py-3 font-mono">
              {formatCurrency(c.budget)}
            </div>
            <div className="bg-background px-4 py-3 font-mono">
              ${c.cpm.toFixed(2)}
            </div>
            <div className="bg-background px-4 py-3">
              <StatusBadge status={c.status} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function InfluencersTab({
  influencers,
  campaigns,
}: {
  influencers: Influencer[];
  campaigns: Campaign[];
}) {
  function campaignName(id: string) {
    return campaigns.find((c) => c.id === id)?.name ?? id;
  }

  return (
    <>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Influencers</h1>
        <p className="text-xs text-muted-foreground">
          {influencers.length} total ·{" "}
          {influencers.filter((i) => i.assignedCampaignIds.length > 0).length}{" "}
          assigned
        </p>
      </div>

      <div className="mt-6 border border-border">
        <div className="grid grid-cols-[1fr_1fr_auto_1fr_1fr_1fr_2fr] gap-px border-b border-border bg-border text-[10px] uppercase tracking-widest text-muted-foreground">
          {[
            "HANDLE",
            "NAME",
            "PLATFORM",
            "FOLLOWERS",
            "ENGAGEMENT",
            "COUNTRY",
            "CAMPAIGNS",
          ].map((h) => (
            <div key={h} className="bg-muted/50 px-4 py-2">
              {h}
            </div>
          ))}
        </div>
        {influencers.map((inf) => (
          <div
            key={inf.id}
            className="grid grid-cols-[1fr_1fr_auto_1fr_1fr_1fr_2fr] gap-px bg-border text-xs"
          >
            <div className="bg-background px-4 py-3 font-mono text-muted-foreground">
              {inf.handle}
            </div>
            <div className="bg-background px-4 py-3 font-medium">{inf.name}</div>
            <div className="bg-background px-4 py-3">
              <PlatformBadge platform={inf.platform} />
            </div>
            <div className="bg-background px-4 py-3 font-mono">
              {formatReach(inf.followers)}
            </div>
            <div className="bg-background px-4 py-3 font-mono">
              {(inf.engagementRate * 100).toFixed(1)}%
            </div>
            <div className="bg-background px-4 py-3">{inf.country}</div>
            <div className="bg-background px-4 py-3 text-muted-foreground">
              {inf.assignedCampaignIds.length === 0 ? (
                <span className="text-muted-foreground/40">—</span>
              ) : (
                inf.assignedCampaignIds.map((id) => (
                  <span
                    key={id}
                    className="inline-block mr-1 px-1 py-0.5 bg-muted font-mono text-[10px]"
                  >
                    {campaignName(id)}
                  </span>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

type AnalyticsRow = {
  date: string;
  campaign: string;
  reach: number;
  spend: number;
  impressions: number;
};

function AnalyticsTab({ campaigns }: { campaigns: Campaign[] }) {
  const rows = React.useMemo<AnalyticsRow[]>(() => {
    const result: AnalyticsRow[] = [];
    const now = new Date();
    const liveCampaigns = campaigns.filter((c) => c.status === "live");

    for (let d = 6; d >= 0; d--) {
      const date = new Date(now);
      date.setDate(date.getDate() - d);
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      for (const c of liveCampaigns) {
        const seed = c.id.charCodeAt(4) + d * 7;
        const variance = ((seed % 30) - 15) / 100;
        const dailyReach = Math.round((c.reach / 7) * (1 + variance));
        const dailySpend = +((c.spend / 7) * (1 + variance)).toFixed(2);
        result.push({
          date: dateStr,
          campaign: c.name,
          reach: dailyReach,
          spend: dailySpend,
          impressions: Math.round(dailyReach * 1.4),
        });
      }
    }

    return result;
  }, [campaigns]);

  const totals = React.useMemo(
    () => ({
      reach: rows.reduce((s, r) => s + r.reach, 0),
      spend: rows.reduce((s, r) => s + r.spend, 0),
      impressions: rows.reduce((s, r) => s + r.impressions, 0),
    }),
    [rows],
  );

  return (
    <>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-xs text-muted-foreground">Last 7 days · live campaigns</p>
      </div>

      <div className="mt-6 border border-border">
        <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr] gap-px border-b border-border bg-border text-[10px] uppercase tracking-widest text-muted-foreground">
          {["DATE", "CAMPAIGN", "REACH", "SPEND", "IMPRESSIONS"].map((h) => (
            <div key={h} className="bg-muted/50 px-4 py-2">
              {h}
            </div>
          ))}
        </div>

        {/* Totals row */}
        <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr] gap-px bg-border text-xs font-semibold">
          <div className="bg-muted/30 px-4 py-3 text-muted-foreground">Total</div>
          <div className="bg-muted/30 px-4 py-3 text-muted-foreground">All campaigns</div>
          <div className="bg-muted/30 px-4 py-3 font-mono">
            {formatReach(totals.reach)}
          </div>
          <div className="bg-muted/30 px-4 py-3 font-mono">
            {formatCurrency(totals.spend)}
          </div>
          <div className="bg-muted/30 px-4 py-3 font-mono">
            {formatReach(totals.impressions)}
          </div>
        </div>

        {rows.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr] gap-px bg-border text-xs"
          >
            <div className="bg-background px-4 py-3 font-mono text-muted-foreground">
              {row.date}
            </div>
            <div className="bg-background px-4 py-3">{row.campaign}</div>
            <div className="bg-background px-4 py-3 font-mono">
              {formatReach(row.reach)}
            </div>
            <div className="bg-background px-4 py-3 font-mono">
              {formatCurrency(row.spend)}
            </div>
            <div className="bg-background px-4 py-3 font-mono">
              {formatReach(row.impressions)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function LumenShell({
  campaigns,
  influencers,
  activeTab,
  onTabChange,
  children,
}: LumenShellProps) {
  const NAV_TABS: { label: string; key: ActiveTab }[] = [
    { label: "Campaigns", key: "campaigns" },
    { label: "Influencers", key: "influencers" },
    { label: "Analytics", key: "analytics" },
  ];

  return (
    <div className="flex h-[calc(100vh-2.5rem)]">
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* top nav */}
        <header className="flex items-center gap-6 border-b border-border bg-background px-6 py-3 text-xs">
          <span className="font-bold text-primary">Lumen</span>
          {NAV_TABS.map(({ label, key }) => (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className={
                activeTab === key
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground transition-colors"
              }
            >
              {label}
            </button>
          ))}
        </header>

        {/* main content */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === "campaigns" && <CampaignsTab campaigns={campaigns} />}
          {activeTab === "influencers" && (
            <InfluencersTab influencers={influencers} campaigns={campaigns} />
          )}
          {activeTab === "analytics" && <AnalyticsTab campaigns={campaigns} />}
        </main>
      </div>

      {/* sidebar slot — variant switcher passes the active chat panel here */}
      {children}
    </div>
  );
}
