"use client";

import { DataTable, StatusBadge, type Column } from "@/components/dashboard/common";
import { formatDuration, formatRelativeTime } from "@/lib/format";
import type { ExecutionLog } from "@/lib/tools/logs";

const COLUMNS: Column<ExecutionLog>[] = [
  {
    key: "id",
    header: "Execution",
    width: "minmax(120px, 1.1fr)",
    cell: (r) => <span className="text-foreground">exec_{r.id.slice(-6)}</span>,
  },
  {
    key: "status",
    header: "Status",
    width: "minmax(110px, 1fr)",
    cell: (r) => <StatusBadge status={r.status} />,
  },
  {
    key: "tool",
    header: "Tool",
    width: "minmax(150px, 1.6fr)",
    cell: (r) => <span>{r.toolName}</span>,
  },
  {
    key: "duration",
    header: "Duration",
    width: "100px",
    align: "right",
    cell: (r) => (r.durationMs == null ? "—" : formatDuration(r.durationMs)),
  },
  {
    key: "when",
    header: "When",
    width: "minmax(100px, 1fr)",
    align: "right",
    cell: (r) => (
      <span className="text-muted-foreground">{formatRelativeTime(r.createdAt)}</span>
    ),
  },
];

export function LogsTableClient({
  rows,
  projectId,
}: {
  rows: ExecutionLog[];
  projectId: string;
}) {
  return (
    <DataTable
      columns={COLUMNS}
      rows={rows}
      rowKey={(r) => r.id}
      rowHref={(r) => `/dashboard/projects/${projectId}/runs/${r.conversationId}`}
    />
  );
}
