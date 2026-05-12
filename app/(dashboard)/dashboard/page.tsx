import Link from "next/link";
import { requireCurrentUser } from "@/lib/auth/session";
import { listProjectsForOwner } from "@/lib/projects/service";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const user = await requireCurrentUser();
  const projects = await listProjectsForOwner(user.id);

  return (
    <main className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-6 py-5">
        <h1 className="text-sm font-medium">Projects</h1>
        <Button asChild size="sm">
          <Link href="/dashboard/projects/new">New project</Link>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {projects.length === 0 ? (
          <div className="space-y-1 border border-border p-5">
            <h2 className="text-sm font-medium">No projects yet</h2>
            <p className="text-xs text-muted-foreground">
              Start with a project so we can generate your keys and get the sync
              flow ready.
            </p>
          </div>
        ) : (
          <div className="grid gap-px border border-border bg-border md:grid-cols-2">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="space-y-3 bg-background p-5 transition-colors hover:bg-muted/40"
              >
                <div className="space-y-0.5">
                  <h2 className="text-sm font-medium">{project.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {project.baseUrl ?? "No base URL configured"}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="border border-border px-1.5 py-0.5 font-mono">
                    {project.plan}
                  </span>
                  <span className="font-mono truncate">{project.clientKey}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
