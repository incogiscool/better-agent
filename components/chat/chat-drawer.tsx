"use client";

import * as React from "react";
import { cn, useChatStream } from "betteragent-react";
import { ChatTeardrop, X as CloseIcon } from "@phosphor-icons/react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  ChatHeader,
  ChatInput,
  ChatMessages,
  ChatEmptyState,
  ChatErrorBanner,
  ChatSuggestedPrompts,
  ChatAttribution,
  type SuggestedPrompt,
} from "./pieces";

export interface ChatDrawerProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  greeting?: string;
  suggestedPrompts?: readonly SuggestedPrompt[];
  /** Initial open state (default closed). */
  defaultOpen?: boolean;
  /** Panel width in pixels (default 400). */
  width?: number;
  /** Custom trigger element. Defaults to a floating bottom-right button. */
  trigger?: React.ReactNode;
  /** Footer attribution. Pass `null` to remove, or a node to replace. */
  attribution?: React.ReactNode;
  className?: string;
}

export function ChatDrawer({
  title = "Agent",
  subtitle,
  greeting = "Hi — how can I help?",
  suggestedPrompts = [],
  defaultOpen = false,
  width = 400,
  trigger,
  attribution = <ChatAttribution />,
  className,
}: ChatDrawerProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const { messages, send, error, isStreaming, reset } = useChatStream();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) reset();
  }

  const defaultTrigger = (
    <button
      type="button"
      aria-label={open ? "Close chat" : "Open chat"}
      aria-expanded={open}
      className="fixed bottom-4 right-4 z-40 inline-flex size-12 items-center justify-center rounded-full bg-[var(--ba-fg)] text-[var(--ba-bg)] shadow-md transition-transform hover:scale-105 active:scale-95"
    >
      {open ? <CloseIcon size={18} /> : <ChatTeardrop size={18} weight="fill" />}
    </button>
  );

  return (
    <Drawer
      open={open}
      onOpenChange={handleOpenChange}
      direction="right"
    >
      <DrawerTrigger asChild>
        {trigger ?? defaultTrigger}
      </DrawerTrigger>

      <DrawerContent
        data-ba-variant="drawer"
        className={cn(
          "flex flex-col border-l border-[var(--ba-border)] bg-[var(--ba-panel-bg)] text-[var(--ba-fg)]",
          className,
        )}
        style={{ width, maxWidth: "100vw", fontFamily: "var(--ba-font-sans)" }}
      >
        <DrawerTitle className="sr-only">Agent chat</DrawerTitle>
        <DrawerDescription className="sr-only">
          Type a message or pick a suggestion to start a conversation.
        </DrawerDescription>

        <ChatHeader
          title={title}
          subtitle={subtitle}
          actions={
            <DrawerClose asChild>
              <button
                type="button"
                aria-label="Close"
                className="inline-flex size-5 items-center justify-center text-[var(--ba-muted-fg)] hover:text-[var(--ba-fg)]"
              >
                <CloseIcon size={12} />
              </button>
            </DrawerClose>
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
          <ChatSuggestedPrompts
            prompts={suggestedPrompts}
            onPick={(p) => send(p)}
          />
        )}

        <ChatInput
          onSubmit={(v) => send(v)}
          disabled={isStreaming}
          autoFocus
        />

        {attribution}
      </DrawerContent>
    </Drawer>
  );
}
