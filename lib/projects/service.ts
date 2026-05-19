import { prisma } from "@/lib/db";
import { generateProjectCredentials } from "@/lib/projects/keys";

type CreateProjectInput = {
  ownerId: string;
  name: string;
  baseUrl?: string;
  systemPrompt?: string;
};

type UpdateProjectInput = {
  projectId: string;
  ownerId: string;
  name: string;
  baseUrl?: string;
  systemPrompt?: string;
};

type ProjectKeyInput = {
  projectId: string;
  ownerId: string;
};

export async function listProjectsForOwner(ownerId: string) {
  return prisma.project.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      baseUrl: true,
      plan: true,
      clientKey: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getProjectForOwner(projectId: string, ownerId: string) {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId,
    },
    select: {
      id: true,
      name: true,
      baseUrl: true,
      clientKey: true,
      systemPrompt: true,
      plan: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function createProjectForOwner(input: CreateProjectInput) {
  const credentials = generateProjectCredentials();

  const project = await prisma.project.create({
    data: {
      ownerId: input.ownerId,
      name: input.name,
      baseUrl: input.baseUrl,
      systemPrompt: input.systemPrompt,
      clientKey: credentials.clientKey,
      secretKeyHash: credentials.secretKeyHash,
      secretKeyPrefix: credentials.secretKeyPrefix,
    },
    select: {
      id: true,
      name: true,
      baseUrl: true,
      clientKey: true,
      systemPrompt: true,
      plan: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    project,
    clientKey: credentials.clientKey,
    secretKey: credentials.secretKey,
  };
}

export async function updateProjectForOwner(input: UpdateProjectInput) {
  return prisma.project.updateMany({
    where: {
      id: input.projectId,
      ownerId: input.ownerId,
    },
    data: {
      name: input.name,
      baseUrl: input.baseUrl,
      systemPrompt: input.systemPrompt,
    },
  });
}

export async function regenerateProjectCredentialsForOwner(
  input: ProjectKeyInput,
) {
  const credentials = generateProjectCredentials();

  const updated = await prisma.project.updateMany({
    where: {
      id: input.projectId,
      ownerId: input.ownerId,
    },
    data: {
      clientKey: credentials.clientKey,
      secretKeyHash: credentials.secretKeyHash,
      secretKeyPrefix: credentials.secretKeyPrefix,
    },
  });

  return {
    updated,
    clientKey: credentials.clientKey,
    secretKey: credentials.secretKey,
  };
}

export async function deleteProjectForOwner(input: ProjectKeyInput) {
  return prisma.project.deleteMany({
    where: {
      id: input.projectId,
      ownerId: input.ownerId,
    },
  });
}
