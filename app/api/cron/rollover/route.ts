import { type NextRequest } from "next/server";
import { rolloverExpiredPeriods } from "@/lib/billing/periods";
import { purgeExpiredIdempotencyKeys } from "@/lib/chat/idempotency";

// NOTE: runs DAILY (vercel.json "0 0 * * *"), downgraded from hourly because our
// plan is currently capped at daily crons. This is safe: getCurrentBillingPeriod()
// auto-creates a new period on-demand when the current one is expired, so users
// never hit a gap — this cron is just cleanup. Bump back to hourly if/when we can.

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[cron/rollover] CRON_SECRET env var is not set");
    return Response.json({ error: "Cron secret not configured" }, { status: 500 });
  }

  const auth = req.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : null;

  if (!token || token !== cronSecret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let rolledOver: number;
  let purged: number;
  try {
    rolledOver = await rolloverExpiredPeriods();
    purged = await purgeExpiredIdempotencyKeys();
  } catch (err) {
    console.error("[cron/rollover] failed:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }

  return Response.json({ ok: true, rolledOver, purged });
}
