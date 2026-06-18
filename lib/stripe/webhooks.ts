import type Stripe from "stripe";
import { getStripe } from "./client";
import { planForPriceId } from "./plans";
import { prisma } from "@/lib/db";
import { ProjectPlan } from "@/lib/generated/prisma/enums";
import { PLAN_CONFIGS } from "@/lib/billing/plans";
import { createBillingPeriod } from "@/lib/billing/periods";
import {
  sendPaymentFailedEmail,
  sendSubscriptionCanceledEmail,
} from "@/lib/email/notifications";

/** Resolve which plan a subscription represents from its line-item prices. */
function planFromSubscription(sub: Stripe.Subscription): ProjectPlan | null {
  for (const item of sub.items.data) {
    const plan = planForPriceId(item.price.id);
    if (plan) return plan;
  }
  // Fallback to the metadata we set at checkout time.
  const metaPlan = sub.metadata?.plan as ProjectPlan | undefined;
  return metaPlan && metaPlan in PLAN_CONFIGS ? metaPlan : null;
}

/**
 * Apply a plan to a project: set plan + Stripe ids, close any open billing
 * period, and open a fresh one for the new plan so credits reset cleanly.
 */
async function applyPlan(
  projectId: string,
  plan: ProjectPlan,
  ids: { stripeCustomerId?: string; stripeSubscriptionId?: string | null } = {},
): Promise<void> {
  const now = new Date();
  await prisma.project.update({
    where: { id: projectId },
    data: {
      plan,
      billingCycleAnchor: now,
      ...(ids.stripeCustomerId ? { stripeCustomerId: ids.stripeCustomerId } : {}),
      ...(ids.stripeSubscriptionId !== undefined
        ? { stripeSubscriptionId: ids.stripeSubscriptionId }
        : {}),
    },
  });
  // Close currently-active periods, then open a fresh one for `plan`.
  await prisma.billingPeriod.updateMany({
    where: { projectId, endsAt: { gt: now } },
    data: { endsAt: now },
  });
  await createBillingPeriod(projectId, plan, now);
}

function asId(ref: string | { id: string } | null | undefined): string | null {
  if (!ref) return null;
  return typeof ref === "string" ? ref : ref.id;
}

async function findProjectByCustomer(customerId: string | null) {
  if (!customerId) return null;
  return prisma.project.findUnique({
    where: { stripeCustomerId: customerId },
    select: { id: true, name: true, owner: { select: { email: true } } },
  });
}

// ── Handlers ──────────────────────────────────────────────────────────────

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const projectId = session.client_reference_id;
  const subscriptionId = asId(session.subscription);
  const customerId = asId(session.customer);
  if (!projectId || !subscriptionId) return;

  const stripe = getStripe();
  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const plan = planFromSubscription(sub);
  if (!plan) {
    console.error("[stripe] checkout.completed: could not resolve plan", {
      projectId,
      subscriptionId,
    });
    return;
  }

  await applyPlan(projectId, plan, {
    stripeCustomerId: customerId ?? undefined,
    stripeSubscriptionId: subscriptionId,
  });
}

async function handleSubscriptionUpdated(
  sub: Stripe.Subscription,
): Promise<void> {
  const project = await prisma.project.findFirst({
    where: { stripeSubscriptionId: sub.id },
    select: { id: true, plan: true },
  });
  if (!project) return;

  // A scheduled cancel doesn't change the plan until it actually ends.
  if (sub.cancel_at_period_end) return;

  const plan = planFromSubscription(sub);
  if (!plan || plan === project.plan) return;

  // Plan switch (e.g. Starter → Plus via the portal): update plan and bump the
  // current period's included credits to the new allotment immediately.
  const now = new Date();
  await prisma.project.update({
    where: { id: project.id },
    data: { plan },
  });
  await prisma.billingPeriod.updateMany({
    where: { projectId: project.id, endsAt: { gt: now } },
    data: { includedCredits: PLAN_CONFIGS[plan].includedCredits },
  });
}

async function handleSubscriptionDeleted(
  sub: Stripe.Subscription,
): Promise<void> {
  const project = await prisma.project.findFirst({
    where: { stripeSubscriptionId: sub.id },
    select: { id: true, name: true, owner: { select: { email: true } } },
  });
  if (!project) return;

  await applyPlan(project.id, ProjectPlan.FREE, { stripeSubscriptionId: null });
  sendSubscriptionCanceledEmail(
    project.owner.email,
    project.name,
    project.id,
  ).catch(console.error);
}

async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  // Only roll a new period on renewals; the first invoice's period was created
  // at checkout.session.completed.
  if (invoice.billing_reason !== "subscription_cycle") return;

  const project = await prisma.project.findUnique({
    where: { stripeCustomerId: asId(invoice.customer) ?? "" },
    select: { id: true, plan: true },
  });
  if (!project) return;

  await applyPlan(project.id, project.plan);
}

async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
): Promise<void> {
  const project = await findProjectByCustomer(asId(invoice.customer));
  if (!project) return;

  const nextAttempt = invoice.next_payment_attempt
    ? new Date(invoice.next_payment_attempt * 1000).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "soon";

  sendPaymentFailedEmail(
    project.owner.email,
    project.name,
    nextAttempt,
    project.id,
  ).catch(console.error);
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "P2002"
  );
}

export async function handleStripeWebhook(
  payload: string,
  signature: string,
): Promise<void> {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not set.");

  const event = stripe.webhooks.constructEvent(payload, signature, secret);

  // Idempotency: claim the event id first. A duplicate delivery is a no-op.
  try {
    await prisma.stripeEvent.create({
      data: { id: event.id, type: event.type },
    });
  } catch (err) {
    if (isUniqueViolation(err)) return;
    throw err;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;
      case "invoice.paid":
        await handleInvoicePaid(event.data.object);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object);
        break;
      default:
        break;
    }
  } catch (err) {
    // Release the idempotency claim so Stripe's retry can reprocess.
    await prisma.stripeEvent.delete({ where: { id: event.id } }).catch(() => {});
    throw err;
  }
}
