import Link from "next/link";
import { requireCurrentUser } from "@/lib/auth/session";
import { listProjectsForOwner } from "@/lib/projects/service";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const user = await requireCurrentUser();
  const projects = await listProjectsForOwner(user.id);

  return (
    <main className="space-y-8 p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage the apps you want BetterAgent to power.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects/new">New project</Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="space-y-3 border border-border p-4">
          <h2 className="text-lg font-semibold">No projects yet</h2>
          <p className="text-sm text-muted-foreground">
            Start with a project so we can generate your keys and get the sync
            flow ready.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="space-y-3 border border-border p-4 transition-colors hover:bg-muted/30"
            >
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">{project.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {project.baseUrl ?? "No base URL configured yet"}
                </p>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Plan: {project.plan}</p>
                <p className="break-all font-mono">{project.clientKey}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
