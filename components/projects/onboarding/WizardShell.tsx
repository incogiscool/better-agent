"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "@phosphor-icons/react";

export type Step = {
  key: string;
  label: string;
};

interface WizardShellProps {
  steps: Step[];
  current: number;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function WizardShell({
  steps,
  current,
  title,
  description,
  children,
  footer,
}: WizardShellProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col">
      <ol className="grid grid-cols-4 gap-px border border-border bg-border">
        {steps.map((step, i) => {
          const isCurrent = i === current;
          const isDone = i < current;
          return (
            <li
              key={step.key}
              className={cn(
                "flex items-center gap-2 bg-background px-3 py-2.5",
                isCurrent && "bg-muted/60",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-5 items-center justify-center border text-[10px] font-medium",
                  isDone &&
                    "border-primary bg-primary text-primary-foreground",
                  isCurrent && !isDone && "border-primary text-primary",
                  !isCurrent && !isDone && "border-border text-muted-foreground",
                )}
              >
                {isDone ? <Check size={10} weight="bold" /> : i + 1}
              </span>
              <span
                className={cn(
                  "truncate text-[11px]",
                  isCurrent ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>

      <section className="space-y-6 border-x border-b border-border p-6">
        <header className="space-y-1">
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </header>
        {children}
      </section>

      {footer && (
        <footer className="flex items-center justify-between border-x border-b border-border bg-muted/30 px-6 py-3">
          {footer}
        </footer>
      )}
    </div>
  );
}
