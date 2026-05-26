import Link from "next/link";
import { notFound } from "next/navigation";
import { loadProjectContext } from "@/lib/dashboard/context";
import { getToolDetail } from "@/lib/tools/queries";
import { Button } from "@/components/ui/button";
import {
  SectionHeader,
  JsonViewer,
} from "@/components/dashboard/common";
import { ToolToggleForm } from "@/components/dashboard/tools/ToolToggleForm";
import { ToolDescriptionEditor } from "@/components/dashboard/tools/ToolDescriptionEditor";
import { ExecutionsTableClient } from "@/components/dashboard/tools/ExecutionsTableClient";
import { formatRelativeTime } from "@/lib/format";

type PageProps = {
  params: Promise<{ id: string; toolId: string }>;
};

type ExecutionRow = {
  id: string;
  conversationId: string;
  status: string;
  durationMs: number | null;
  createdAt: Date;
  errorMessage: string | null;
};

export default async function ToolDetailPage({ params }: PageProps) {
  const { id, toolId } = await params;
  await loadProjectContext(id);

  const tool = await getToolDetail(id, toolId);
  if (!tool) notFound();

  const enabled = tool.override?.enabled !== false;

  return (
    <main className="space-y-6 px-6 py-6">
      <SectionHeader
        size="lg"
        className="border-0 p-0"
        title={
          <span className="flex items-center gap-3">
            <span className="font-mono">{tool.name}</span>
            <span className="font-mono text-xs text-muted-foreground">
              v{tool.version}
            </span>
            <span className="border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              {tool.type}
            </span>
          </span>
        }
        description={
          tool.method && tool.path
            ? `${tool.method} ${tool.path}`
            : `Synced ${formatRelativeTime(tool.lastSyncedAt)}`
        }
        actions={
          <div className="flex items-center gap-3">
            <ToolToggleForm
              projectId={id}
              toolId={tool.id}
              enabled={enabled}
            />
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/projects/${id}/tools`}>← Back</Link>
            </Button>
          </div>
        }
      />

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Description</h2>
        <div className="border border-border p-4">
          <ToolDescriptionEditor
            projectId={id}
            toolId={tool.id}
            syncedDescription={tool.description}
            overrideDescription={tool.override?.description ?? null}
            aiGenerated={tool.aiGeneratedDescription}
          />
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Input schema</h2>
        <JsonViewer value={tool.inputSchema} label="JSON Schema" defaultOpen />
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Recent executions</h2>
        <ExecutionsTableClient
          projectId={id}
          rows={tool.executions.map((e) => ({
            id: e.id,
            conversationId: e.conversationId,
            status: e.status,
            durationMs: e.durationMs,
            createdAt: e.createdAt,
            errorMessage: e.errorMessage,
          }))}
        />
      </section>
    </main>
  );
}

