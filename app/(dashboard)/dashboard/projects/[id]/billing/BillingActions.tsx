"use client";

import * as React from "react";
import Link from "next/link";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";
import { ProjectPlan } from "@/lib/generated/prisma/enums";
import {
  createCheckoutSessionAction,
  createPortalSessionAction,
  type BillingActionResult,
} from "@/lib/actions/billing";

const PLAN_LABELS: Record<ProjectPlan, string> = {
  FREE: "Free",
  STARTER: "Starter",
  PLUS: "Plus",
  ENTERPRISE: "Enterprise",
};

export function BillingActions({
  projectId,
  plan,
}: {
  projectId: string;
  plan: ProjectPlan;
}) {
  const [pending, setPending] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function run(
    key: string,
    action: () => Promise<BillingActionResult>,
  ) {
    setPending(key);
    setError(null);
    const result = await action();
    if ("url" in result) {
      window.location.assign(result.url);
      return;
    }
    setError(result.error);
    setPending(null);
  }

  if (plan === ProjectPlan.ENTERPRISE) {
    return (
      <Button asChild variant="outline">
        <Link href="/contact">Contact sales</Link>
      </Button>
    );
  }

  const upgrades: ProjectPlan[] =
    plan === ProjectPlan.FREE
      ? [ProjectPlan.STARTER, ProjectPlan.PLUS]
      : plan === ProjectPlan.STARTER
        ? [ProjectPlan.PLUS]
        : [];
  const isPaid = plan === ProjectPlan.STARTER || plan === ProjectPlan.PLUS;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {upgrades.map((target) => (
          <Button
            key={target}
            disabled={pending !== null}
            onClick={() => {
              posthog.capture("billing_upgrade_clicked", {
                project_id: projectId,
                from_plan: plan,
                to_plan: target,
              });
              run(target, () =>
                createCheckoutSessionAction(projectId, target),
              );
            }}
          >
            {pending === target
              ? "Starting…"
              : `Upgrade to ${PLAN_LABELS[target]}`}
          </Button>
        ))}

        {isPaid && (
          <Button
            variant="outline"
            disabled={pending !== null}
            onClick={() => run("portal", () => createPortalSessionAction(projectId))}
          >
            {pending === "portal" ? "Opening…" : "Manage billing"}
          </Button>
        )}

        <Button asChild variant="ghost">
          <Link href="/contact">Need Enterprise?</Link>
        </Button>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
