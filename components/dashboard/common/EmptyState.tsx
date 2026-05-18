import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 border border-border p-5",
        className,
      )}
    >
      {icon && <div className="text-muted-foreground">{icon}</div>}
      <div className="space-y-1">
        <h2 className="text-sm font-medium">{title}</h2>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}
