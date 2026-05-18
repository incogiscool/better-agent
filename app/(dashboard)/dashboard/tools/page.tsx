import { redirect } from "next/navigation";
import { resolveActiveProjectId } from "@/lib/dashboard/context";

export default async function ToolsRedirectPage() {
  const projectId = await resolveActiveProjectId();
  if (!projectId) redirect("/dashboard");
  redirect(`/dashboard/projects/${projectId}/tools`);
}
