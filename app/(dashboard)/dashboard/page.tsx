import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { loadProjectsForCurrentUser } from "@/lib/dashboard/context";
import {
  SectionHeader,
  EmptyState,
  CardSkeleton,
} from "@/components/dashboard/common";
import { formatRelativeTime } from "@/lib/format";

function maskClientKey(key: string): string {
  if (key.length <= 16) return key;
  return `${key.slice(0, 12)}…${key.slice(-4)}`;
}

type PageProps = {
  searchParams: Promise<{ skip?: string }>;
};

export default async function DashboardPage({ searchParams }: PageProps) {
  const { skip } = await searchParams;
  return (
    <main className="flex h-full flex-col">
      <SectionHeader
        title="Projects"
        actions={
          <Button asChild size="sm">
            <Link href="/dashboard/projects/new">New project</Link>
          </Button>
        }
      />
      <div className="flex-1 overflow-y-auto p-6">
        <Suspense
          fallback={
            <div className="grid gap-px border border-border bg-border md:grid-cols-2">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          }
        >
          <ProjectsList skip={skip} />
        </Suspense>
      </div>
    </main>
  );
}

async function ProjectsList({ skip }: { skip?: string }) {
  const { projects } = await loadProjectsForCurrentUser();

  if (projects.length === 0 && skip !== "1") {
    redirect("/dashboard/projects/new");
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        title="No projects yet"
        description="Start with a project so we can generate your keys and get the sync flow ready."
        action={
          <Button asChild size="sm">
            <Link href="/dashboard/projects/new">
              Create your first project
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-px border border-border bg-border md:grid-cols-2">
      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/dashboard/projects/${project.id}/runs`}
          className="space-y-3 bg-background p-5 transition-colors hover:bg-muted/40"
        >
          <div className="flex items-start gap-3">
            <span className="mt-1 inline-block size-2 bg-primary" aria-hidden />
            <div className="min-w-0 flex-1 space-y-0.5">
              <h2 className="truncate text-sm font-medium">{project.name}</h2>
              <p className="truncate text-[11px] text-muted-foreground">
                {project.baseUrl ?? "No base URL configured"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="border border-border px-1.5 py-0.5 font-mono">
              {project.plan}
            </span>
            <span className="truncate font-mono">
              {maskClientKey(project.clientKey)}
            </span>
            <span className="ml-auto whitespace-nowrap">
              {formatRelativeTime(project.updatedAt)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
