"use client";

import Link from "next/link";
import { ArrowUpRight, Coins } from "@phosphor-icons/react";
import posthog from "posthog-js";
import { cn } from "@/lib/utils";

/**
 * Friendly prompt nudging users to ask for more credits via the contact form.
 * `source` is recorded so we can see which surface drives credit requests.
 * Use `variant="card"` for standalone strips and `variant="inline"` in tight
 * columns / button rows.
 */
export function NeedMoreCreditsNote({
  source,
  variant = "card",
  className,
}: {
  source: string;
  variant?: "card" | "inline";
  className?: string;
}) {
  const content = (
    <>
      <span className="inline-flex items-center gap-1.5">
        <Coins size={13} className="text-primary shrink-0" />
        Need more credits to mess around?
      </span>
      <Link
        href="/contact?topic=credits"
        onClick={() => posthog.capture("need_more_credits_clicked", { source })}
        className="inline-flex items-center gap-1 text-primary hover:underline underline-offset-2"
      >
        Send us a message
        <ArrowUpRight size={11} className="shrink-0" />
      </Link>
    </>
  );

  if (variant === "inline") {
    return (
      <p
        className={cn(
          "flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[12px] text-muted-foreground m-0",
          className,
        )}
      >
        {content}
      </p>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-2 gap-y-1 border border-border rounded-lg bg-muted/40 px-4 py-3 text-center font-mono text-[13px] text-muted-foreground",
        className,
      )}
    >
      {content}
    </div>
  );
}
