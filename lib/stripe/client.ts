import Stripe from "stripe";

// Guarded singleton: Stripe is optional in dev (no key → null). Use getStripe()
// from code paths that require it; it throws a clear error when unconfigured.
// We intentionally do NOT pin apiVersion — the installed SDK pins the latest.
const secretKey = process.env.STRIPE_SECRET_KEY;

export const stripe: Stripe | null = secretKey ? new Stripe(secretKey) : null;

export function getStripe(): Stripe {
  if (!stripe) {
    throw new Error(
      "Stripe is not configured. Set STRIPE_SECRET_KEY to enable billing.",
    );
  }
  return stripe;
}
