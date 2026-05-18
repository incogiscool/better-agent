"use client";

import * as React from "react";
import { CaretRight, Copy, Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface JsonViewerProps {
  value: unknown;
  label?: string;
  defaultOpen?: boolean;
  className?: string;
  maxPreviewChars?: number;
}

function stringify(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function JsonViewer({
  value,
  label,
  defaultOpen = false,
  className,
  maxPreviewChars = 64,
}: JsonViewerProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [copied, setCopied] = React.useState(false);

  const formatted = React.useMemo(() => stringify(value), [value]);
  const preview = React.useMemo(() => {
    const flat = formatted.replace(/\s+/g, " ").trim();
    return flat.length > maxPreviewChars
      ? `${flat.slice(0, maxPreviewChars)}…`
      : flat;
  }, [formatted, maxPreviewChars]);

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div className={cn("border border-border", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 bg-muted/30 px-3 py-2 text-left text-xs hover:bg-muted/50"
      >
        <CaretRight
          size={12}
          className={cn("text-muted-foreground transition-transform", open && "rotate-90")}
        />
        {label && (
          <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </span>
        )}
        {!open && (
          <span className="ml-auto truncate font-mono text-[11px] text-muted-foreground/80">
            {preview}
          </span>
        )}
        {open && (
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy JSON"
            className="ml-auto inline-flex size-5 items-center justify-center text-muted-foreground hover:text-foreground"
          >
            {copied ? <Check size={11} weight="bold" /> : <Copy size={11} />}
          </button>
        )}
      </button>
      {open && (
        <pre className="overflow-x-auto bg-background p-3 font-mono text-[11px] leading-relaxed">
          <code>{formatted}</code>
        </pre>
      )}
    </div>
  );
}
