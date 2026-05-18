import { redirect } from "next/navigation";
import { resolveActiveProjectId } from "@/lib/dashboard/context";

export default async function LogsRedirectPage() {
  const projectId = await resolveActiveProjectId();
  if (!projectId) redirect("/dashboard");
  redirect(`/dashboard/projects/${projectId}/logs`);
}
