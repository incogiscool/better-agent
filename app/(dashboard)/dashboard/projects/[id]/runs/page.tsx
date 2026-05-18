import { Suspense } from "react";
import Link from "next/link";
import { loadProjectContext } from "@/lib/dashboard/context";
import {
  getConversationStats,
  listConversationsForProject,
} from "@/lib/conversations/queries";
import {
  StatCard,
  StatCardGrid,
  StatGridSkeleton,
  TableSkeleton,
  EmptyState,
  DataTable,
  StatusBadge,
  SectionHeader,
  type Column,
} from "@/components/dashboard/common";
import {
  formatCompact,
  formatCount,
  formatCurrency,
  formatDuration,
  formatPercent,
  formatRelativeTime,
} from "@/lib/format";
import type { ConversationListItem } from "@/lib/conversations/queries";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function RunsPage({ params }: PageProps) {
  const { id } = await params;
  await loadProjectContext(id);

  return (
    <main className="space-y-6 px-6 py-6">
      <SectionHeader
        title="Runs"
        description="Every agent run from the last 24 hours. Click a row to inspect the timeline."
        size="lg"
        className="border-0 p-0"
      />

      <Suspense fallback={<StatGridSkeleton />}>
        <StatsSection projectId={id} />
      </Suspense>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Recent runs</h2>
          <p className="text-[11px] text-muted-foreground">
            Updates on refresh
          </p>
        </div>
        <Suspense fallback={<TableSkeleton rows={8} columns={6} />}>
          <RunsTable projectId={id} />
        </Suspense>
      </div>
    </main>
  );
}

async function StatsSection({ projectId }: { projectId: string }) {
  const stats = await getConversationStats(projectId, 24);

  const delta = stats.totalRuns - stats.prevTotalRuns;
  const deltaPct =
    stats.prevTotalRuns > 0
      ? (delta / stats.prevTotalRuns) * 100
      : null;
  const deltaText =
    deltaPct == null
      ? "no prior data"
      : `${delta >= 0 ? "+" : ""}${deltaPct.toFixed(0)}% vs yesterday`;

  return (
    <StatCardGrid columns={4}>
      <StatCard
        label="Runs · 24h"
        value={formatCount(stats.totalRuns)}
        hint={deltaText}
        tone={
          deltaPct == null
            ? "default"
            : deltaPct >= 0
              ? "positive"
              : "negative"
        }
      />
      <StatCard
        label="p50 latency"
        value={
          stats.p50LatencyMs == null
            ? "—"
            : formatDuration(stats.p50LatencyMs)
        }
        hint="tool call duration"
      />
      <StatCard
        label="Tokens"
        value={formatCompact(stats.totalTokens)}
        hint={`${formatCurrency(stats.totalCostUsd)} spent`}
      />
      <StatCard
        label="Failure rate"
        value={
          stats.failureRate == null ? "—" : formatPercent(stats.failureRate)
        }
        hint={`${stats.failedRuns} of ${stats.totalRuns} failed`}
        tone={stats.failureRate && stats.failureRate > 0.05 ? "negative" : "default"}
      />
    </StatCardGrid>
  );
}

async function RunsTable({ projectId }: { projectId: string }) {
  const { items } = await listConversationsForProject(projectId, { limit: 30 });

  if (items.length === 0) {
    return (
      <EmptyState
        title="No runs yet"
        description="Once an end user chats with your agent, the conversation will show up here."
        action={
          <Link
            href={`/dashboard/projects/${projectId}/tools`}
            className="text-[11px] font-medium text-primary hover:underline"
          >
            Check synced tools →
          </Link>
        }
      />
    );
  }

  const columns: Column<ConversationListItem>[] = [
    {
      key: "id",
      header: "ID",
      width: "minmax(120px, 1.2fr)",
      cell: (row) => (
        <span className="text-foreground">run_{row.id.slice(-6)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "minmax(110px, 1fr)",
      cell: (row) => (
        <StatusBadge status={row.failed ? "failed" : row.status} />
      ),
    },
    {
      key: "user",
      header: "User",
      width: "minmax(110px, 1fr)",
      cell: (row) => (
        <span className="text-muted-foreground">
          u_{row.endUserId.slice(-6)}
        </span>
      ),
    },
    {
      key: "model",
      header: "Model",
      width: "minmax(110px, 1fr)",
      cell: (row) => (
        <span className="text-muted-foreground">
          {row.primaryModel ?? "—"}
        </span>
      ),
    },
    {
      key: "tools",
      header: "Tools",
      width: "70px",
      align: "right",
      cell: (row) => formatCount(row.toolCallCount),
    },
    {
      key: "tokens",
      header: "Tokens",
      width: "90px",
      align: "right",
      cell: (row) => formatCompact(row.totalTokens),
    },
    {
      key: "started",
      header: "Started",
      width: "minmax(100px, 1fr)",
      align: "right",
      cell: (row) => (
        <span className="text-muted-foreground">
          {formatRelativeTime(row.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={items}
      rowKey={(r) => r.id}
      rowHref={(r) => `/dashboard/projects/${projectId}/runs/${r.id}`}
    />
  );
}
