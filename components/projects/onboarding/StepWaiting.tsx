"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, CircleNotch } from "@phosphor-icons/react";
import { formatRelativeTime } from "@/lib/format";

interface StepWaitingProps {
  projectId: string;
}

type SyncStatus = {
  projectId: string;
  toolCount: number;
  lastSyncedAt: string | null;
};

export function StepWaiting({ projectId }: StepWaitingProps) {
  const [status, setStatus] = React.useState<SyncStatus | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function tick() {
      try {
        const res = await fetch(
          `/api/dashboard/projects/${projectId}/sync-status`,
          { cache: "no-store" },
        );
        if (!res.ok) {
          throw new Error(`Status ${res.status}`);
        }
        const data = (await res.json()) as SyncStatus;
        if (!cancelled) {
          setStatus(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      }
    }

    tick();
    const interval = window.setInterval(tick, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [projectId]);

  const synced = (status?.toolCount ?? 0) > 0;

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 border border-border bg-muted/30 p-4">
        {synced ? (
          <CheckCircle
            size={20}
            weight="fill"
            className="mt-0.5 text-emerald-500"
          />
        ) : (
          <CircleNotch
            size={18}
            className="mt-0.5 animate-spin text-muted-foreground"
          />
        )}
        <div className="space-y-1">
          <h3 className="text-sm font-medium">
            {synced
              ? `Synced ${status?.toolCount} tool${status?.toolCount === 1 ? "" : "s"}`
              : "Waiting for your first sync"}
          </h3>
          <p className="text-[11px] text-muted-foreground">
            {synced
              ? `Last activity ${formatRelativeTime(status?.lastSyncedAt)}. You can come back to this anytime — your project is fully set up.`
              : "Run the commands from the previous step in your project. This page will update the moment our backend receives your first tool definitions."}
          </p>
          {error && (
            <p className="text-[11px] text-destructive">
              Couldn&apos;t check sync status: {error}
            </p>
          )}
        </div>
      </div>

      {synced && (
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/dashboard/projects/${projectId}/runs`}>
              Open project
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/dashboard/projects/${projectId}/tools`}>
              View synced tools
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
