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

// How close to the bottom (px) still counts as "stuck". Generous enough to
// survive sub-pixel rounding and a single fast streaming delta without
// accidentally unsticking.
const STICK_THRESHOLD = 48;

/**
 * Scroll container with auto-scroll-to-bottom. While the view is stuck to the
 * bottom, a ResizeObserver re-pins it on every content size change — including
 * streaming text deltas and late markdown/image layout — so it always reaches
 * the true end. When the user scrolls up past the threshold, auto-scroll pauses
 * until they return to the bottom.
 */
export function ChatMessages({
  messages,
  empty,
  className,
}: ChatMessagesProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const stickRef = React.useRef(true);

  const scrollToBottom = React.useCallback(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  // Re-pin to the bottom whenever the content grows while stuck. Observing the
  // inner content (the fixed-height container's box never changes) is what
  // catches streaming deltas and late layout that a messages-only effect
  // misses, which previously left the view short of the end.
  React.useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const ro = new ResizeObserver(() => {
      if (stickRef.current) scrollToBottom();
    });
    ro.observe(content);
    return () => ro.disconnect();
  }, [scrollToBottom]);

  function onScroll() {
    const el = containerRef.current;
    if (!el) return;
    const distanceFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight;
    stickRef.current = distanceFromBottom <= STICK_THRESHOLD;
  }

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      className={cn("flex-1 overflow-y-auto px-3 py-3", className)}
    >
      <div ref={contentRef} className="space-y-3">
        {messages.length === 0 ? empty : null}
        {messages.map((m) => (
          <ChatMessageBlock key={m.id} message={m} />
        ))}
      </div>
    </div>
  );
}
