import { type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import {
  ConversationStatus,
  ToolExecutionStatus,
} from "@/lib/generated/prisma/enums";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ABANDON_AFTER_MS = 60_000;

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[cron/abandoned] CRON_SECRET env var is not set");
    return Response.json({ error: "Cron secret not configured" }, { status: 500 });
  }

  const auth = req.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : null;
  if (!token || token !== cronSecret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - ABANDON_AFTER_MS);

  try {
    const stale = await prisma.toolExecution.findMany({
      where: {
        status: ToolExecutionStatus.pending,
        createdAt: { lt: cutoff },
      },
      select: { id: true, conversationId: true },
    });

    if (stale.length === 0) {
      return Response.json({ ok: true, executionsAbandoned: 0, conversationsAbandoned: 0 });
    }

    const execIds = stale.map((e) => e.id);
    const convIds = Array.from(new Set(stale.map((e) => e.conversationId)));

    const [execResult, convResult] = await prisma.$transaction([
      prisma.toolExecution.updateMany({
        where: { id: { in: execIds }, status: ToolExecutionStatus.pending },
        data: { status: ToolExecutionStatus.abandoned },
      }),
      prisma.conversation.updateMany({
        where: { id: { in: convIds }, status: ConversationStatus.active },
        data: { status: ConversationStatus.abandoned },
      }),
    ]);

    return Response.json({
      ok: true,
      executionsAbandoned: execResult.count,
      conversationsAbandoned: convResult.count,
    });
  } catch (err) {
    console.error("[cron/abandoned] failed:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
