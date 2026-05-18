"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

export type BasicsValue = {
  name: string;
  baseUrl: string;
};

export type BasicsErrors = {
  name?: string;
  baseUrl?: string;
};

interface StepBasicsProps {
  value: BasicsValue;
  errors: BasicsErrors;
  onChange: (patch: Partial<BasicsValue>) => void;
}

export function StepBasics({ value, errors, onChange }: StepBasicsProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="ba-name" className="text-xs font-medium">
          Project name
        </label>
        <Input
          id="ba-name"
          name="name"
          value={value.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="acme-app"
          autoFocus
        />
        <p className="text-[11px] text-muted-foreground">
          Shown in the dashboard and on integration scripts. Use kebab-case for
          easy copying.
        </p>
        {errors.name && (
          <p className="text-[11px] text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="ba-baseUrl" className="text-xs font-medium">
          Base URL{" "}
          <span className="font-mono text-[10px] text-muted-foreground">
            optional
          </span>
        </label>
        <Input
          id="ba-baseUrl"
          name="baseUrl"
          value={value.baseUrl}
          onChange={(e) => onChange({ baseUrl: e.target.value })}
          placeholder="https://your-app.example.com"
          type="url"
        />
        <p className="text-[11px] text-muted-foreground">
          Where the chat engine will hit your HTTP routes. You can change this
          later under Settings.
        </p>
        {errors.baseUrl && (
          <p className="text-[11px] text-destructive">{errors.baseUrl}</p>
        )}
      </div>
    </div>
  );
}
