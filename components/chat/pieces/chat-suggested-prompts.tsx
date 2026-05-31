"use client";

import * as React from "react";
import { cn } from "betteragent-react";

export type SuggestedPrompt = {
  label: string;
  prompt: string;
  icon?: React.ReactNode;
};

interface ChatSuggestedPromptsProps {
  prompts: readonly SuggestedPrompt[];
  onPick: (prompt: string) => void;
  className?: string;
}

export function ChatSuggestedPrompts({
  prompts,
  onPick,
  className,
}: ChatSuggestedPromptsProps) {
  if (prompts.length === 0) return null;
  return (
    <div className={cn("space-y-1.5 px-3 pb-2", className)}>
      <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--ba-muted-fg)]">
        TRY
      </div>
      <ul className="space-y-1">
        {prompts.map((p, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => onPick(p.prompt)}
              className="flex w-full items-center gap-2 border border-[var(--ba-border)] bg-[var(--ba-panel-bg)] px-2.5 py-1.5 text-left text-[12px] text-[var(--ba-fg)] transition-colors hover:bg-[var(--ba-muted)]"
            >
              {p.icon && (
                <span aria-hidden className="shrink-0 text-[var(--ba-muted-fg)]">
                  {p.icon}
                </span>
              )}
              <span className="truncate font-[var(--ba-font-mono)]">{p.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
