import { Suspense } from "react";
import Link from "next/link";
import { loadProjectContext } from "@/lib/dashboard/context";
import {
  getCacheStats,
  getCostBreakdown,
  getTopConversationsByCost,
  getUsageSummary,
} from "@/lib/billing/queries";
import {
  SectionHeader,
  StatCard,
  StatCardGrid,
  StatGridSkeleton,
  UsageBar,
  CardSkeleton,
  EmptyState,
} from "@/components/dashboard/common";
import { Button } from "@/components/ui/button";
import {
  formatCompact,
  formatCount,
  formatCurrency,
  formatDate,
  formatPercent,
} from "@/lib/format";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function UsagePage({ params }: PageProps) {
  const { id } = await params;
  const { project } = await loadProjectContext(id);

  return (
    <main className="space-y-6 px-6 py-6">
      <SectionHeader
        size="lg"
        className="border-0 p-0"
        title="Usage"
        description="Credits, tokens, and cost for the current billing period."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/projects/${id}/settings`}>Plan settings</Link>
          </Button>
        }
      />

      <Suspense fallback={<StatGridSkeleton />}>
        <CurrentPeriod projectId={id} plan={project.plan} />
      </Suspense>

      <div className="grid gap-4 md:grid-cols-2">
        <Suspense fallback={<CardSkeleton />}>
          <CostBreakdown projectId={id} />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <CacheStats projectId={id} />
        </Suspense>
      </div>

      <Suspense fallback={<CardSkeleton />}>
        <TopConversations projectId={id} />
      </Suspense>

      <Suspense fallback={<CardSkeleton />}>
        <PeriodHistory projectId={id} />
      </Suspense>
    </main>
  );
}

async function CurrentPeriod({
  projectId,
  plan,
}: {
  projectId: string;
  plan: string;
}) {
  const summary = await getUsageSummary(projectId);
  const { current } = summary;
  const remaining = Math.max(0, current.includedCredits - current.creditsUsed);

  return (
    <section className="space-y-4">
      <div className="border border-border p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Plan
            </p>
            <p className="font-mono text-sm">{plan}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Period
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(current.startsAt)} → {formatDate(current.endsAt)}
            </p>
          </div>
        </div>
        <div className="mt-5 space-y-2">
          <UsageBar
            used={current.creditsUsed}
            total={current.includedCredits}
            overage={current.overageCredits}
          />
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>
              {formatCount(current.creditsUsed)} /{" "}
              {formatCount(current.includedCredits)} credits
            </span>
            <span>{formatCount(remaining)} remaining</span>
          </div>
        </div>
      </div>

      <StatCardGrid columns={4}>
        <StatCard
          label="Credits used"
          value={formatCompact(current.creditsUsed)}
        />
        <StatCard
          label="Credits remaining"
          value={formatCompact(remaining)}
        />
        <StatCard
          label="Overage"
          value={formatCompact(current.overageCredits)}
          tone={current.overageCredits > 0 ? "negative" : "default"}
        />
        <StatCard
          label="Projected"
          value={formatCompact(current.estimatedEndOfPeriodCredits)}
          hint="end of period"
        />
      </StatCardGrid>
    </section>
  );
}

async function CostBreakdown({ projectId }: { projectId: string }) {
  const { current } = await getUsageSummary(projectId);
  const rows = await getCostBreakdown(projectId, current.id);

  const totalCredits = rows.reduce((s, r) => s + r.credits, 0);

  return (
    <section className="space-y-2 border border-border p-5">
      <h2 className="text-sm font-medium">Cost by event</h2>
      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">No charges this period.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => {
            const share = totalCredits > 0 ? row.credits / totalCredits : 0;
            return (
              <li key={row.type} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono">{row.type}</span>
                  <span className="text-muted-foreground">
                    {formatCount(row.credits)} credits ·{" "}
                    {formatCurrency(row.costUsd)}
                  </span>
                </div>
                <div className="h-1 bg-muted">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${share * 100}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

async function CacheStats({ projectId }: { projectId: string }) {
  const { current } = await getUsageSummary(projectId);
  const stats = await getCacheStats(projectId, current.id);

  return (
    <section className="space-y-3 border border-border p-5">
      <h2 className="text-sm font-medium">Cache hit rate</h2>
      <div className="text-2xl font-semibold">
        {stats.cacheHitRate == null
          ? "—"
          : formatPercent(stats.cacheHitRate, { digits: 1 })}
      </div>
      <p className="text-[11px] text-muted-foreground">
        Cached: {formatCompact(stats.tokensCached)} · Input:{" "}
        {formatCompact(stats.tokensInput)} · Output:{" "}
        {formatCompact(stats.tokensOutput)}
      </p>
    </section>
  );
}

async function TopConversations({ projectId }: { projectId: string }) {
  const { current } = await getUsageSummary(projectId);
  const rows = await getTopConversationsByCost(projectId, current.id, 5);

  if (rows.length === 0) {
    return (
      <EmptyState
        title="No conversations this period"
        description="Once an end user chats with the agent, top-cost runs will appear here."
      />
    );
  }

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-medium">Top conversations by cost</h2>
      <div className="divide-y divide-border border border-border">
        {rows.map((row) => (
          <Link
            key={row.conversationId}
            href={`/dashboard/projects/${projectId}/runs/${row.conversationId}`}
            className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted/40"
          >
            <div className="space-y-0.5">
              <p className="font-mono text-xs">
                run_{row.conversationId.slice(-6)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {row.conversation
                  ? `u_${row.conversation.endUserId.slice(-6)} · ${formatDate(row.conversation.createdAt)}`
                  : "missing"}
              </p>
            </div>
            <div className="space-y-0.5 text-right">
              <p className="font-mono text-xs">{formatCount(row.credits)} credits</p>
              <p className="text-[11px] text-muted-foreground">
                {formatCompact(row.tokens)} tokens · {formatCurrency(row.costUsd)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

async function PeriodHistory({ projectId }: { projectId: string }) {
  const { history } = await getUsageSummary(projectId);

  if (history.length === 0) return null;

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-medium">Recent periods</h2>
      <div className="divide-y divide-border border border-border">
        {history.map((p) => (
          <div
            key={p.id}
            className="grid items-center gap-4 px-4 py-3 md:grid-cols-[1fr_2fr_auto]"
          >
            <div className="space-y-0.5 text-xs">
              <p>
                {formatDate(p.startsAt)} → {formatDate(p.endsAt)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {formatCount(p.creditsUsed)} of{" "}
                {formatCount(p.includedCredits)} credits used
                {p.overageCredits > 0 && (
                  <> · {formatCount(p.overageCredits)} overage</>
                )}
              </p>
            </div>
            <UsageBar
              used={p.creditsUsed}
              total={p.includedCredits}
              overage={p.overageCredits}
            />
            <span className="text-right font-mono text-[11px] text-muted-foreground">
              {formatPercent(
                p.includedCredits > 0
                  ? p.creditsUsed / p.includedCredits
                  : null,
                { digits: 0 },
              )}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
