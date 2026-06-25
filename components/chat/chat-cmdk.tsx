"use client";

import * as React from "react";
import { cn, useChatStream } from "betteragent-react";
import { ChatTeardrop } from "@phosphor-icons/react";
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
  ChatAttribution,
  type SuggestedPrompt,
} from "./pieces";

export interface ChatCmdkProps {
  /** Visible placeholder in the input. */
  placeholder?: string;
  /** Suggested prompts shown as selectable items when no conversation is active. */
  suggestedPrompts?: readonly SuggestedPrompt[];
  /** Keyboard shortcut key (default "k" → ⌘K / Ctrl+K). Pass "" to disable. */
  shortcutKey?: string;
  /**
   * Visible trigger for opening the command bar without a keyboard — needed
   * on touch devices, which have no ⌘K/Ctrl+K. Defaults to a floating
   * bottom-right button. Pass `null` to remove it, e.g. if you're driving
   * `open`/`onOpenChange` from your own UI instead.
   */
  trigger?: React.ReactNode | null;
  /** Controlled open state. Omit to manage it internally. */
  open?: boolean;
  /** Called when the open state should change. Required to drive `open` externally. */
  onOpenChange?: (open: boolean) => void;
  /** Footer attribution. Pass `null` to remove, or a node to replace. */
  attribution?: React.ReactNode;
  className?: string;
}

export function ChatCmdk({
  placeholder = "Type a command, ask, or give an instruction…",
  suggestedPrompts = [],
  shortcutKey = "k",
  trigger,
  open: openProp,
  onOpenChange,
  attribution = <ChatAttribution inline />,
  className,
}: ChatCmdkProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = openProp ?? internalOpen;
  const [value, setValue] = React.useState("");
  const { messages, send, error, isStreaming, reset } = useChatStream();

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );

  React.useEffect(() => {
    if (!shortcutKey) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === shortcutKey) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcutKey, open, setOpen]);

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

  const defaultTrigger = (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Open agent command bar"
      className="fixed bottom-4 right-4 z-40 inline-flex size-12 items-center justify-center rounded-full bg-[var(--ba-fg)] text-[var(--ba-bg)] shadow-md transition-transform hover:scale-105 active:scale-95"
    >
      <ChatTeardrop size={18} weight="fill" />
    </button>
  );

  return (
    <>
      {trigger === null
        ? null
        : React.isValidElement(trigger)
          ? trigger
          : defaultTrigger}
      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Agent command bar"
        description="Type a natural-language instruction or pick a suggestion."
        showCloseButton
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
            "flex items-center justify-between gap-3 border-t border-border bg-muted/40 px-3 py-1.5 font-mono text-[10px] text-muted-foreground",
          )}>
            <div className="flex items-center gap-3">
              <span>↵ send</span>
              <span className="hidden sm:inline">⌘K open</span>
              <span className="hidden sm:inline">esc close</span>
              {isStreaming && <span className="text-primary">streaming…</span>}
            </div>
            {attribution}
          </div>
        </Command>
      </CommandDialog>
    </>
  );
}
