"use client";

import * as React from "react";
import { PencilSimple, ArrowCounterClockwise, Check, X } from "@phosphor-icons/react";
import {
  resetToolOverrideAction,
  setToolDescriptionOverrideAction,
  type ToolActionState,
} from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ToolDescriptionEditorProps {
  projectId: string;
  toolId: string;
  syncedDescription: string | null;
  overrideDescription: string | null;
  aiGenerated: boolean;
}

export function ToolDescriptionEditor({
  projectId,
  toolId,
  syncedDescription,
  overrideDescription,
  aiGenerated,
}: ToolDescriptionEditorProps) {
  const [editing, setEditing] = React.useState(false);
  const [state, setState] = React.useState<ToolActionState>({});
  const [pending, startTransition] = React.useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const next = await setToolDescriptionOverrideAction(state, formData);
      setState(next);
      if (next.message && !next.error) {
        setEditing(false);
      }
    });
  }

  const effective = overrideDescription ?? syncedDescription;
  const hasOverride = overrideDescription != null;

  if (editing) {
    return (
      <form action={handleSubmit} className="space-y-2">
        <input type="hidden" name="projectId" value={projectId} />
        <input type="hidden" name="toolId" value={toolId} />
        <textarea
          name="description"
          defaultValue={overrideDescription ?? syncedDescription ?? ""}
          rows={4}
          maxLength={2000}
          autoFocus
          className="min-h-20 w-full rounded-none border border-input bg-transparent px-2.5 py-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
        />
        {state.error && (
          <p className="text-[11px] text-destructive">{state.error}</p>
        )}
        <div className="flex items-center gap-2">
          <Button type="submit" size="xs" disabled={pending}>
            <Check size={12} weight="bold" data-icon="inline-start" />
            {pending ? "Saving…" : "Save override"}
          </Button>
          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => {
              setEditing(false);
              setState({});
            }}
          >
            <X size={12} data-icon="inline-start" />
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-2">
      <p
        className={cn(
          "text-xs",
          effective ? "text-foreground/90" : "text-muted-foreground italic",
        )}
      >
        {effective ?? "No description"}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {hasOverride ? (
          <span className="border border-primary/40 px-1.5 py-0.5 font-mono text-[10px] text-primary">
            override
          </span>
        ) : aiGenerated ? (
          <span className="border border-sky-500/30 px-1.5 py-0.5 font-mono text-[10px] text-sky-700 dark:text-sky-400">
            AI-generated
          </span>
        ) : null}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
        >
          <PencilSimple size={11} />
          Override
        </button>
        {hasOverride && (
          <ResetButton projectId={projectId} toolId={toolId} />
        )}
      </div>
    </div>
  );
}

function ResetButton({
  projectId,
  toolId,
}: {
  projectId: string;
  toolId: string;
}) {
  const [pending, startTransition] = React.useTransition();

  function handleReset() {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("projectId", projectId);
      fd.set("toolId", toolId);
      await resetToolOverrideAction(fd);
    });
  }

  return (
    <button
      type="button"
      onClick={handleReset}
      disabled={pending}
      className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground disabled:opacity-50"
    >
      <ArrowCounterClockwise size={11} />
      Reset
    </button>
  );
}
