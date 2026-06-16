import * as React from "react";
import { cn } from "betteragent-react";

export interface ChatAttributionProps {
  /** Attribution text. */
  label?: string;
  /** Link target. */
  href?: string;
  /**
   * Render as a bare inline link (no footer bar), for embedding inside an
   * existing footer row. Defaults to a self-contained bottom bar.
   */
  inline?: boolean;
  className?: string;
}

/**
 * "powered by betteragent" attribution. Rendered by every chat container by
 * default; pass `attribution={null}` on the container to remove it, or a custom
 * node (e.g. `<ChatAttribution label="..." href="..." />`) to replace it.
 */
export function ChatAttribution({
  label = "powered by betteragent",
  href = "https://betteragent.dev",
  inline = false,
  className,
}: ChatAttributionProps) {
  const link = (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="opacity-70 transition-opacity hover:opacity-100"
    >
      {label}
    </a>
  );

  // Bare link that inherits its surroundings' typography/color — used inside the
  // cmdk footer, which is built on shadcn tokens rather than --ba-* vars.
  if (inline) {
    return <span className={cn("inline-flex", className)}>{link}</span>;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center border-t border-[var(--ba-border)] bg-[var(--ba-muted)]/40 px-3 py-1.5 font-[var(--ba-font-mono)] text-[10px] text-[var(--ba-muted-fg)]",
        className,
      )}
    >
      {link}
    </div>
  );
}
