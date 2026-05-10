import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectSettingsForm } from "@/app/(dashboard)/dashboard/projects/[id]/settings/ProjectSettingsForm";
import { Button } from "@/components/ui/button";
import { requireCurrentUser } from "@/lib/auth/session";
import { getProjectForOwner } from "@/lib/projects/service";

type ProjectSettingsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProjectSettingsPage({
  params,
}: ProjectSettingsPageProps) {
  const user = await requireCurrentUser();
  const { id } = await params;
  const project = await getProjectForOwner(id, user.id);

  if (!project) {
    notFound();
  }

  return (
    <main className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold">Project settings</h1>
          <p className="text-sm text-muted-foreground">{project.name}</p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/dashboard/projects/${project.id}`}>Back to project</Link>
        </Button>
      </div>

      <ProjectSettingsForm project={project} />
    </main>
  );
}
