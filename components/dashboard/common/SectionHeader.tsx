import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  size?: "sm" | "lg";
}

export function SectionHeader({
  title,
  description,
  actions,
  className,
  size = "sm",
}: SectionHeaderProps) {
  if (size === "lg") {
    return (
      <header
        className={cn(
          "flex flex-col items-start gap-3 border-b border-border px-4 sm:px-6 py-6 md:flex-row md:items-start md:justify-between md:gap-4",
          className,
        )}
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 pt-1">{actions}</div>
        )}
      </header>
    );
  }

  return (
    <header
      className={cn(
        "flex flex-col items-start gap-3 border-b border-border px-4 sm:px-6 py-5 md:flex-row md:items-center md:justify-between md:gap-4",
        className,
      )}
    >
      <div className="space-y-0.5">
        <h1 className="text-sm font-medium">{title}</h1>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">{actions}</div>
      )}
    </header>
  );
}
