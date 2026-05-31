"use client";

import * as React from "react";
import { cn, useChatStream } from "betteragent-react";
import { ChatTeardrop, X as CloseIcon } from "@phosphor-icons/react";
import {
  ChatHeader,
  ChatInput,
  ChatMessages,
  ChatEmptyState,
  ChatErrorBanner,
  ChatSuggestedPrompts,
  type SuggestedPrompt,
} from "./pieces";

export interface ChatPopupProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  greeting?: string;
  suggestedPrompts?: readonly SuggestedPrompt[];
  /** Initial open state (default closed). */
  defaultOpen?: boolean;
  className?: string;
}

export function ChatPopup({
  title = "Agent",
  subtitle,
  greeting = "Hi — how can I help?",
  suggestedPrompts = [],
  defaultOpen = false,
  className,
}: ChatPopupProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const { messages, send, error, isStreaming, reset } = useChatStream();

  return (
    <div
      data-ba-variant="popup"
      data-state={open ? "open" : "closed"}
      className={cn("fixed bottom-4 right-4 z-40 flex flex-col items-end", className)}
      style={{ fontFamily: "var(--ba-font-sans)" }}
    >
      {open && (
        <section
          className="mb-2 flex h-[480px] w-[360px] max-w-[calc(100vw-2rem)] flex-col border border-[var(--ba-border)] bg-[var(--ba-panel-bg)] text-[var(--ba-fg)] shadow-lg"
          role="dialog"
          aria-label="Agent chat"
        >
          <ChatHeader
            title={title}
            subtitle={subtitle}
            actions={
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="inline-flex size-5 items-center justify-center text-[var(--ba-muted-fg)] hover:text-[var(--ba-fg)]"
              >
                <CloseIcon size={12} />
              </button>
            }
          />

          <ChatMessages
            messages={messages}
            empty={<ChatEmptyState greeting={greeting} />}
          />

          {error && (
            <div className="px-3 pb-2">
              <ChatErrorBanner error={error} onRetry={reset} />
            </div>
          )}

          {messages.length === 0 && suggestedPrompts.length > 0 && (
            <ChatSuggestedPrompts prompts={suggestedPrompts} onPick={(p) => send(p)} />
          )}

          <ChatInput
            onSubmit={(v) => send(v)}
            disabled={isStreaming}
            autoFocus
          />
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat"}
        aria-expanded={open}
        className="inline-flex size-12 items-center justify-center rounded-full bg-[var(--ba-fg)] text-[var(--ba-bg)] shadow-md transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <CloseIcon size={18} /> : <ChatTeardrop size={18} weight="fill" />}
      </button>
    </div>
  );
}
