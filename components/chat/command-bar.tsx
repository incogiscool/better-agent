"use client";

import * as React from "react";
import { cn, useChatStream } from "@betteragent/react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  ChatMessages,
  ChatErrorBanner,
  type SuggestedPrompt,
} from "./pieces";

export interface ChatCommandBarProps {
  /** Visible placeholder in the input. */
  placeholder?: string;
  /** Suggested prompts shown as selectable items when no conversation is active. */
  suggestedPrompts?: readonly SuggestedPrompt[];
  /** Keyboard shortcut key (default "k" → ⌘K / Ctrl+K). Pass "" to disable. */
  shortcutKey?: string;
  /** Footer attribution label. */
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

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setValue("");
      reset();
    }
  }

  function handleSelect(prompt: string) {
    void send(prompt);
    setValue("");
  }

  const showSuggestions = messages.length === 0 && suggestedPrompts.length > 0;
  const showMessages = messages.length > 0;

  return (
    <CommandDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Agent command bar"
      description="Type a natural-language instruction or pick a suggestion."
      className={cn("sm:max-w-2xl", className)}
    >
      <Command shouldFilter={false}>
        <CommandInput
          value={value}
          onValueChange={setValue}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
        />

        {showSuggestions && (
          <CommandList>
            <CommandEmpty>No suggestions.</CommandEmpty>
            <CommandGroup>
              {suggestedPrompts.map((p) => (
                <CommandItem
                  key={p.label}
                  onSelect={() => handleSelect(p.prompt)}
                  className="gap-2"
                >
                  {p.icon}
                  <span className="truncate">{p.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        )}

        {showMessages && (
          <ChatMessages messages={messages} className="max-h-[50vh] px-3 py-3" />
        )}

        {error && (
          <div className="px-3 pb-2">
            <ChatErrorBanner
              error={error}
              onRetry={() => {
                setValue("");
                reset();
                setOpen(false);
              }}
            />
          </div>
        )}

        <div className={cn(
          "flex items-center justify-between border-t border-border bg-muted/40 px-3 py-1.5 font-mono text-[10px] text-muted-foreground",
        )}>
          <div className="flex items-center gap-3">
            <span>↵ send</span>
            <span>⌘K open</span>
            <span>esc close</span>
            {isStreaming && <span className="text-primary">streaming…</span>}
          </div>
          <span>{footerLabel}</span>
        </div>
      </Command>
    </CommandDialog>
  );
}
