import { sendEmail } from "./client";
import { formatCount } from "@/lib/format";
import { APP_URL } from "@/lib/site";

export async function sendCreditWarningEmail(
  to: string,
  projectName: string,
  creditsUsed: number,
  includedCredits: number,
): Promise<void> {
  const percent = Math.round((creditsUsed / includedCredits) * 100);
  await sendEmail({
    to,
    subject: `Your ${projectName} project has used ${percent}% of its credits`,
    text: `Hi,

Your BetterAgent project "${projectName}" has used ${formatCount(creditsUsed)} of ${formatCount(includedCredits)} credits this period (${percent}%).

Once you reach the limit, agent responses will pause until your period resets or you upgrade your plan.

View your usage: ${APP_URL}/dashboard/projects

— BetterAgent`,
  });
}

export async function sendCreditsExhaustedEmail(
  to: string,
  projectName: string,
): Promise<void> {
  await sendEmail({
    to,
    subject: `Credits exhausted for ${projectName}`,
    text: `Hi,

Your BetterAgent project "${projectName}" has reached its credit limit for this billing period.

Agent responses are paused until your period resets or you upgrade your plan.

View your usage: ${APP_URL}/dashboard/projects

— BetterAgent`,
  });
}

export async function sendWelcomeEmail(
  to: string,
  name: string,
): Promise<void> {
  await sendEmail({
    to,
    subject: "Welcome to BetterAgent",
    text: `Hi ${name},

Your first project is live. Here's how to get your agent talking to your app in three steps:

  1. Install the CLI
     npm i -D betteragent-cli

  2. Log in and initialise
     npx betteragent login --key <your-secret-key>
     npx betteragent init

  3. Sync your tools
     npx betteragent sync

Full CLI reference: ${APP_URL}/cli

— BetterAgent`,
  });
}

export async function sendPaymentFailedEmail(
  to: string,
  projectName: string,
  nextAttemptDate: string,
  projectId?: string,
): Promise<void> {
  const billingUrl = projectId
    ? `${APP_URL}/dashboard/projects/${projectId}/billing`
    : `${APP_URL}/dashboard`;
  await sendEmail({
    to,
    subject: `Payment failed for ${projectName}`,
    text: `Hi,

We were unable to process your payment for the "${projectName}" subscription.

We'll retry on ${nextAttemptDate}. Please update your payment method to avoid a downgrade to the Free plan.

Update billing: ${billingUrl}

— BetterAgent`,
  });
}

export async function sendSubscriptionCanceledEmail(
  to: string,
  projectName: string,
  projectId?: string,
): Promise<void> {
  const billingUrl = projectId
    ? `${APP_URL}/dashboard/projects/${projectId}/billing`
    : `${APP_URL}/dashboard`;
  await sendEmail({
    to,
    subject: `Subscription canceled for ${projectName}`,
    text: `Hi,

Your subscription for "${projectName}" has been canceled. Your project has been moved to the Free plan (500 credits/month).

You can resubscribe at any time: ${billingUrl}

— BetterAgent`,
  });
}
