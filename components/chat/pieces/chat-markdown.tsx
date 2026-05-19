"use client";

import { Streamdown } from "streamdown";
import { cn } from "@betteragent/react";

interface ChatMarkdownProps {
  children: string;
  className?: string;
}

export function ChatMarkdown({ children, className }: ChatMarkdownProps) {
  return (
    <div
      className={cn(
        "prose-sm max-w-none text-[13px] leading-relaxed text-[var(--ba-fg)] [&_a]:text-[var(--ba-primary)] [&_a]:underline [&_code]:rounded-none [&_code]:bg-[var(--ba-muted)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[12px] [&_pre]:bg-[var(--ba-muted)] [&_pre]:p-3",
        className,
      )}
    >
      <Streamdown>{children}</Streamdown>
    </div>
  );
}
