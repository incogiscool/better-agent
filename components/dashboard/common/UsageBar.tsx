import * as React from "react";
import { cn } from "@/lib/utils";

interface UsageBarProps {
  used: number;
  total: number;
  overage?: number;
  className?: string;
  warnAt?: number;
}

export function UsageBar({
  used,
  total,
  overage = 0,
  className,
  warnAt = 0.8,
}: UsageBarProps) {
  const safeTotal = Math.max(total, 1);
  const usedRatio = Math.min(used / safeTotal, 1);
  const overageRatio = Math.min(overage / safeTotal, 1);

  const tone =
    used >= total
      ? "bg-destructive"
      : usedRatio >= warnAt
        ? "bg-amber-500"
        : "bg-primary";

  return (
    <div className={cn("flex h-1.5 w-full overflow-hidden bg-muted", className)}>
      <div
        className={cn("h-full transition-[width] duration-300", tone)}
        style={{ width: `${usedRatio * 100}%` }}
      />
      {overage > 0 && (
        <div
          className="h-full bg-destructive/70"
          style={{ width: `${overageRatio * 100}%` }}
        />
      )}
    </div>
  );
}
