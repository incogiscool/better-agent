import { Suspense } from "react";
import Link from "next/link";
import { loadProjectContext } from "@/lib/dashboard/context";
import {
  listExecutionLogsForProject,
  listToolOptionsForProject,
  type ExecutionLog,
} from "@/lib/tools/logs";
import { ToolExecutionStatus } from "@/lib/generated/prisma/enums";
import {
  SectionHeader,
  EmptyState,
  TableSkeleton,
} from "@/components/dashboard/common";
import { LogsFilters } from "@/components/dashboard/logs/LogsFilters";
import { LogsTableClient } from "@/components/dashboard/logs/LogsTableClient";
import { Button } from "@/components/ui/button";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    status?: string;
    toolId?: string;
    cursor?: string;
  }>;
};

const STATUS_VALUES = new Set<string>(Object.values(ToolExecutionStatus));

export default async function LogsPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  await loadProjectContext(id);

  const toolOptions = await listToolOptionsForProject(id);

  return (
    <main className="space-y-6 px-6 py-6">
      <SectionHeader
        size="lg"
        className="border-0 p-0"
        title="Logs"
        description="Every tool execution recorded by the chat engine. Filter to drill in."
      />

      <LogsFilters toolOptions={toolOptions} />

      <Suspense fallback={<TableSkeleton rows={10} columns={5} />}>
        <LogsTable
          projectId={id}
          status={sp.status}
          toolId={sp.toolId}
          cursor={sp.cursor}
        />
      </Suspense>
    </main>
  );
}

async function LogsTable({
  projectId,
  status,
  toolId,
  cursor,
}: {
  projectId: string;
  status?: string;
  toolId?: string;
  cursor?: string;
}) {
  const safeStatus =
    status && STATUS_VALUES.has(status)
      ? (status as ToolExecutionStatus)
      : undefined;

  const { items, nextCursor } = await listExecutionLogsForProject(projectId, {
    status: safeStatus,
    toolId: toolId || undefined,
    cursor: cursor || undefined,
    limit: 50,
  });

  if (items.length === 0) {
    return (
      <EmptyState
        title="No logs match these filters"
        description="Either no executions exist yet, or your filters exclude all of them."
      />
    );
  }

  const nextParams = nextCursor
    ? buildQuery({ status, toolId, cursor: nextCursor })
    : null;

  return (
    <div className="space-y-3">
      <LogsTableClient rows={items} projectId={projectId} />
      {nextParams && (
        <div className="flex justify-end">
          <Button asChild variant="outline" size="sm">
            <Link href={`?${nextParams}`}>Load more</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

function buildQuery(input: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) {
    if (value) params.set(key, value);
  }
  return params.toString();
}
