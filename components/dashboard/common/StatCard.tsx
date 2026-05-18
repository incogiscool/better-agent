import * as React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: "default" | "positive" | "negative";
  className?: string;
}

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
  className,
}: StatCardProps) {
  return (
    <div className={cn("flex flex-col gap-3 bg-background p-5", className)}>
      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <span className="text-2xl font-semibold leading-none tracking-tight">
        {value}
      </span>
      {hint && (
        <span
          className={cn(
            "text-[11px]",
            tone === "positive" && "text-emerald-600 dark:text-emerald-400",
            tone === "negative" && "text-destructive",
            tone === "default" && "text-muted-foreground",
          )}
        >
          {hint}
        </span>
      )}
    </div>
  );
}

interface StatCardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatCardGrid({
  children,
  columns = 4,
  className,
}: StatCardGridProps) {
  const cols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-px border border-border bg-border",
        cols,
        className,
      )}
    >
      {children}
    </div>
  );
}
