"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/auth/session";

const toolIdSchema = z.object({
  projectId: z.string().min(1),
  toolId: z.string().min(1),
});

async function assertOwnsTool(
  ownerId: string,
  projectId: string,
  toolId: string,
) {
  const tool = await prisma.tool.findFirst({
    where: {
      id: toolId,
      projectId,
      project: { ownerId },
    },
    select: { id: true, projectId: true },
  });
  if (!tool) {
    throw new Error("Tool not found");
  }
  return tool;
}

function revalidateTools(projectId: string, toolId?: string) {
  revalidatePath(`/dashboard/projects/${projectId}/tools`);
  if (toolId) {
    revalidatePath(`/dashboard/projects/${projectId}/tools/${toolId}`);
  }
}

export type ToolActionState = { message?: string; error?: string };

export async function toggleToolEnabledAction(
  formData: FormData,
): Promise<ToolActionState> {
  const user = await requireCurrentUser();
  const parsed = toolIdSchema.safeParse({
    projectId: formData.get("projectId"),
    toolId: formData.get("toolId"),
  });
  if (!parsed.success) return { error: "Invalid input" };

  const tool = await assertOwnsTool(
    user.id,
    parsed.data.projectId,
    parsed.data.toolId,
  );

  const enabled = formData.get("enabled") === "true";

  await prisma.toolOverride.upsert({
    where: { toolId: tool.id },
    create: {
      toolId: tool.id,
      projectId: tool.projectId,
      enabled,
    },
    update: { enabled },
  });

  revalidateTools(tool.projectId, tool.id);
  return { message: enabled ? "Tool enabled." : "Tool disabled." };
}

const descriptionSchema = z.object({
  projectId: z.string().min(1),
  toolId: z.string().min(1),
  description: z.string().trim().max(2000),
});

export async function setToolDescriptionOverrideAction(
  _prev: ToolActionState,
  formData: FormData,
): Promise<ToolActionState> {
  const user = await requireCurrentUser();
  const parsed = descriptionSchema.safeParse({
    projectId: formData.get("projectId"),
    toolId: formData.get("toolId"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return { error: "Description is too long." };
  }

  const tool = await assertOwnsTool(
    user.id,
    parsed.data.projectId,
    parsed.data.toolId,
  );

  const trimmed = parsed.data.description.trim();
  await prisma.toolOverride.upsert({
    where: { toolId: tool.id },
    create: {
      toolId: tool.id,
      projectId: tool.projectId,
      description: trimmed.length > 0 ? trimmed : null,
    },
    update: {
      description: trimmed.length > 0 ? trimmed : null,
    },
  });

  revalidateTools(tool.projectId, tool.id);
  return { message: "Override saved." };
}

export async function resetToolOverrideAction(
  formData: FormData,
): Promise<ToolActionState> {
  const user = await requireCurrentUser();
  const parsed = toolIdSchema.safeParse({
    projectId: formData.get("projectId"),
    toolId: formData.get("toolId"),
  });
  if (!parsed.success) return { error: "Invalid input" };

  const tool = await assertOwnsTool(
    user.id,
    parsed.data.projectId,
    parsed.data.toolId,
  );

  await prisma.toolOverride
    .delete({ where: { toolId: tool.id } })
    .catch(() => {});

  revalidateTools(tool.projectId, tool.id);
  return { message: "Override reset." };
}
