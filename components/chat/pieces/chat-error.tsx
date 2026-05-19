"use client";

import { cn } from "@betteragent/react";
import type { ChatError } from "@betteragent/react";

interface ChatErrorProps {
  error: ChatError;
  onRetry?: () => void;
  className?: string;
}

const FRIENDLY: Record<string, string> = {
  token_cap: "This conversation hit its token cap. Start a new chat to keep going.",
  turn_cap: "This conversation hit its step limit. Start a new chat to keep going.",
  rate_limit: "You're sending messages too quickly. Try again in a moment.",
};

export function ChatErrorBanner({ error, onRetry, className }: ChatErrorProps) {
  const friendly = (error.code && FRIENDLY[error.code]) ?? error.message;
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2 border border-[var(--ba-destructive)]/30 bg-[var(--ba-destructive)]/5 px-3 py-2 text-[12px] text-[var(--ba-destructive)]",
        className,
      )}
    >
      <span aria-hidden>!</span>
      <div className="flex-1 space-y-1">
        <div>{friendly}</div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="underline underline-offset-2 hover:no-underline"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
