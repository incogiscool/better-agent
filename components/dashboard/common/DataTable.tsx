"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type Column<T> = {
  key: string;
  header: React.ReactNode;
  width?: string;
  align?: "left" | "right";
  cell: (row: T) => React.ReactNode;
};

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  rowHref?: (row: T) => string;
  emptyState?: React.ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  rowHref,
  emptyState,
  className,
}: DataTableProps<T>) {
  if (rows.length === 0 && emptyState) {
    return <div className={className}>{emptyState}</div>;
  }

  return (
    <div className={cn("overflow-hidden border border-border", className)}>
      <div className="grid border-b border-border bg-muted/30">
        <div
          className="grid items-center px-4 py-2"
          style={{
            gridTemplateColumns: columns
              .map((c) => c.width ?? "minmax(0, 1fr)")
              .join(" "),
          }}
        >
          {columns.map((col) => (
            <div
              key={col.key}
              className={cn(
                "text-[10px] uppercase tracking-[0.16em] text-muted-foreground",
                col.align === "right" && "text-right",
              )}
            >
              {col.header}
            </div>
          ))}
        </div>
      </div>

      <div className="divide-y divide-border">
        {rows.map((row) => {
          const content = (
            <div
              className="grid items-center px-4 py-3 transition-colors hover:bg-muted/40"
              style={{
                gridTemplateColumns: columns
                  .map((c) => c.width ?? "minmax(0, 1fr)")
                  .join(" "),
              }}
            >
              {columns.map((col) => (
                <div
                  key={col.key}
                  className={cn(
                    "min-w-0 truncate font-mono text-xs",
                    col.align === "right" && "text-right",
                  )}
                >
                  {col.cell(row)}
                </div>
              ))}
            </div>
          );

          const href = rowHref?.(row);

          return href ? (
            <Link key={rowKey(row)} href={href} className="block">
              {content}
            </Link>
          ) : (
            <div key={rowKey(row)}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}
