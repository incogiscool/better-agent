import { requireCurrentUser } from "@/lib/auth/session";
import { OnboardingWizard } from "@/components/projects/onboarding";

export default async function NewProjectPage() {
  await requireCurrentUser();

  return (
    <main className="flex h-full flex-col">
      <div className="space-y-1 border-b border-border px-6 py-5">
        <h1 className="text-sm font-medium">New project</h1>
        <p className="text-[11px] text-muted-foreground">
          A few steps to get from zero to a synced agent.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <OnboardingWizard />
      </div>
    </main>
  );
}
