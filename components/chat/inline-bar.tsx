"use client";

import * as React from "react";
import { cn, useChatStream } from "@betteragent/react";
import { PaperPlaneTilt, X as CloseIcon } from "@phosphor-icons/react";
import { ChatMessages, ChatErrorBanner } from "./pieces";

export interface ChatInlineBarProps {
  placeholder?: string;
  className?: string;
}

export function ChatInlineBar({
  placeholder = "Tell the agent what to do…",
  className,
}: ChatInlineBarProps) {
  const [value, setValue] = React.useState("");
  const [dismissed, setDismissed] = React.useState(false);
  const { messages, send, error, isStreaming, reset } = useChatStream();

  // Shown when there are messages and user hasn't explicitly closed the panel.
  const expanded = messages.length > 0 && !dismissed;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = value.trim();
    if (!v) return;
    setDismissed(false); // re-open for new conversation
    void send(v);
    setValue("");
  }

  function handleClose() {
    setDismissed(true);
    reset();
  }

  return (
    <div
      data-ba-variant="inline-bar"
      data-state={expanded ? "expanded" : "collapsed"}
      className={cn(
        "relative mx-auto w-full max-w-xl text-[var(--ba-fg)]",
        className,
      )}
      style={{ fontFamily: "var(--ba-font-sans)" }}
    >
      {expanded && (
        <div className="mb-2 max-h-72 overflow-hidden border border-[var(--ba-border)] bg-[var(--ba-panel-bg)] shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--ba-border)] bg-[var(--ba-muted)]/40 px-3 py-1.5">
            <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--ba-muted-fg)]">
              Response
            </span>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close response"
              className="inline-flex size-5 items-center justify-center text-[var(--ba-muted-fg)] hover:text-[var(--ba-fg)]"
            >
              <CloseIcon size={11} />
            </button>
          </div>
          <ChatMessages messages={messages} className="max-h-60 px-3 py-3" />
          {error && (
            <div className="px-3 pb-2">
              <ChatErrorBanner error={error} onRetry={reset} />
            </div>
          )}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border border-[var(--ba-border)] bg-[var(--ba-panel-bg)] px-2"
      >
        <span aria-hidden className="font-[var(--ba-font-mono)] text-[var(--ba-muted-fg)]">
          ›
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          disabled={isStreaming}
          aria-label="Instruction"
          className="flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-[var(--ba-muted-fg)] disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isStreaming || !value.trim()}
          aria-label="Send"
          className="inline-flex size-7 shrink-0 items-center justify-center bg-[var(--ba-primary)] text-[var(--ba-primary-fg)] transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <PaperPlaneTilt size={13} weight="fill" />
        </button>
      </form>
    </div>
  );
}
