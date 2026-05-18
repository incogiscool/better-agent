import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3 bg-background p-5", className)}>
      <Skeleton className="h-2.5 w-20" />
      <Skeleton className="h-7 w-24" />
      <Skeleton className="h-2.5 w-32" />
    </div>
  );
}

export function StatGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TableSkeleton({
  rows = 6,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="border border-border">
      <div className="flex items-center gap-4 border-b border-border bg-muted/30 px-4 py-2">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-2.5 flex-1" />
        ))}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 px-4 py-3">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton key={c} className="h-3 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3 border border-border p-5", className)}>
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-2.5 w-full" />
      <Skeleton className="h-2.5 w-3/4" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-72" />
      </div>
      <StatGridSkeleton />
      <TableSkeleton />
    </div>
  );
}
