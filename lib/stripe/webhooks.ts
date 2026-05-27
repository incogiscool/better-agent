// PLACEHOLDER — Stripe webhook handler not yet implemented.
//
// When Stripe is active, import { stripe } from "./client" and route by event.type:
//
//   "checkout.session.completed"
//     → Upgrade Project.plan, set stripeCustomerId + stripeSubscriptionId,
//       call createBillingPeriod() for the new plan.
//
//   "invoice.paid"
//     → Close the current BillingPeriod's overage, or create the next period
//       for subscription renewals.
//
//   "customer.subscription.updated"
//     → Detect plan change via event.data.object.items, update Project.plan,
//       and call createBillingPeriod() if includedCredits changed.
//
//   "invoice.payment_failed"
//     → sendPaymentFailedEmail(ownerEmail, projectName, nextAttemptDate)
//
//   "customer.subscription.deleted"
//     → Downgrade Project.plan to FREE, call createBillingPeriod() for FREE.
//     → sendSubscriptionCanceledEmail(ownerEmail, projectName)

import {
  sendPaymentFailedEmail,
  sendSubscriptionCanceledEmail,
} from "@/lib/email/notifications";

export async function handleStripeWebhook(
  _payload: string,
  _signature: string,
): Promise<void> {
  console.warn(
    "[stripe/webhooks] handleStripeWebhook called but Stripe is not yet configured. " +
      "See lib/stripe/webhooks.ts for implementation instructions.",
  );
}

// Call these when the respective Stripe events are handled:
export { sendPaymentFailedEmail, sendSubscriptionCanceledEmail };
