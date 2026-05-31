"use client";

import { cn } from "betteragent-react";

interface ChatTypingProps {
  className?: string;
}

export function ChatTyping({ className }: ChatTypingProps) {
  return (
    <div
      className={cn("flex items-center gap-1", className)}
      aria-label="Assistant is thinking"
      role="status"
    >
      <span className="ba-typing-dot inline-block size-1.5 rounded-full bg-[var(--ba-primary)]" />
      <span className="ba-typing-dot inline-block size-1.5 rounded-full bg-[var(--ba-primary)]" />
      <span className="ba-typing-dot inline-block size-1.5 rounded-full bg-[var(--ba-primary)]" />
    </div>
  );
}
