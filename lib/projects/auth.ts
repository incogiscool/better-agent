import { prisma } from "@/lib/db";
import { extractKeyPrefix, verifyProjectSecret } from "./keys";

type ProjectForAuth = {
  id: string;
  name: string;
  plan: string;
  baseUrl: string | null;
  systemPrompt: string | null;
};

/**
 * Look up a project by secret key prefix then verify the full hash.
 * Returns null on any auth failure.
 */
export async function authenticateSecretKey(secretKey: string): Promise<ProjectForAuth | null> {
  const prefix = extractKeyPrefix(secretKey);

  const candidate = await prisma.project.findUnique({
    where: { secretKeyPrefix: prefix },
    select: {
      id: true,
      name: true,
      plan: true,
      baseUrl: true,
      systemPrompt: true,
      secretKeyHash: true,
    },
  });

  if (!candidate) {
    verifyProjectSecret(secretKey, "00:00"); // constant-time dummy verify
    return null;
  }

  if (!verifyProjectSecret(secretKey, candidate.secretKeyHash)) return null;

  const { secretKeyHash: _, ...project } = candidate;
  void _;
  return project;
}
