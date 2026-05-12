"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type TerminalLineTone =
  | "comment"
  | "prompt"
  | "code"
  | "success"
  | "error"
  | "muted";

export type TerminalLine = {
  tone?: TerminalLineTone;
  text: string;
  pauseAfterMs?: number;
};

interface AuthTerminalProps {
  title: string;
  rightLabel?: string;
  lines: TerminalLine[];
  typingSpeedMs?: number;
  className?: string;
}

const TONE_CLASS: Record<TerminalLineTone, string> = {
  comment: "text-muted-foreground/70 italic",
  prompt: "text-primary",
  code: "text-foreground/90",
  success: "text-foreground/90",
  error: "text-destructive",
  muted: "text-muted-foreground",
};

export function AuthTerminal({
  title,
  rightLabel,
  lines,
  typingSpeedMs = 14,
  className,
}: AuthTerminalProps) {
  const [visibleLines, setVisibleLines] = React.useState<
    { tone: TerminalLineTone; text: string }[]
  >([]);
  const [currentLine, setCurrentLine] = React.useState<{
    tone: TerminalLineTone;
    text: string;
  } | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    async function run() {
      while (!cancelled) {
        setVisibleLines([]);
        setCurrentLine(null);

        for (const line of lines) {
          if (cancelled) return;
          const tone = line.tone ?? "code";

          for (let i = 1; i <= line.text.length; i++) {
            if (cancelled) return;
            setCurrentLine({ tone, text: line.text.slice(0, i) });
            await new Promise<void>((resolve) => {
              timeoutId = setTimeout(resolve, typingSpeedMs);
            });
          }

          setVisibleLines((prev) => [...prev, { tone, text: line.text }]);
          setCurrentLine(null);

          await new Promise<void>((resolve) => {
            timeoutId = setTimeout(resolve, line.pauseAfterMs ?? 240);
          });
        }

        await new Promise<void>((resolve) => {
          timeoutId = setTimeout(resolve, 1800);
        });
      }
    }

    run();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [lines, typingSpeedMs]);

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col overflow-hidden border border-border bg-white font-mono text-xs text-foreground/90 dark:bg-black/80",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-black/15 dark:bg-white/15" />
          <span className="size-2.5 rounded-full bg-black/15 dark:bg-white/15" />
          <span className="size-2.5 rounded-full bg-black/15 dark:bg-white/15" />
          <span className="ml-3 text-[11px] text-muted-foreground">
            {title}
          </span>
        </div>
        {rightLabel && (
          <span className="text-[10px] text-primary">{rightLabel}</span>
        )}
      </div>

      <div className="flex-1 space-y-1 overflow-hidden px-5 py-4 leading-relaxed">
        {visibleLines.map((line, i) => (
          <TerminalRow key={i} tone={line.tone} text={line.text} />
        ))}
        {currentLine && (
          <TerminalRow tone={currentLine.tone} text={currentLine.text} cursor />
        )}
        {!currentLine && (
          <div className="text-primary">
            $<span className="ml-1 inline-block animate-pulse">▍</span>
          </div>
        )}
      </div>
    </div>
  );
}

function TerminalRow({
  tone,
  text,
  cursor,
}: {
  tone: TerminalLineTone;
  text: string;
  cursor?: boolean;
}) {
  const className = TONE_CLASS[tone];
  const prefix =
    tone === "prompt"
      ? "> "
      : tone === "success"
        ? "✓ "
        : tone === "error"
          ? "✗ "
          : "";

  return (
    <div className={cn("whitespace-pre-wrap", className)}>
      {tone === "prompt" ? (
        <>
          <span className="text-primary">&gt;</span>{" "}
          <span className="text-foreground/90">{text.replace(/^> /, "")}</span>
        </>
      ) : (
        <>
          {prefix}
          {text}
        </>
      )}
      {cursor && <span className="ml-0.5 inline-block animate-pulse">▍</span>}
    </div>
  );
}
