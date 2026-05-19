"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { cn, useChatStream } from "@betteragent/react";
import {
  ChatMessages,
  ChatErrorBanner,
  ChatSuggestedPrompts,
  type SuggestedPrompt,
} from "./pieces";

export interface ChatCommandBarProps {
  /** Visible placeholder in the input. */
  placeholder?: string;
  /** Suggested prompts shown below the input. */
  suggestedPrompts?: readonly SuggestedPrompt[];
  /** Keyboard shortcut key (default "k" → ⌘K / Ctrl+K). Pass "" to disable. */
  shortcutKey?: string;
  /** Footer attribution (default "powered by betteragent"). */
  footerLabel?: string;
  className?: string;
}

export function ChatCommandBar({
  placeholder = "Type a command, ask, or give an instruction…",
  suggestedPrompts = [],
  shortcutKey = "k",
  footerLabel = "powered by betteragent",
  className,
}: ChatCommandBarProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const { messages, send, error, isStreaming, reset } = useChatStream();

  React.useEffect(() => {
    if (!shortcutKey) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === shortcutKey) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcutKey]);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && value.trim()) {
      e.preventDefault();
      void send(value.trim());
      setValue("");
    }
  }

  function closeAndReset() {
    setOpen(false);
    setValue("");
    reset();
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className={cn(
            "fixed left-1/2 top-[20%] z-50 w-[min(640px,calc(100vw-2rem))] -translate-x-1/2 border border-[var(--ba-border)] bg-[var(--ba-panel-bg)] text-[var(--ba-fg)] shadow-2xl outline-none",
            className,
          )}
          style={{ fontFamily: "var(--ba-font-sans)" }}
        >
          <DialogPrimitive.Title className="sr-only">Agent command bar</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Type a natural-language instruction or pick a suggestion.
          </DialogPrimitive.Description>

          <div className="flex items-center gap-2 border-b border-[var(--ba-border)] px-3 py-2">
            <span aria-hidden className="font-[var(--ba-font-mono)] text-[var(--ba-muted-fg)]">
              ›
            </span>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={placeholder}
              autoFocus
              aria-label="Instruction"
              className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-[var(--ba-muted-fg)]"
            />
            <kbd className="border border-[var(--ba-border)] px-1.5 py-0.5 font-[var(--ba-font-mono)] text-[10px] text-[var(--ba-muted-fg)]">
              esc
            </kbd>
          </div>

          {messages.length === 0 && suggestedPrompts.length > 0 && (
            <div className="pt-2">
              <ChatSuggestedPrompts
                prompts={suggestedPrompts}
                onPick={(p) => send(p)}
              />
            </div>
          )}

          {messages.length > 0 && (
            <div className="max-h-[50vh]">
              <ChatMessages messages={messages} className="px-3 py-3" />
            </div>
          )}

          {error && (
            <div className="px-3 pb-2">
              <ChatErrorBanner error={error} onRetry={closeAndReset} />
            </div>
          )}

          <div className="flex items-center justify-between border-t border-[var(--ba-border)] bg-[var(--ba-muted)]/40 px-3 py-1.5 text-[10px] text-[var(--ba-muted-fg)]">
            <div className="flex items-center gap-2 font-[var(--ba-font-mono)]">
              <span>↑↓ run</span>
              <span>⌘K open</span>
              <span>esc close</span>
              {isStreaming && (
                <span className="text-[var(--ba-primary)]">streaming…</span>
              )}
            </div>
            <span className="font-[var(--ba-font-mono)]">{footerLabel}</span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
