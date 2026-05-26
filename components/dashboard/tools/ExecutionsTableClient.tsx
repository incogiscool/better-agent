"use client";

import {
  DataTable,
  StatusBadge,
  type Column,
} from "@/components/dashboard/common";
import { formatDuration, formatRelativeTime } from "@/lib/format";

type ExecutionRow = {
  id: string;
  conversationId: string;
  status: string;
  durationMs: number | null;
  createdAt: Date;
  errorMessage: string | null;
};

const COLUMNS: Column<ExecutionRow>[] = [
  {
    key: "id",
    header: "Execution",
    width: "minmax(120px, 1fr)",
    cell: (r) => <span className="text-foreground">exec_{r.id.slice(-6)}</span>,
  },
  {
    key: "status",
    header: "Status",
    width: "minmax(110px, 1fr)",
    cell: (r) => <StatusBadge status={r.status} />,
  },
  {
    key: "duration",
    header: "Duration",
    width: "100px",
    align: "right",
    cell: (r) => (r.durationMs == null ? "—" : formatDuration(r.durationMs)),
  },
  {
    key: "createdAt",
    header: "When",
    width: "minmax(100px, 1fr)",
    align: "right",
    cell: (r) => (
      <span className="text-muted-foreground">
        {formatRelativeTime(r.createdAt)}
      </span>
    ),
  },
];

const EMPTY = (
  <div className="border border-border p-5 text-xs text-muted-foreground">
    No executions yet. Once an agent calls this tool, runs will show up here.
  </div>
);

export function ExecutionsTableClient({
  projectId,
  rows,
}: {
  projectId: string;
  rows: ExecutionRow[];
}) {
  return (
    <DataTable
      columns={COLUMNS}
      rows={rows}
      rowKey={(r) => r.id}
      rowHref={(r) => `/dashboard/projects/${projectId}/runs/${r.conversationId}`}
      emptyState={EMPTY}
    />
  );
}
