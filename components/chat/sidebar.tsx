"use client";

import * as React from "react";
import { cn, useChatStream } from "betteragent-react";
import { X as CloseIcon } from "@phosphor-icons/react";
import {
  ChatHeader,
  ChatInput,
  ChatMessages,
  ChatEmptyState,
  ChatErrorBanner,
  ChatSuggestedPrompts,
  type SuggestedPrompt,
} from "./pieces";

export interface ChatSidebarProps {
  /** Header title (e.g. "Lumen agent"). */
  title?: React.ReactNode;
  /** Header subtitle (e.g. "4 tools · runs as you"). */
  subtitle?: React.ReactNode;
  /** Greeting shown when the conversation is empty. */
  greeting?: string;
  /** "Try this" prompts shown when the conversation is empty. */
  suggestedPrompts?: readonly SuggestedPrompt[];
  /** Width in pixels (default 360). */
  width?: number;
  /** Show a close button in the header. */
  onClose?: () => void;
  className?: string;
}

export function ChatSidebar({
  title = "Agent",
  subtitle,
  greeting = "Hi — how can I help?",
  suggestedPrompts = [],
  width = 360,
  onClose,
  className,
}: ChatSidebarProps) {
  const { messages, send, error, isStreaming, reset } = useChatStream();

  function pickPrompt(prompt: string) {
    void send(prompt);
  }

  return (
    <aside
      data-ba-variant="sidebar"
      className={cn(
        "flex h-full flex-col border-l border-[var(--ba-border)] bg-[var(--ba-panel-bg)] text-[var(--ba-fg)]",
        className,
      )}
      style={{ width, fontFamily: "var(--ba-font-sans)" }}
    >
      <ChatHeader
        title={title}
        subtitle={subtitle}
        actions={
          onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="inline-flex size-5 items-center justify-center text-[var(--ba-muted-fg)] hover:text-[var(--ba-fg)]"
            >
              <CloseIcon size={12} />
            </button>
          )
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
        <ChatSuggestedPrompts prompts={suggestedPrompts} onPick={pickPrompt} />
      )}

      <ChatInput
        onSubmit={(v) => send(v)}
        disabled={isStreaming}
        placeholder={`Ask ${typeof title === "string" ? title : "the agent"} to do something…`}
      />
    </aside>
  );
}
