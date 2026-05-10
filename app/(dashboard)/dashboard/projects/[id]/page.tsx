import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteProjectAction } from "@/lib/actions";
import { requireCurrentUser } from "@/lib/auth/session";
import { getProjectForOwner } from "@/lib/projects/service";

type ProjectPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const user = await requireCurrentUser();
  const { id } = await params;
  const project = await getProjectForOwner(id, user.id);

  if (!project) {
    notFound();
  }

  const deleteAction = deleteProjectAction.bind(null, project.id);

  return (
    <main className="space-y-8 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold">{project.name}</h1>
          <p className="text-sm text-muted-foreground">
            {project.baseUrl ?? "No base URL configured yet"}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/dashboard/projects/${project.id}/settings`}>
            Settings
          </Link>
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 border border-border p-4">
          <h2 className="text-lg font-semibold">Project details</h2>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="font-medium">Plan</dt>
              <dd className="text-muted-foreground">{project.plan}</dd>
            </div>
            <div>
              <dt className="font-medium">Created</dt>
              <dd className="text-muted-foreground">
                {project.createdAt.toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="font-medium">Updated</dt>
              <dd className="text-muted-foreground">
                {project.updatedAt.toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>

        <div className="space-y-2 border border-border p-4">
          <h2 className="text-lg font-semibold">Integration</h2>
          <div className="space-y-1">
            <p className="text-sm font-medium">Client key</p>
            <p className="break-all border border-border p-3 font-mono text-xs">
              {project.clientKey}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Secret keys are only shown when a project is created or regenerated.
          </p>
        </div>
      </section>

      <section className="space-y-2 border border-border p-4">
        <h2 className="text-lg font-semibold">System prompt</h2>
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          {project.systemPrompt || "No system prompt configured yet."}
        </p>
      </section>

      <section className="space-y-4 border border-border p-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Danger zone</h2>
          <p className="text-sm text-muted-foreground">
            Deleting a project removes its synced configuration and history.
          </p>
        </div>
        <form action={deleteAction}>
          <Button type="submit" variant="destructive">
            Delete project
          </Button>
        </form>
      </section>
    </main>
  );
}
