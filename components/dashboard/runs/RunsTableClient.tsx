"use client";

import Link from "next/link";
import { DataTable, StatusBadge, EmptyState, type Column } from "@/components/dashboard/common";
import { formatCompact, formatCount, formatRelativeTime } from "@/lib/format";
import type { ConversationListItem } from "@/lib/conversations/queries";

const COLUMNS: Column<ConversationListItem>[] = [
  {
    key: "id",
    header: "ID",
    width: "minmax(120px, 1.2fr)",
    cell: (row) => <span className="text-foreground">run_{row.id.slice(-6)}</span>,
  },
  {
    key: "status",
    header: "Status",
    width: "minmax(110px, 1fr)",
    cell: (row) => <StatusBadge status={row.failed ? "failed" : row.status} />,
  },
  {
    key: "user",
    header: "User",
    width: "minmax(110px, 1fr)",
    cell: (row) => (
      <span className="text-muted-foreground">u_{row.endUserId.slice(-6)}</span>
    ),
  },
  {
    key: "model",
    header: "Model",
    width: "minmax(110px, 1fr)",
    cell: (row) => (
      <span className="text-muted-foreground">{row.primaryModel ?? "—"}</span>
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
      <span className="text-muted-foreground">{formatRelativeTime(row.createdAt)}</span>
    ),
  },
];

export function RunsTableClient({
  items,
  projectId,
}: {
  items: ConversationListItem[];
  projectId: string;
}) {
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

  return (
    <DataTable
      columns={COLUMNS}
      rows={items}
      rowKey={(r) => r.id}
      rowHref={(r) => `/dashboard/projects/${projectId}/runs/${r.id}`}
    />
  );
}
