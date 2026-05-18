import { Skeleton } from "@/components/ui/skeleton";
import {
  StatGridSkeleton,
  TableSkeleton,
} from "@/components/dashboard/common";

export default function Loading() {
  return (
    <div className="space-y-6 px-6 py-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-3 w-80" />
      </div>
      <StatGridSkeleton />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <TableSkeleton rows={8} columns={6} />
      </div>
    </div>
  );
}
