"use client";

import * as React from "react";
import type { Campaign } from "../_data/campaigns";

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

export function LumenShell({
  campaigns,
  children,
}: {
  campaigns: Campaign[];
  children?: React.ReactNode;
}) {
  const totalReach = campaigns.reduce((s, c) => s + c.reach, 0);
  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0);
  const avgCpm = campaigns.reduce((s, c) => s + c.cpm, 0) / (campaigns.length || 1);
  const avgEngagement = campaigns.reduce((s, c) => s + c.engagement, 0) / (campaigns.length || 1);

  return (
    <div className="flex h-full min-h-screen">
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* top nav */}
        <header className="flex items-center gap-6 border-b border-border bg-background px-6 py-3 text-xs">
          <span className="font-bold text-primary">Lumen</span>
          {["Campaigns", "Influencers", "Analytics", "Audiences"].map((t) => (
            <span
              key={t}
              className={
                t === "Campaigns"
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              }
            >
              {t}
            </span>
          ))}
          <div className="ml-auto flex items-center gap-3 text-muted-foreground">
            <span className="border border-border px-2 py-0.5 font-mono text-[10px]">
              Search anything…
            </span>
            <div className="size-6 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
              RA
            </div>
          </div>
        </header>

        {/* main content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Campaigns</h1>
            <p className="text-xs text-muted-foreground">
              {campaigns.filter((c) => c.status === "live").length} active ·
              last 30 days
            </p>
          </div>

          {/* stats */}
          <div className="mt-4 grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-4">
            {[
              { label: "REACH", value: formatReach(totalReach), hint: "+18%" },
              {
                label: "SPEND",
                value: formatCurrency(totalSpend),
                hint: null,
              },
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
                    <span className="ml-1 text-xs text-emerald-600">
                      {s.hint}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* table */}
          <div className="mt-6 border border-border">
            <div className="grid grid-cols-[minmax(80px,1fr)_2fr_1fr_1fr_1fr] gap-px border-b border-border bg-border text-[10px] uppercase tracking-widest text-muted-foreground">
              {["ID", "NAME", "REACH", "CPM", "STATUS"].map((h) => (
                <div key={h} className="bg-muted/50 px-4 py-2">
                  {h}
                </div>
              ))}
            </div>
            {campaigns.map((c) => (
              <div
                key={c.id}
                className="grid grid-cols-[minmax(80px,1fr)_2fr_1fr_1fr_1fr] gap-px bg-border text-xs"
              >
                <div className="bg-background px-4 py-3 font-mono text-muted-foreground">
                  {c.id}
                </div>
                <div className="bg-background px-4 py-3 font-medium">
                  {c.name}
                </div>
                <div className="bg-background px-4 py-3 font-mono">
                  {formatReach(c.reach)}
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
        </main>
      </div>

      {/* sidebar slot — variant switcher passes the active chat panel here */}
      {children}
    </div>
  );
}
