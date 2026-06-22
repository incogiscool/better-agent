"use client";

import { cn } from "betteragent-react";
import type { ChatMessage } from "betteragent-react";
import { ChatMarkdown } from "./chat-markdown";
import { ChatToolCall } from "./chat-tool-call";
import { ChatTyping } from "./chat-typing";

interface ChatMessageProps {
  message: ChatMessage;
  className?: string;
}

export function ChatMessageBlock({ message, className }: ChatMessageProps) {
  if (message.role === "user") {
    return (
      <div className={cn("flex justify-end", className)}>
        <div
          className="max-w-[90%] sm:max-w-[80%] bg-[var(--ba-msg-user-bg)] px-3 py-1.5 text-[13px] text-[var(--ba-msg-user-fg)]"
          style={{ borderRadius: "var(--ba-radius-msg)" }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  const showTyping =
    message.streaming &&
    message.content.length === 0 &&
    message.toolCalls.length === 0;

  return (
    <div className={cn("space-y-2", className)}>
      {message.toolCalls.map((tc) => (
        <ChatToolCall key={tc.id} entry={tc} />
      ))}
      {showTyping ? (
        <ChatTyping />
      ) : message.content ? (
        <div
          className="max-w-[90%] bg-[var(--ba-msg-assistant-bg)] px-3 py-2 text-[var(--ba-msg-assistant-fg)]"
          style={{ borderRadius: "var(--ba-radius-msg)" }}
        >
          <ChatMarkdown>{message.content}</ChatMarkdown>
        </div>
      ) : null}
    </div>
  );
}
