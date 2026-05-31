"use client";

import * as React from "react";
import { cn } from "betteragent-react";
import type { ChatMessage } from "betteragent-react";
import { ChatMessageBlock } from "./chat-message";

interface ChatMessagesProps {
  messages: ChatMessage[];
  empty?: React.ReactNode;
  className?: string;
}

/**
 * Scroll container with auto-scroll-to-bottom. When the user scrolls up past
 * a threshold, auto-scroll pauses until they return to bottom.
 */
export function ChatMessages({
  messages,
  empty,
  className,
}: ChatMessagesProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const stickRef = React.useRef(true);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el || !stickRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  function onScroll() {
    const el = containerRef.current;
    if (!el) return;
    const distanceFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight;
    stickRef.current = distanceFromBottom < 24;
  }

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      className={cn("flex-1 space-y-3 overflow-y-auto px-3 py-3", className)}
    >
      {messages.length === 0 ? empty : null}
      {messages.map((m) => (
        <ChatMessageBlock key={m.id} message={m} />
      ))}
    </div>
  );
}
