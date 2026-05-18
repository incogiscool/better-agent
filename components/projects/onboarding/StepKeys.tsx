"use client";

import * as React from "react";
import { SecretReveal } from "@/components/dashboard/common/SecretReveal";
import { CodeBlock } from "@/components/dashboard/common/CodeBlock";

interface StepKeysProps {
  clientKey: string;
  secretKey: string;
  acknowledged: boolean;
  onAcknowledge: (value: boolean) => void;
}

export function StepKeys({
  clientKey,
  secretKey,
  acknowledged,
  onAcknowledge,
}: StepKeysProps) {
  return (
    <div className="space-y-5">
      <div className="border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-[11px] text-amber-700 dark:text-amber-400">
        Save the secret key now. It cannot be retrieved again — you would need
        to regenerate it from Settings.
      </div>

      <CodeBlock label="Client key (public)" code={clientKey} />

      <SecretReveal
        value={secretKey}
        label="Secret key (write down once)"
        hint="server-side only"
        defaultHidden={false}
      />

      <label className="flex cursor-pointer items-start gap-2 border border-border p-3 text-xs">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(e) => onAcknowledge(e.target.checked)}
          className="mt-0.5 size-3.5 rounded-none border border-input accent-primary"
        />
        <span>
          I&apos;ve saved the secret key in a safe place (password manager,
          .env.local, secret manager). I understand it will not be shown again.
        </span>
      </label>
    </div>
  );
}
