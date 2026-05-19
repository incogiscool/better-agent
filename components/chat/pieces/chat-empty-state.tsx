"use client";

import { cn } from "@betteragent/react";

interface ChatEmptyStateProps {
  greeting: string;
  className?: string;
}

export function ChatEmptyState({ greeting, className }: ChatEmptyStateProps) {
  return (
    <div
      className={cn(
        "max-w-[90%] bg-[var(--ba-msg-assistant-bg)] px-3 py-2 text-[13px] leading-relaxed text-[var(--ba-msg-assistant-fg)]",
        className,
      )}
      style={{ borderRadius: "var(--ba-radius-msg)" }}
    >
      {greeting}
    </div>
  );
}
