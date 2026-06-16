/**
 * One-off dev utility: reset the current billing period's usage for every
 * project owned by a given user. Scoped to a single account by email.
 *
 * Run:  bunx dotenv -e .env.local -- bun scripts/reset-credits.ts <email> [--apply]
 * Without --apply it's a dry run (prints what would change).
 */
import { prisma } from "@/lib/db";
import { getCurrentBillingPeriod } from "@/lib/billing";

async function main() {
  const email = process.argv[2];
  const apply = process.argv.includes("--apply");
  if (!email) {
    console.error("Usage: bun scripts/reset-credits.ts <email> [--apply]");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  });
  if (!user) {
    console.error(`No user found for ${email}`);
    process.exit(1);
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: user.id },
    select: { id: true, name: true, plan: true },
  });
  console.log(`User ${user.email} owns ${projects.length} project(s).\n`);

  for (const project of projects) {
    const period = await getCurrentBillingPeriod(project.id);
    console.log(
      `• ${project.name} (${project.plan}) — period ${period.id}: ` +
        `creditsUsed ${period.creditsUsed}/${period.includedCredits}` +
        (apply ? " -> 0" : ""),
    );
    if (apply) {
      await prisma.billingPeriod.update({
        where: { id: period.id },
        data: {
          creditsUsed: 0,
          warningEmailSentAt: null,
          exhaustedEmailSentAt: null,
        },
      });
    }
  }

  console.log(
    apply
      ? "\n✓ Credits reset."
      : "\nDry run only. Re-run with --apply to commit.",
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
