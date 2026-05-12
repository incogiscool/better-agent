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
      <div className="flex gap-16 px-6 py-8">
        <div className="w-56 shrink-0 space-y-1">
          <h2 className={cn("text-xs font-medium", danger && "text-destructive")}>
            {title}
          </h2>
          {description && (
            <p className="text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        <div className="w-80">{children}</div>
      </div>
      {footer && (
        <div
          className={cn(
            "flex items-center justify-between border-t px-6 py-3",
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
