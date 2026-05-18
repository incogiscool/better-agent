"use client";

import * as React from "react";
import { toggleToolEnabledAction } from "@/lib/actions";
import { cn } from "@/lib/utils";

interface ToolToggleFormProps {
  projectId: string;
  toolId: string;
  enabled: boolean;
}

export function ToolToggleForm({
  projectId,
  toolId,
  enabled,
}: ToolToggleFormProps) {
  const [pending, startTransition] = React.useTransition();
  const [optimistic, setOptimistic] = React.useOptimistic(enabled);

  function handleToggle() {
    const next = !optimistic;
    startTransition(async () => {
      setOptimistic(next);
      const fd = new FormData();
      fd.set("projectId", projectId);
      fd.set("toolId", toolId);
      fd.set("enabled", String(next));
      await toggleToolEnabledAction(fd);
    });
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={optimistic}
      onClick={handleToggle}
      disabled={pending}
      className={cn(
        "relative inline-flex h-5 w-9 items-center border border-border transition-colors",
        optimistic ? "bg-primary" : "bg-muted",
        pending && "opacity-60",
      )}
    >
      <span
        className={cn(
          "inline-block size-3.5 transform bg-background transition-transform",
          optimistic ? "translate-x-4" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
