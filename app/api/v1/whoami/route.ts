import { type NextRequest } from "next/server";
import { authenticateSecretKey } from "@/lib/projects/auth";

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

  const project = await authenticateSecretKey(secretKey);

  if (!project) {
    return Response.json({ error: "Invalid secret key" }, { status: 401 });
  }

  return Response.json({
    ok: true,
    projectId: project.id,
    name: project.name,
    plan: project.plan,
  });
}
