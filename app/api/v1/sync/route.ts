import { type NextRequest } from "next/server";
import { authenticateSecretKey } from "@/lib/projects/auth";
import { syncRequestSchema } from "@/lib/schemas/sync";
import { syncTools } from "@/lib/tools/sync";

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

  const parsed = syncRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request body", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  const project = await authenticateSecretKey(secretKey);
  if (!project) {
    return Response.json({ error: "Invalid secret key" }, { status: 401 });
  }

  let result: Awaited<ReturnType<typeof syncTools>>;
  try {
    result = await syncTools(project.id, parsed.data.tools);
  } catch (err) {
    console.error("[sync] Tool sync failed:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }

  return Response.json({
    ok: true,
    ...result,
    total: parsed.data.tools.length,
  });
}
