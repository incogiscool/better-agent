"use client";

import { cn } from "@betteragent/react";
import type { ToolCallEntry } from "@betteragent/react";

interface ChatToolCallProps {
  entry: ToolCallEntry;
  className?: string;
}

function formatInput(input: unknown): string {
  if (input == null) return "";
  if (typeof input !== "object") return String(input);
  try {
    const obj = input as Record<string, unknown>;
    return Object.entries(obj)
      .map(([k, v]) => {
        const sv =
          typeof v === "string"
            ? v
            : typeof v === "number" || typeof v === "boolean"
              ? String(v)
              : JSON.stringify(v);
        return `${k}=${sv}`;
      })
      .slice(0, 4)
      .join(" · ");
  } catch {
    return "";
  }
}

function formatDuration(ms: number | undefined): string {
  if (ms == null) return "…";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function ChatToolCall({ entry, className }: ChatToolCallProps) {
  const args = formatInput(entry.input);
  const failed = entry.state === "failed";

  return (
    <div
      className={cn(
        "flex items-center gap-2 border border-dashed px-3 py-1.5 font-[var(--ba-font-mono)] text-[11px] leading-tight",
        failed
          ? "border-[var(--ba-destructive)] text-[var(--ba-destructive)]"
          : "border-[var(--ba-border)] text-[var(--ba-muted-fg)]",
        className,
      )}
      data-state={entry.state}
    >
      <span aria-hidden>→</span>
      <span className="text-[var(--ba-fg)]">{entry.toolName}</span>
      {args && (
        <>
          <span aria-hidden>·</span>
          <span className="truncate">{args}</span>
        </>
      )}
      <span aria-hidden>·</span>
      <span>
        {entry.state === "running" ? "running…" : formatDuration(entry.durationMs)}
      </span>
    </div>
  );
}
