import { type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { verifyProjectSecret } from "@/lib/projects/keys";

function extractBearerToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7).trim() || null;
}

export async function GET(req: NextRequest) {
  const secretKey = extractBearerToken(req);
  if (!secretKey) {
    return Response.json(
      { error: "Missing Authorization header. Expected: Bearer <secret_key>" },
      { status: 401 },
    );
  }

  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) {
    return Response.json(
      { error: "Missing projectId query parameter" },
      { status: 400 },
    );
  }

  let project: {
    id: string;
    name: string;
    plan: string;
    secretKeyHash: string;
  } | null;
  try {
    project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true, plan: true, secretKeyHash: true },
    });
  } catch (err) {
    console.error("[whoami] DB lookup failed:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }

  // Constant-time-safe: always attempt verify even if project not found
  const storedHash = project?.secretKeyHash ?? "00:00";
  const keyValid = verifyProjectSecret(secretKey, storedHash);

  if (!project || !keyValid) {
    return Response.json(
      { error: "Invalid project ID or secret key" },
      { status: 401 },
    );
  }

  return Response.json({
    ok: true,
    projectId: project.id,
    name: project.name,
    plan: project.plan,
  });
}
