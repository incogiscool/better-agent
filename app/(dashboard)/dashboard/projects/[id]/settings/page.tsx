import { ProjectSettingsForm } from "@/app/(dashboard)/dashboard/projects/[id]/settings/ProjectSettingsForm";
import { ProjectDangerZone } from "@/app/(dashboard)/dashboard/projects/[id]/settings/ProjectDangerZone";
import { loadProjectContext } from "@/lib/dashboard/context";
import { PLAN_CONFIGS } from "@/lib/billing";
import { SectionHeader } from "@/components/dashboard/common";
import { formatDate } from "@/lib/format";

type ProjectSettingsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectSettingsPage({
  params,
}: ProjectSettingsPageProps) {
  const { id } = await params;
  const { project } = await loadProjectContext(id);

  return (
    <main className="space-y-6 px-6 py-6">
      <SectionHeader
        size="lg"
        className="border-0 p-0"
        title="Settings"
        description={`Project created ${formatDate(project.createdAt)}.`}
      />

      <ProjectSettingsForm
        project={{
          id: project.id,
          name: project.name,
          baseUrl: project.baseUrl,
          systemPrompt: project.systemPrompt,
          clientKey: project.clientKey,
          allowedOrigins: project.allowedOrigins,
          byokAvailable: PLAN_CONFIGS[project.plan].byokAvailable,
          anthropicApiKeyMasked: project.anthropicApiKeyMasked,
        }}
      />

      <ProjectDangerZone projectId={project.id} projectName={project.name} />
    </main>
  );
}
