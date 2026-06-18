import { getStripe } from "./client";
import { prisma } from "@/lib/db";

/**
 * One Stripe Customer per project. The Customer's metadata links back to both
 * the project and its owner (userId) so Stripe-side records are traceable.
 * Returns the customer id, persisting it on the project the first time.
 */
export async function getOrCreateProjectCustomer(input: {
  projectId: string;
  projectName: string;
  ownerId: string;
  ownerEmail: string;
  existingCustomerId: string | null;
}): Promise<string> {
  if (input.existingCustomerId) return input.existingCustomerId;

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: input.ownerEmail,
    name: input.projectName,
    metadata: {
      projectId: input.projectId,
      userId: input.ownerId,
    },
  });

  await prisma.project.update({
    where: { id: input.projectId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}
