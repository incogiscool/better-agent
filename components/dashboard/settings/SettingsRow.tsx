import * as React from "react";
import { cn } from "@/lib/utils";

interface SettingsRowProps {
  title: string;
  description?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  danger?: boolean;
}

export function SettingsRow({
  title,
  description,
  footer,
  children,
  danger,
}: SettingsRowProps) {
  return (
    <div className={cn("border-b", danger ? "border-destructive/30" : "border-border")}>
      <div className="flex flex-col gap-4 px-4 sm:px-6 py-8 md:flex-row md:gap-16">
        <div className="space-y-1 md:w-56 md:shrink-0">
          <h2 className={cn("text-xs font-medium", danger && "text-destructive")}>
            {title}
          </h2>
          {description && (
            <p className="text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        <div className="w-full md:w-80">{children}</div>
      </div>
      {footer && (
        <div
          className={cn(
            "flex flex-col items-start gap-2 border-t px-4 sm:px-6 py-3 sm:flex-row sm:items-center sm:justify-between",
            danger
              ? "border-destructive/30 bg-destructive/5"
              : "border-border bg-muted/30",
          )}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
