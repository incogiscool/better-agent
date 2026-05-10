"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireCurrentUser } from "@/lib/auth/session";
import {
  createProjectForOwner,
  deleteProjectForOwner,
  regenerateProjectCredentialsForOwner,
  updateProjectForOwner,
} from "@/lib/projects/service";
import type {
  CreateProjectActionState,
  RegenerateKeysActionState,
  UpdateProjectActionState,
} from "@/lib/types";

const projectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required.").max(100),
  baseUrl: z.url("Base URL must be a valid URL.").optional().or(z.literal("")),
  systemPrompt: z.string().trim().max(5000).optional().or(z.literal("")),
});

function parseProjectFormData(formData: FormData) {
  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    baseUrl: formData.get("baseUrl"),
    systemPrompt: formData.get("systemPrompt"),
  });

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  return {
    success: true as const,
    data: {
      name: parsed.data.name,
      baseUrl: parsed.data.baseUrl || undefined,
      systemPrompt: parsed.data.systemPrompt || undefined,
    },
  };
}

export async function createProjectAction(
  _prevState: CreateProjectActionState,
  formData: FormData,
): Promise<CreateProjectActionState> {
  const user = await requireCurrentUser();
  const parsed = parseProjectFormData(formData);

  if (!parsed.success) {
    return {
      errors: parsed.errors,
      message: "Please fix the highlighted fields.",
    };
  }

  const result = await createProjectForOwner({
    ownerId: user.id,
    ...parsed.data,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects/new");

  return {
    message:
      "Project created. Save the secret key now, because it will not be shown again.",
    project: {
      id: result.project.id,
      name: result.project.name,
      clientKey: result.clientKey,
      secretKey: result.secretKey,
    },
  };
}

export async function updateProjectSettingsAction(
  projectId: string,
  _prevState: UpdateProjectActionState,
  formData: FormData,
): Promise<UpdateProjectActionState> {
  const user = await requireCurrentUser();
  const parsed = parseProjectFormData(formData);

  if (!parsed.success) {
    return {
      errors: parsed.errors,
      message: "Please fix the highlighted fields.",
    };
  }

  const result = await updateProjectForOwner({
    projectId,
    ownerId: user.id,
    ...parsed.data,
  });

  if (result.count === 0) {
    return {
      message: "Project not found.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}/settings`);

  return {
    message: "Project settings saved.",
  };
}

export async function regenerateProjectKeysAction(
  projectId: string,
  _prevState: RegenerateKeysActionState,
): Promise<RegenerateKeysActionState> {
  void _prevState;

  const user = await requireCurrentUser();
  const result = await regenerateProjectCredentialsForOwner({
    projectId,
    ownerId: user.id,
  });

  if (result.updated.count === 0) {
    return {
      message: "Project not found.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}/settings`);

  return {
    message: "Keys regenerated. Save the new secret key now.",
    credentials: {
      clientKey: result.clientKey,
      secretKey: result.secretKey,
    },
  };
}

export async function deleteProjectAction(projectId: string) {
  const user = await requireCurrentUser();
  const result = await deleteProjectForOwner({
    projectId,
    ownerId: user.id,
  });

  revalidatePath("/dashboard");

  if (result.count === 0) {
    redirect("/dashboard");
  }

  redirect("/dashboard");
}
