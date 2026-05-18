"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { deleteProjectAction } from "@/lib/actions";

interface ProjectDangerZoneProps {
  projectId: string;
  projectName: string;
}

export function ProjectDangerZone({
  projectId,
  projectName,
}: ProjectDangerZoneProps) {
  const [pending, startTransition] = React.useTransition();
  const [confirm, setConfirm] = React.useState("");

  const armed = confirm === projectName;
  const action = deleteProjectAction.bind(null, projectId);

  return (
    <section className="space-y-4 border border-destructive/30 p-4">
      <div className="space-y-1">
        <h2 className="text-sm font-medium text-destructive">Danger zone</h2>
        <p className="text-[11px] text-muted-foreground">
          Deleting a project removes all synced tools, overrides, conversations,
          and billing periods. This cannot be undone.
        </p>
      </div>
      <div className="space-y-2 flex flex-col">
        <label className="text-xs font-medium" htmlFor="confirm-name">
          Type <span className="font-mono">{projectName}</span> to enable
          deletion
        </label>
        <input
          id="confirm-name"
          type="text"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full max-w-sm rounded-none border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
          placeholder={projectName}
        />
      </div>
      <Button
        type="button"
        variant="destructive"
        disabled={!armed || pending}
        onClick={() => {
          startTransition(async () => {
            await action();
          });
        }}
      >
        {pending ? "Deleting…" : "Delete project"}
      </Button>
    </section>
  );
}
