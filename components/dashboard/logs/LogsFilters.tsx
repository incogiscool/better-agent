"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "succeeded", label: "Succeeded" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "timed_out", label: "Timed out" },
  { value: "abandoned", label: "Abandoned" },
];

interface LogsFiltersProps {
  toolOptions: { id: string; name: string }[];
}

export function LogsFilters({ toolOptions }: LogsFiltersProps) {
  const router = useRouter();
  const params = useSearchParams();
  const status = params.get("status") ?? "";
  const toolId = params.get("toolId") ?? "";

  function update(patch: Record<string, string | null>) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (value == null || value === "") next.delete(key);
      else next.set(key, value);
    }
    next.delete("cursor");
    const query = next.toString();
    router.replace(query ? `?${query}` : "?");
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border border-border bg-muted/20 px-3 py-2 text-xs">
      <FilterGroup label="Status">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => update({ status: opt.value })}
            className={cn(
              "border border-transparent px-2 py-0.5 font-mono text-[11px]",
              status === opt.value
                ? "border-border bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        ))}
      </FilterGroup>

      {toolOptions.length > 0 && (
        <FilterGroup label="Tool">
          <select
            value={toolId}
            onChange={(e) => update({ toolId: e.target.value })}
            className="rounded-none border border-border bg-background px-2 py-0.5 font-mono text-[11px]"
          >
            <option value="">All</option>
            {toolOptions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </FilterGroup>
      )}
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  );
}
