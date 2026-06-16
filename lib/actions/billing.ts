"use server";

import type Stripe from "stripe";
import { requireCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe/client";
import { getOrCreateProjectCustomer } from "@/lib/stripe/customers";
import { getCheckoutConfig, isCheckoutPlan } from "@/lib/stripe/plans";
import { APP_URL } from "@/lib/site";
import type { ProjectPlan } from "@/lib/generated/prisma/enums";

export type BillingActionResult = { url: string } | { error: string };

function billingUrl(projectId: string) {
  return `${APP_URL}/dashboard/projects/${projectId}/billing`;
}

/**
 * Start a Stripe Checkout (subscription mode) to put a project on a paid plan.
 * Plus includes the metered overage price as a second line item.
 */
export async function createCheckoutSessionAction(
  projectId: string,
  plan: ProjectPlan,
): Promise<BillingActionResult> {
  const user = await requireCurrentUser();

  if (!isCheckoutPlan(plan)) {
    return { error: "That plan isn't available for self-serve checkout." };
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: user.id },
    select: { id: true, name: true, stripeCustomerId: true },
  });
  if (!project) return { error: "Project not found." };

  try {
    const stripe = getStripe();
    const customerId = await getOrCreateProjectCustomer({
      projectId: project.id,
      projectName: project.name,
      ownerId: user.id,
      ownerEmail: user.email,
      existingCustomerId: project.stripeCustomerId,
    });

    const config = getCheckoutConfig(plan);
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { price: config.basePriceId, quantity: 1 },
    ];
    // Metered prices must NOT carry a quantity.
    if (config.overagePriceId) lineItems.push({ price: config.overagePriceId });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: lineItems,
      client_reference_id: project.id,
      subscription_data: { metadata: { projectId: project.id, plan } },
      success_url: `${billingUrl(project.id)}?checkout=success`,
      cancel_url: `${billingUrl(project.id)}?checkout=cancelled`,
      allow_promotion_codes: true,
    });

    if (!session.url) return { error: "Could not start checkout." };
    return { url: session.url };
  } catch (err) {
    console.error("[billing] checkout session failed:", err);
    return { error: "Could not start checkout. Please try again." };
  }
}

/** Open the Stripe Customer Portal for a project's subscription. */
export async function createPortalSessionAction(
  projectId: string,
): Promise<BillingActionResult> {
  const user = await requireCurrentUser();

  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: user.id },
    select: { id: true, stripeCustomerId: true },
  });
  if (!project) return { error: "Project not found." };
  if (!project.stripeCustomerId) {
    return { error: "This project has no billing account yet." };
  }

  try {
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: project.stripeCustomerId,
      return_url: billingUrl(project.id),
    });
    return { url: session.url };
  } catch (err) {
    console.error("[billing] portal session failed:", err);
    return { error: "Could not open the billing portal. Please try again." };
  }
}
