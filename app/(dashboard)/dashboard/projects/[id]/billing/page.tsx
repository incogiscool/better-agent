import Link from "next/link";
import { loadProjectContext } from "@/lib/dashboard/context";
import { getUsageSummary } from "@/lib/billing/queries";
import { PLAN_CONFIGS } from "@/lib/billing/plans";
import { SectionHeader, UsageBar } from "@/components/dashboard/common";
import { formatCount, formatDate } from "@/lib/format";
import type { ProjectPlan } from "@/lib/generated/prisma/enums";
import { BillingActions } from "./BillingActions";

const PLAN_LABELS: Record<ProjectPlan, string> = {
  FREE: "Free",
  STARTER: "Starter",
  PLUS: "Plus",
  ENTERPRISE: "Enterprise",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function BillingPage({ params }: PageProps) {
  const { id } = await params;
  const { project } = await loadProjectContext(id);
  const { current } = await getUsageSummary(id);
  const config = PLAN_CONFIGS[project.plan];
  const remaining = Math.max(0, current.includedCredits - current.creditsUsed);

  return (
    <main className="space-y-6 px-6 py-6">
      <SectionHeader
        size="lg"
        className="border-0 p-0"
        title="Billing"
        description="Manage this project's plan and payment method."
      />

      <div className="space-y-5 border border-border p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Current plan
            </p>
            <p className="font-mono text-lg">{PLAN_LABELS[project.plan]}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Period
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(current.startsAt)} → {formatDate(current.endsAt)}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <UsageBar
            used={current.creditsUsed}
            total={current.includedCredits}
            overage={current.overageCredits}
          />
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>
              {formatCount(current.creditsUsed)} /{" "}
              {formatCount(current.includedCredits)} credits
            </span>
            <span>
              {config.overageAllowed
                ? current.overageCredits > 0
                  ? `${formatCount(current.overageCredits)} overage this period`
                  : "overage billed at $10 / 1,000 credits"
                : `${formatCount(remaining)} remaining`}
            </span>
          </div>
        </div>

        <BillingActions projectId={id} plan={project.plan} />
      </div>

      <p className="text-xs text-muted-foreground">
        See{" "}
        <Link href={`/dashboard/projects/${id}/usage`} className="underline">
          Usage
        </Link>{" "}
        for a full cost and token breakdown.
      </p>
    </main>
  );
}
