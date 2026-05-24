import type React from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function GithubIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1.5A10.5 10.5 0 0 0 1.5 12c0 4.64 3 8.58 7.18 9.97.52.1.71-.23.71-.5 0-.25-.01-.92-.01-1.81-2.92.63-3.54-1.4-3.54-1.4-.48-1.22-1.17-1.55-1.17-1.55-.95-.65.07-.64.07-.64 1.06.08 1.61 1.09 1.61 1.09.94 1.6 2.46 1.14 3.06.87.09-.68.37-1.14.66-1.4-2.33-.27-4.78-1.17-4.78-5.18 0-1.14.41-2.08 1.08-2.81-.11-.27-.47-1.34.1-2.8 0 0 .89-.28 2.9 1.08a10 10 0 0 1 5.28 0c2.01-1.36 2.89-1.08 2.89-1.08.58 1.46.21 2.53.1 2.8.68.73 1.08 1.67 1.08 2.81 0 4.02-2.46 4.9-4.8 5.16.38.33.71.96.71 1.95 0 1.41-.01 2.55-.01 2.9 0 .28.19.61.72.5A10.5 10.5 0 0 0 22.5 12 10.5 10.5 0 0 0 12 1.5Z" />
    </svg>
  );
}

// ── Primitive components ──────────────────────────────────────

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-primary">
      <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
      {children}
    </span>
  );
}

export function Pill({ children, primary }: { children: React.ReactNode; primary?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full font-mono text-[11px]",
        primary
          ? "bg-primary/14 border border-primary/30 text-primary"
          : "bg-muted border border-border text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

// ── Button class names ────────────────────────────────────────

export const defaultBtn = buttonVariants({ variant: "outline" });
export const primaryBtn = buttonVariants({ variant: "default" });
export const ghostBtn = buttonVariants({ variant: "ghost" });
export const lgBtn = buttonVariants({ variant: "outline", size: "lg" });
export const lgPrimaryBtn = buttonVariants({ variant: "default", size: "lg" });

// ── Layout class name constants ───────────────────────────────

export const WRAP = "max-w-[1320px] mx-auto px-10";
export const SEC = "border-b border-border py-24";
export const SECHEAD = "flex flex-col gap-4 max-w-[720px] mb-14";
export const H2 = "font-mono font-medium text-[40px] leading-[1.08] tracking-[-0.025em] m-0";
export const SUB = "font-sans text-lg leading-[1.55] text-muted-foreground m-0";
export const DOT_BG = "dot-bg";

// ── Dark terminal block ───────────────────────────────────────

export function DarkCode({ children, language }: { children: React.ReactNode; language?: string }) {
  return (
    <div className="bg-[oklch(0.145_0_0)] border border-[oklch(1_0_0/10%)] rounded-xl overflow-hidden font-mono text-[13px] leading-[1.7]">
      {language && (
        <div className="px-4 py-2 border-b border-[oklch(1_0_0/10%)] text-[11px] text-[oklch(0.65_0_0)] flex items-center gap-2">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-[9px] h-[9px] rounded-full bg-[oklch(1_0_0/15%)] inline-block" />
            ))}
          </div>
          <span>{language}</span>
        </div>
      )}
      <div className="p-[18px_22px] text-[oklch(0.985_0_0)] whitespace-pre overflow-x-auto">
        {children}
      </div>
    </div>
  );
}

export function CodeChip({ children }: { children: React.ReactNode }) {
  return (
    <code className="px-2 py-px rounded-[5px] bg-muted border border-border font-mono text-[0.9em] text-foreground">
      {children}
    </code>
  );
}

