import Link from "next/link";
import { getCurrentBillingPeriod } from "@/lib/billing/periods";
import { PLAN_CONFIGS } from "@/lib/billing/plans";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCount } from "@/lib/format";
import type { ProjectPlan } from "@/lib/generated/prisma/enums";

interface CreditWarningBannerProps {
  projectId: string;
  plan: ProjectPlan;
}

export async function CreditWarningBanner({ projectId, plan }: CreditWarningBannerProps) {
  const config = PLAN_CONFIGS[plan];
  if (!config.hardCap) return null;

  const period = await getCurrentBillingPeriod(projectId);
  const { creditsUsed, includedCredits } = period;
  const ratio = creditsUsed / Math.max(includedCredits, 1);

  if (ratio < 0.8) return null;

  const usageHref = `/dashboard/projects/${projectId}/usage`;

  if (creditsUsed >= includedCredits) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Credits exhausted — agent responses are paused until your period resets.{" "}
          <Link href={usageHref}>View usage</Link>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert>
      <AlertDescription>
        {formatCount(creditsUsed)} of {formatCount(includedCredits)} credits used this period — running low.{" "}
        <Link href={usageHref}>View usage</Link>
      </AlertDescription>
    </Alert>
  );
}
