import { type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth/session";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentSession();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, ownerId: session.user.id },
    select: { id: true },
  });

  if (!project) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const [activeCount, latestSync] = await Promise.all([
    prisma.tool.count({ where: { projectId: project.id, deletedAt: null } }),
    prisma.tool.findFirst({
      where: { projectId: project.id, deletedAt: null },
      orderBy: { lastSyncedAt: "desc" },
      select: { lastSyncedAt: true },
    }),
  ]);

  return Response.json(
    {
      projectId: project.id,
      toolCount: activeCount,
      lastSyncedAt: latestSync?.lastSyncedAt?.toISOString() ?? null,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
