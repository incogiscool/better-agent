import { Suspense } from "react";
import Link from "next/link";
import { loadProjectContext } from "@/lib/dashboard/context";
import { listToolsForProject } from "@/lib/tools/queries";
import {
  SectionHeader,
  EmptyState,
  TableSkeleton,
} from "@/components/dashboard/common";
import { ToolToggleForm } from "@/components/dashboard/tools/ToolToggleForm";
import { ToolDescriptionEditor } from "@/components/dashboard/tools/ToolDescriptionEditor";
import { formatRelativeTime } from "@/lib/format";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ToolsPage({ params }: PageProps) {
  const { id } = await params;
  await loadProjectContext(id);

  return (
    <main className="space-y-6 px-6 py-6">
      <SectionHeader
        size="lg"
        className="border-0 p-0"
        title="Tools"
        description="Every tool synced from your codebase. Toggle, rewrite descriptions, or inspect schemas."
      />
      <Suspense fallback={<TableSkeleton rows={6} columns={4} />}>
        <ToolsList projectId={id} />
      </Suspense>
    </main>
  );
}

async function ToolsList({ projectId }: { projectId: string }) {
  const tools = await listToolsForProject(projectId);

  if (tools.length === 0) {
    return (
      <EmptyState
        title="No tools synced yet"
        description="Run `npx betteragent sync` in your project root after exposing routes or server actions."
      />
    );
  }

  const routes = tools.filter((t) => t.type === "route");
  const actions = tools.filter((t) => t.type === "client_invocation");

  return (
    <div className="space-y-8">
      {routes.length > 0 && (
        <ToolGroup
          projectId={projectId}
          title="Routes"
          subtitle="HTTP endpoints called server-to-server by the chat engine."
          tools={routes}
        />
      )}
      {actions.length > 0 && (
        <ToolGroup
          projectId={projectId}
          title="Client invocations"
          subtitle="Server Actions + client-only effects dispatched in the browser."
          tools={actions}
        />
      )}
    </div>
  );
}

function ToolGroup({
  projectId,
  title,
  subtitle,
  tools,
}: {
  projectId: string;
  title: string;
  subtitle: string;
  tools: Awaited<ReturnType<typeof listToolsForProject>>;
}) {
  return (
    <section className="space-y-2">
      <div className="space-y-0.5">
        <h2 className="text-sm font-medium">{title}</h2>
        <p className="text-[11px] text-muted-foreground">{subtitle}</p>
      </div>
      <div className="divide-y divide-border border border-border">
        {tools.map((tool) => {
          const disabled = tool.override?.enabled === false;
          return (
            <article
              key={tool.id}
              className="grid gap-4 px-4 py-4 md:grid-cols-[minmax(180px,260px)_minmax(0,1fr)_auto]"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/projects/${projectId}/tools/${tool.id}`}
                    className="font-mono text-xs font-medium hover:underline"
                  >
                    {tool.name}
                  </Link>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    v{tool.version}
                  </span>
                </div>
                {tool.method && tool.path && (
                  <div className="font-mono text-[11px] text-muted-foreground">
                    <span className="text-foreground">{tool.method}</span>{" "}
                    {tool.path}
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground">
                  Synced {formatRelativeTime(tool.lastSyncedAt)}
                  {tool.recentExecutions > 0 && (
                    <> · {tool.recentExecutions} executions</>
                  )}
                </p>
              </div>

              <div className={disabled ? "opacity-50" : undefined}>
                <ToolDescriptionEditor
                  projectId={projectId}
                  toolId={tool.id}
                  syncedDescription={tool.description}
                  overrideDescription={tool.override?.description ?? null}
                  aiGenerated={tool.aiGenerated}
                />
              </div>

              <div className="flex items-center justify-end">
                <ToolToggleForm
                  projectId={projectId}
                  toolId={tool.id}
                  enabled={tool.override?.enabled !== false}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
