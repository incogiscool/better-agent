"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CaretRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const SECTION_LABELS: Record<string, string> = {
  runs: "Runs",
  tools: "Tools",
  logs: "Logs",
  usage: "Usage",
  settings: "Settings",
};

interface ProjectBreadcrumbProps {
  projectId: string;
  projectName: string;
  className?: string;
}

export function ProjectBreadcrumb({
  projectId,
  projectName,
  className,
}: ProjectBreadcrumbProps) {
  const pathname = usePathname();
  const match = pathname.match(
    /^\/dashboard\/projects\/[^/]+\/([^/]+)(?:\/([^/]+))?/,
  );
  const section = match?.[1];
  const subId = match?.[2];

  const sectionLabel = section ? SECTION_LABELS[section] ?? section : null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1.5 text-xs", className)}
    >
      <Link
        href={`/dashboard/projects/${projectId}/runs`}
        className="font-mono text-foreground hover:underline"
      >
        {projectName}
      </Link>
      {sectionLabel && (
        <>
          <CaretRight
            size={10}
            className="text-muted-foreground/60"
            weight="bold"
          />
          <Link
            href={`/dashboard/projects/${projectId}/${section}`}
            className={cn(
              subId ? "text-muted-foreground hover:underline" : "text-foreground",
            )}
          >
            {sectionLabel}
          </Link>
        </>
      )}
      {subId && (
        <>
          <CaretRight
            size={10}
            className="text-muted-foreground/60"
            weight="bold"
          />
          <span className="truncate font-mono text-muted-foreground">
            {subId}
          </span>
        </>
      )}
    </nav>
  );
}
