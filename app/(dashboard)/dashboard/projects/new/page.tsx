import { requireCurrentUser } from "@/lib/auth/session";
import { NewProjectForm } from "@/app/(dashboard)/dashboard/projects/new/NewProjectForm";

export default async function NewProjectPage() {
  await requireCurrentUser();

  return (
    <main className="space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold">Create project</h1>
        <p className="text-sm text-muted-foreground">
          We&apos;ll generate a client key and a secret key for this project as
          soon as it is created.
        </p>
      </div>

      <NewProjectForm />
    </main>
  );
}
