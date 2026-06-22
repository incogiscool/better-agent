"use client";

import * as React from "react";
import { cn } from "betteragent-react";
import { PaperPlaneTilt } from "@phosphor-icons/react";

interface ChatInputProps {
  onSubmit: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export function ChatInput({
  onSubmit,
  placeholder = "Ask the agent to do something…",
  disabled,
  autoFocus,
  className,
}: ChatInputProps) {
  const [value, setValue] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const capped = el.scrollHeight > 160;
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    el.style.overflowY = capped ? "auto" : "hidden";
  }, [value]);

  function commit() {
    const v = value.trim();
    if (!v || disabled) return;
    onSubmit(v);
    setValue("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      commit();
      return;
    }
    if (e.key === "Escape") {
      (e.currentTarget as HTMLTextAreaElement).blur();
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        commit();
      }}
      className={cn(
        "flex items-end gap-2 border-t border-[var(--ba-border)] bg-[var(--ba-panel-bg)] p-2",
        className,
      )}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        rows={1}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-label="Message"
        className="flex-1 resize-none overflow-y-hidden bg-transparent px-2 py-1.5 text-base leading-snug text-[var(--ba-fg)] outline-none placeholder:text-[var(--ba-muted-fg)] disabled:opacity-60 sm:text-sm"
      />
      <button
        type="submit"
        disabled={disabled || value.trim().length === 0}
        aria-label="Send"
        className="inline-flex size-7 shrink-0 items-center justify-center bg-[var(--ba-primary)] text-[var(--ba-primary-fg)] transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        <PaperPlaneTilt size={13} weight="fill" />
      </button>
    </form>
  );
}
