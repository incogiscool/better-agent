import { Suspense } from "react";
import { loadProjectContext } from "@/lib/dashboard/context";
import { ProjectBreadcrumb } from "@/components/dashboard/common";
import { CreditWarningBanner } from "@/components/dashboard/common/CreditWarningBanner";

type LayoutProps = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export default async function ProjectLayout({ params, children }: LayoutProps) {
  const { id } = await params;
  const { project } = await loadProjectContext(id);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-6 py-3">
        <ProjectBreadcrumb projectId={project.id} projectName={project.name} />
      </div>
      <Suspense fallback={null}>
        <CreditWarningBanner projectId={project.id} plan={project.plan} />
      </Suspense>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
