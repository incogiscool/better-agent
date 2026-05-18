"use client";

import * as React from "react";
import { Copy, Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
  showCopy?: boolean;
  label?: string;
}

export function CodeBlock({
  code,
  language,
  className,
  showCopy = true,
  label,
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div className={cn("group relative border border-border", className)}>
      {label && (
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-3 py-1.5">
          <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </span>
          {language && (
            <span className="font-mono text-[10px] text-muted-foreground/70">
              {language}
            </span>
          )}
        </div>
      )}
      <pre className="overflow-x-auto bg-background p-3 font-mono text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
      {showCopy && (
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Copied" : "Copy"}
          className="absolute right-2 top-2 inline-flex size-6 items-center justify-center border border-border bg-background text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100 focus:opacity-100"
        >
          {copied ? <Check size={12} weight="bold" /> : <Copy size={12} />}
        </button>
      )}
    </div>
  );
}
