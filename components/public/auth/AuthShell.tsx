import * as React from "react";
import { cn } from "@/lib/utils";
import { BrandMark } from "./BrandMark";

type StatusBadge = {
  label: string;
  tone?: "live" | "muted";
};

interface AuthShellProps {
  children: React.ReactNode;
  terminal: React.ReactNode;
  footer?: React.ReactNode;
  badges?: StatusBadge[];
}

export function AuthShell({
  children,
  terminal,
  footer,
  badges,
}: AuthShellProps) {
  return (
    <div className="relative grid min-h-svh grid-cols-1 lg:grid-cols-2">
      <header className="absolute top-0 left-0 z-10 flex w-full items-center justify-between px-8 py-7">
        <BrandMark />
        {badges && badges.length > 0 && (
          <div className="flex items-center gap-2">
            {badges.map((badge) => (
              <span
                key={badge.label}
                className={cn(
                  "inline-flex items-center gap-1.5 border border-border bg-background px-2 py-1 text-[10px] text-muted-foreground",
                )}
              >
                {badge.tone === "live" && (
                  <span className="inline-block size-1.5 rounded-full bg-primary" />
                )}
                {badge.label}
              </span>
            ))}
          </div>
        )}
      </header>

      <section className="flex min-h-svh flex-col justify-between px-8 pt-28 pb-8 lg:px-16">
        <div className="mx-auto w-full max-w-sm">{children}</div>
        <div className="mx-auto w-full max-w-sm text-[10px] text-muted-foreground">
          {footer}
        </div>
      </section>

      <aside className="hidden p-6 lg:flex">{terminal}</aside>
    </div>
  );
}
