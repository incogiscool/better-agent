import { type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { verifyProjectSecret } from "@/lib/projects/keys";
import { describeRequestSchema } from "@/lib/schemas/describe";
import { getOrGenerateDescription } from "@/lib/tools/describe";

function extractBearerToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7).trim() || null;
}

export async function POST(req: NextRequest) {
  const secretKey = extractBearerToken(req);
  if (!secretKey) {
    return Response.json(
      { error: "Missing Authorization header. Expected: Bearer <secret_key>" },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = describeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request body", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  const { projectId, sourceHash, source } = parsed.data;

  let project: { id: string; secretKeyHash: string } | null;
  try {
    project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, secretKeyHash: true },
    });
  } catch (err) {
    console.error("[describe] DB lookup failed:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }

  const storedHash = project?.secretKeyHash ?? "00:00";
  const keyValid = verifyProjectSecret(secretKey, storedHash);

  if (!project || !keyValid) {
    return Response.json({ error: "Invalid project ID or secret key" }, { status: 401 });
  }

  try {
    const result = await getOrGenerateDescription(sourceHash, source);
    return Response.json({ ok: true, ...result });
  } catch (err) {
    console.error("[describe] Generation failed:", err);
    return Response.json({ error: "Failed to generate description" }, { status: 500 });
  }
}
