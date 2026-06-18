import { ProjectPlan } from "@/lib/generated/prisma/enums";

/**
 * Maps our plans to their Stripe price IDs (from env) and back. Only self-serve
 * paid plans (Starter, Plus) have a checkout config; Free has none and
 * Enterprise is contact-sales. The metered overage price is attached to the
 * Plus subscription alongside its flat base price.
 */
export type StripeCheckoutConfig = {
  /** Recurring flat price for the plan. */
  basePriceId: string;
  /** Metered usage price for overage, added as a second line item (Plus). */
  overagePriceId?: string;
};

export const STRIPE_OVERAGE_METER_EVENT =
  process.env.STRIPE_OVERAGE_METER_EVENT ?? "betteragent_overage";

/** Plans that can be purchased via self-serve Checkout. */
export const CHECKOUT_PLANS = [ProjectPlan.STARTER, ProjectPlan.PLUS] as const;
export type CheckoutPlan = (typeof CHECKOUT_PLANS)[number];

export function isCheckoutPlan(plan: ProjectPlan): plan is CheckoutPlan {
  return (CHECKOUT_PLANS as readonly ProjectPlan[]).includes(plan);
}

export function getCheckoutConfig(plan: CheckoutPlan): StripeCheckoutConfig {
  switch (plan) {
    case ProjectPlan.STARTER: {
      const basePriceId = process.env.STRIPE_PRICE_STARTER;
      if (!basePriceId) throw new Error("STRIPE_PRICE_STARTER is not set.");
      return { basePriceId };
    }
    case ProjectPlan.PLUS: {
      const basePriceId = process.env.STRIPE_PRICE_PLUS;
      const overagePriceId = process.env.STRIPE_PRICE_PLUS_OVERAGE;
      if (!basePriceId) throw new Error("STRIPE_PRICE_PLUS is not set.");
      if (!overagePriceId) {
        throw new Error("STRIPE_PRICE_PLUS_OVERAGE is not set.");
      }
      return { basePriceId, overagePriceId };
    }
  }
}

/**
 * Resolve a Stripe price ID (a subscription's base price) back to our plan.
 * Used by webhooks to detect which plan a subscription represents.
 */
export function planForPriceId(priceId: string): ProjectPlan | null {
  if (priceId && priceId === process.env.STRIPE_PRICE_STARTER) {
    return ProjectPlan.STARTER;
  }
  if (priceId && priceId === process.env.STRIPE_PRICE_PLUS) {
    return ProjectPlan.PLUS;
  }
  return null;
}
