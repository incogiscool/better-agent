"use client";

import * as React from "react";
import { cn } from "@betteragent/react";

interface ChatHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function ChatHeader({
  title,
  subtitle,
  actions,
  className,
}: ChatHeaderProps) {
  return (
    <header
      className={cn(
        "flex items-center gap-2 border-b border-[var(--ba-border)] bg-[var(--ba-panel-bg)] px-3 py-2",
        className,
      )}
    >
      <span aria-hidden className="font-[var(--ba-font-mono)] text-[var(--ba-muted-fg)]">
        ›
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12px] font-medium text-[var(--ba-fg)]">
          {title}
        </div>
        {subtitle && (
          <div className="truncate text-[10px] text-[var(--ba-muted-fg)]">
            {subtitle}
          </div>
        )}
      </div>
      {actions && <div className="flex items-center gap-1">{actions}</div>}
    </header>
  );
}
