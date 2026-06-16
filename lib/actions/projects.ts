"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireCurrentUser } from "@/lib/auth/session";
import {
  clearProjectByokKey,
  createProjectForOwner,
  deleteProjectForOwner,
  getProjectForOwner,
  regenerateProjectCredentialsForOwner,
  setProjectByokKey,
  updateProjectForOwner,
} from "@/lib/projects/service";
import { prisma } from "@/lib/db";
import { checkOutboundUrlSync } from "@/lib/net/ssrf";
import { sendWelcomeEmail } from "@/lib/email/notifications";
import { PLAN_CONFIGS } from "@/lib/billing";
import { encryptSecret, maskAnthropicKey } from "@/lib/crypto/secrets";
import { validateAnthropicKey } from "@/lib/chat/validateAnthropicKey";
import type {
  ByokActionState,
  CreateProjectActionState,
  RegenerateKeysActionState,
  UpdateProjectActionState,
} from "@/lib/types";

const projectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required.").max(100),
  baseUrl: z.url("Base URL must be a valid URL.").optional().or(z.literal("")),
  systemPrompt: z.string().trim().max(5000).optional().or(z.literal("")),
});

/**
 * Parse the allowed-origins textarea (newline- or comma-separated) into a list
 * of normalized `scheme://host[:port]` origins. Returns an error message for
 * any entry that isn't a valid http(s) origin. An absent field (create flow)
 * yields `undefined` so the column is left untouched.
 */
function parseAllowedOrigins(
  raw: FormDataEntryValue | null,
): { ok: true; origins: string[] | undefined } | { ok: false; error: string } {
  if (raw === null) return { ok: true, origins: undefined };
  const tokens = String(raw)
    .split(/[\n,]/)
    .map((t) => t.trim())
    .filter(Boolean);

  const origins: string[] = [];
  for (const token of tokens) {
    let url: URL;
    try {
      url = new URL(token);
    } catch {
      return { ok: false, error: `"${token}" is not a valid URL.` };
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { ok: false, error: `"${token}" must be an http(s) origin.` };
    }
    if (!origins.includes(url.origin)) origins.push(url.origin);
  }
  return { ok: true, origins };
}

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

  if (parsed.data.baseUrl) {
    const unsafe = checkOutboundUrlSync(parsed.data.baseUrl);
    if (unsafe) {
      return {
        success: false as const,
        errors: { baseUrl: [`Base URL ${unsafe}.`] },
      };
    }
  }

  const origins = parseAllowedOrigins(formData.get("allowedOrigins"));
  if (!origins.ok) {
    return {
      success: false as const,
      errors: { allowedOrigins: [origins.error] },
    };
  }

  return {
    success: true as const,
    data: {
      name: parsed.data.name,
      baseUrl: parsed.data.baseUrl || undefined,
      systemPrompt: parsed.data.systemPrompt || undefined,
      allowedOrigins: origins.origins,
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

  const projectCount = await prisma.project.count({ where: { ownerId: user.id } });
  if (projectCount === 1) {
    sendWelcomeEmail(user.email, user.name).catch(console.error);
  }

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

function revalidateProjectPaths(projectId: string) {
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}/settings`);
}

export async function updateProjectByokAction(
  projectId: string,
  _prevState: ByokActionState,
  formData: FormData,
): Promise<ByokActionState> {
  void _prevState;
  const user = await requireCurrentUser();

  const project = await getProjectForOwner(projectId, user.id);
  if (!project) {
    return { error: "Project not found." };
  }
  if (!PLAN_CONFIGS[project.plan].byokAvailable) {
    return { error: "BYOK isn't available on this project's plan." };
  }

  const apiKey = String(formData.get("anthropicApiKey") ?? "").trim();
  if (!apiKey) {
    return { error: "Enter an Anthropic API key." };
  }
  if (!apiKey.startsWith("sk-ant-")) {
    return { error: "That doesn't look like an Anthropic key (expected sk-ant-…)." };
  }

  const validation = await validateAnthropicKey(apiKey);
  if (!validation.ok) {
    return { error: validation.error };
  }

  const masked = maskAnthropicKey(apiKey);
  const result = await setProjectByokKey({
    projectId,
    ownerId: user.id,
    encrypted: encryptSecret(apiKey),
    masked,
  });
  if (result.count === 0) {
    return { error: "Project not found." };
  }

  revalidateProjectPaths(projectId);
  return { message: "Key saved. This project now uses your Anthropic key.", masked };
}

export async function removeProjectByokAction(
  projectId: string,
  _prevState: ByokActionState,
): Promise<ByokActionState> {
  void _prevState;
  const user = await requireCurrentUser();

  const result = await clearProjectByokKey({ projectId, ownerId: user.id });
  if (result.count === 0) {
    return { error: "Project not found." };
  }

  revalidateProjectPaths(projectId);
  return { message: "Key removed. This project is back on platform credits." };
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
