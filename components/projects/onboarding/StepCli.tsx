"use client";

import * as React from "react";
import { CodeBlock } from "@/components/dashboard/common/CodeBlock";

interface StepCliProps {
  secretKey: string;
}

export function StepCli({ secretKey }: StepCliProps) {
  const install = "npm i -D @betteragent/cli";
  const login = `npx betteragent login --key ${secretKey}`;
  const init = "npx betteragent sync";

  return (
    <div className="space-y-5">
      <ol className="space-y-4">
        <li className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[10px] text-muted-foreground">
              01
            </span>
            <h3 className="text-xs font-medium">Install the CLI</h3>
          </div>
          <CodeBlock code={install} language="bash" />
        </li>
        <li className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[10px] text-muted-foreground">
              02
            </span>
            <h3 className="text-xs font-medium">
              Authenticate with your secret key
            </h3>
          </div>
          <CodeBlock code={login} language="bash" />
          <p className="text-[11px] text-muted-foreground">
            Stores the key in your local CLI config. We never read your source
            beyond what is required to infer tool schemas.
          </p>
        </li>
        <li className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[10px] text-muted-foreground">
              03
            </span>
            <h3 className="text-xs font-medium">
              Write your tool files & sync
            </h3>
          </div>
          <CodeBlock code={init} language="bash" />
          <p className="text-[11px] text-muted-foreground">
            Author your `routes.betteragent.ts` and `server-actions.betteragent.ts`
            files using `@betteragent/next` helpers, then run sync. The next
            step will light up automatically once your first sync lands.
          </p>
        </li>
      </ol>
    </div>
  );
}
