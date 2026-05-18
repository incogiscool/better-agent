import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "success" | "danger" | "warning" | "info" | "neutral" | "muted";

const toneClasses: Record<Tone, { dot: string; text: string; ring: string }> = {
  success: {
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
    ring: "border-emerald-500/30",
  },
  danger: {
    dot: "bg-destructive",
    text: "text-destructive",
    ring: "border-destructive/30",
  },
  warning: {
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-400",
    ring: "border-amber-500/30",
  },
  info: {
    dot: "bg-sky-500",
    text: "text-sky-700 dark:text-sky-400",
    ring: "border-sky-500/30",
  },
  neutral: {
    dot: "bg-muted-foreground",
    text: "text-foreground/80",
    ring: "border-border",
  },
  muted: {
    dot: "bg-muted-foreground/40",
    text: "text-muted-foreground",
    ring: "border-border",
  },
};

const toneByExecution: Record<string, Tone> = {
  succeeded: "success",
  done: "success",
  completed: "success",
  pending: "warning",
  active: "info",
  failed: "danger",
  timed_out: "danger",
  abandoned: "muted",
};

interface StatusBadgeProps {
  status: string;
  tone?: Tone;
  className?: string;
}

export function StatusBadge({ status, tone, className }: StatusBadgeProps) {
  const resolvedTone = tone ?? toneByExecution[status] ?? "neutral";
  const styles = toneClasses[resolvedTone];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-1.5 py-0.5 font-mono text-[10px] leading-none",
        styles.ring,
        styles.text,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", styles.dot)} aria-hidden />
      {status}
    </span>
  );
}
