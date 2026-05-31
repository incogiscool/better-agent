"use client";

import { useState } from "react";
import { Check, ArrowUpRight } from "@phosphor-icons/react";
import { Eyebrow, WRAP, SEC, SECHEAD, H2, SUB } from "@/components/landing/primitives";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

const TOOL_TYPES = [
  {
    id: "server-action",
    label: "Server Action",
    file: "server-actions.betteragent.ts",
    pill: "ACTION",
    pillStyle: {
      background: "color-mix(in oklch, oklch(0.55 0.16 49) 14%, transparent)",
      color: "oklch(0.50 0.16 49)",
    },
    blurb:
      "Wrap an existing Next.js Server Action — the SDK dispatches the call so session and revalidation work as normal.",
    code: `<span style="color:oklch(0.769 0.188 70.08)">import</span> { defineServerAction } <span style="color:oklch(0.769 0.188 70.08)">from</span> <span style="color:oklch(0.78 0.13 145)">"betteragent-next"</span>;
<span style="color:oklch(0.769 0.188 70.08)">import</span> { createCampaign } <span style="color:oklch(0.769 0.188 70.08)">from</span> <span style="color:oklch(0.78 0.13 145)">"@/app/actions"</span>;

<span style="color:oklch(0.769 0.188 70.08)">export const</span> <span style="color:oklch(0.985 0 0)">serverActions</span> = [
  defineServerAction({
    name: <span style="color:oklch(0.78 0.13 145)">"createCampaign"</span>,
    description: <span style="color:oklch(0.78 0.13 145)">"Draft a re-engagement campaign."</span>,
    schema: z.object({ audienceId: z.string() }),
    handler: createCampaign,
  }),
];`,
    checks: [
      "Forwards your end-user bearer token to your APIs.",
      "Hard caps & observability included.",
    ],
  },
  {
    id: "route",
    label: "API Route",
    file: "routes.betteragent.ts",
    pill: "GET",
    pillStyle: {
      background: "color-mix(in oklch, oklch(0.65 0.17 230) 14%, transparent)",
      color: "oklch(0.55 0.17 230)",
    },
    blurb:
      "Point at any HTTP endpoint — the agent makes a server-to-server call with your end-user's bearer token.",
    code: `<span style="color:oklch(0.769 0.188 70.08)">import</span> { defineRoute } <span style="color:oklch(0.769 0.188 70.08)">from</span> <span style="color:oklch(0.78 0.13 145)">"betteragent-next"</span>;

<span style="color:oklch(0.769 0.188 70.08)">export const</span> <span style="color:oklch(0.985 0 0)">listAudiences</span> = defineRoute({
  name: <span style="color:oklch(0.78 0.13 145)">"listAudiences"</span>,
  method: <span style="color:oklch(0.78 0.13 145)">"GET"</span>,
  path: <span style="color:oklch(0.78 0.13 145)">"/api/audiences"</span>,
  description: <span style="color:oklch(0.78 0.13 145)">"List the current user's audiences."</span>,
  schema: z.object({ q: z.string().optional() }),
});

<span style="color:oklch(0.769 0.188 70.08)">export const</span> <span style="color:oklch(0.985 0 0)">routes</span> = [listAudiences];`,
    checks: [
      "Server-to-server; agent hits your real API.",
      "Auth forwarded via Authorization: Bearer.",
      "30s timeout, 8KB result truncation.",
    ],
  },
  {
    id: "client",
    label: "Client Action",
    file: "actions.betteragent.ts",
    pill: "CLIENT",
    pillStyle: {
      background: "color-mix(in oklch, oklch(0.65 0.17 145) 14%, transparent)",
      color: "oklch(0.50 0.17 145)",
    },
    blurb:
      "Side effects in the browser — open a drawer, navigate, refresh — without a server round-trip.",
    code: `<span style="color:oklch(0.769 0.188 70.08)">import</span> { defineAction } <span style="color:oklch(0.769 0.188 70.08)">from</span> <span style="color:oklch(0.78 0.13 145)">"betteragent-next"</span>;

<span style="color:oklch(0.769 0.188 70.08)">export const</span> <span style="color:oklch(0.985 0 0)">actions</span> = [
  defineAction({
    name: <span style="color:oklch(0.78 0.13 145)">"openCampaignEditor"</span>,
    description: <span style="color:oklch(0.78 0.13 145)">"Open a campaign in the editor."</span>,
    schema: z.object({ id: z.string() }),
  }),
];`,
    checks: [
      "Runs in the browser — no server round-trip.",
      "Stream-then-resume: action fires, agent waits.",
      "Dispatch via BetterAgentProvider actions map.",
    ],
  },
];

export function ToolTypes() {
  const [tab, setTab] = useState("server-action");
  const active = TOOL_TYPES.find((t) => t.id === tab)!;
  return (
    <section className={SEC}>
      <div className={WRAP}>
        <div className={SECHEAD}>
          <Eyebrow>Three primitives</Eyebrow>
          <h2 className={H2}>
            Routes, server actions, client actions.{" "}
            <span className="text-muted-foreground">Same protocol.</span>
          </h2>
          <p className={SUB}>
            Three primitives in your code; two messages on the wire. The agent{" "}
            <em>reads</em> data through routes, <em>mutates</em> through server
            actions, and <em>steers the UI</em> through client actions.
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="flex items-stretch border-b border-border bg-muted/50">
            {TOOL_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "px-5 py-3.5 border-0 border-r border-border font-mono text-[13px] font-medium cursor-pointer flex items-center gap-2.5 transition-colors",
                  t.id === tab
                    ? "bg-card text-foreground -mb-px border-b border-b-card"
                    : "bg-transparent text-muted-foreground",
                )}
              >
                <span
                  className="inline-flex items-center h-[18px] px-[7px] rounded text-[10px] font-semibold tracking-[0.04em]"
                  style={t.pillStyle}
                >
                  {t.pill}
                </span>
                {t.label}
              </button>
            ))}
            <span className="flex-1" />
            <span className="flex items-center px-4 text-muted-foreground font-mono text-[11px]">
              {active.file}
            </span>
          </div>
          <div className="grid grid-cols-[1.4fr_1fr]">
            <pre
              className="bg-[oklch(0.145_0_0)] border-r border-border p-[22px_26px] min-h-[280px] text-[13px] leading-[1.7] font-mono text-[oklch(0.985_0_0)] m-0 overflow-x-auto whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: active.code }}
            />
            <div className="p-7 flex flex-col gap-5">
              <h3 className="font-mono font-medium text-lg tracking-[-0.01em] m-0">
                {active.label}
              </h3>
              <p className="font-sans text-sm leading-[1.55] text-muted-foreground m-0">
                {active.blurb}
              </p>
              <div className="flex flex-col gap-2.5">
                {active.checks.map((c) => (
                  <div key={c} className="flex items-start gap-2">
                    <span className="text-[oklch(0.55_0.17_145)] shrink-0">
                      <Check size={13} />
                    </span>
                    <span className="font-mono text-[12.5px]">{c}</span>
                  </div>
                ))}
              </div>
              <Button asChild variant="outline" className="self-start mt-1">
                <Link href="/docs">Read the docs <ArrowUpRight size={11} /></Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
