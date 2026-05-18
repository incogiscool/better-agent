"use client";

import * as React from "react";
import { Copy, Check, Eye, EyeSlash } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface SecretRevealProps {
  value: string;
  label?: string;
  hint?: React.ReactNode;
  defaultHidden?: boolean;
  className?: string;
}

export function SecretReveal({
  value,
  label,
  hint,
  defaultHidden = true,
  className,
}: SecretRevealProps) {
  const [hidden, setHidden] = React.useState(defaultHidden);
  const [copied, setCopied] = React.useState(false);

  const masked = React.useMemo(() => "•".repeat(Math.max(value.length, 24)), [
    value,
  ]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">{label}</span>
          {hint && (
            <span className="text-[10px] text-muted-foreground">{hint}</span>
          )}
        </div>
      )}
      <div className="flex items-stretch border border-border">
        <div className="flex-1 overflow-x-auto break-all px-3 py-2 font-mono text-xs">
          {hidden ? masked : value}
        </div>
        <button
          type="button"
          onClick={() => setHidden((v) => !v)}
          aria-label={hidden ? "Reveal" : "Hide"}
          className="border-l border-border px-2.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {hidden ? <EyeSlash size={14} /> : <Eye size={14} />}
        </button>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Copied" : "Copy"}
          className="border-l border-border px-2.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {copied ? <Check size={14} weight="bold" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
}
