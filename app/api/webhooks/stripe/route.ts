import { type NextRequest } from "next/server";
import { handleStripeWebhook } from "@/lib/stripe/webhooks";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let payload: string;
  try {
    // Raw text required for Stripe signature verification — do not use req.json()
    payload = await req.text();
  } catch {
    return Response.json({ error: "Could not read request body" }, { status: 400 });
  }

  try {
    await handleStripeWebhook(payload, signature);
  } catch (err) {
    console.error("[webhooks/stripe] Unexpected error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }

  return Response.json({ received: true });
}
