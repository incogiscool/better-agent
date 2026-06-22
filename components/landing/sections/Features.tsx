"use client";

import { Pulse, Sparkle, Lock } from "@phosphor-icons/react";
import {
  SSEViz,
  ModelStack,
  FxGrid,
  AuthFlow,
  RateLimitViz,
} from "@/components/landing/BentoTiles";
import { Eyebrow, GithubIcon, WRAP, SEC, SECHEAD, H2, SUB } from "@/components/landing/primitives";
import { cn } from "@/lib/utils";

function BentoTile({
  title,
  sub,
  icon,
  children,
}: {
  title: string;
  sub: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-[var(--radius-xl)] p-5 flex flex-col gap-2.5 overflow-hidden">
      <div className="flex items-center gap-2">
        <span className="text-primary inline-flex">{icon}</span>
        <h3 className="font-mono font-medium text-[15px] tracking-[-0.01em] m-0">
          {title}
        </h3>
      </div>
      <p className="font-sans text-[13px] leading-relaxed text-muted-foreground m-0">
        {sub}
      </p>
      <div className="flex-1 flex items-stretch">{children}</div>
    </div>
  );
}

const OBSERVABLE_METRICS: [string, string, boolean][] = [
  ["p50 latency", "1.84s", false],
  ["p95 latency", "4.8s", false],
  ["error rate", "0.42%", true],
];

const BENTO_ITEMS = [
  {
    title: "Auth that's already there",
    sub: "Forwards your end-user's bearer token to your APIs. No service accounts, no scope leaks.",
    icon: <Lock size={14} />,
    content: <AuthFlow />,
  },
  {
    title: "Native SSE streaming",
    sub: "Tool calls fire mid-stream. No polling, no batching.",
    icon: <Pulse size={14} />,
    content: <SSEViz />,
  },
  {
    title: "Claude Sonnet 4.6",
    sub: "Default model. Hosted with cache hits at 10% of normal token cost.",
    icon: <Sparkle size={14} />,
    content: <ModelStack />,
  },
  {
    title: "Observable by default",
    sub: "Every run, every token, every tool call logged and queryable.",
    icon: <Pulse size={14} />,
    content: (
      <div className="w-full flex flex-col gap-1.5">
        {OBSERVABLE_METRICS.map(([k, v, ok]) => (
          <div key={k} className="flex justify-between font-mono text-[11px]">
            <span className="text-muted-foreground">{k}</span>
            <span
              className={cn(
                "font-semibold",
                ok ? "text-[oklch(0.55_0.17_145)]" : "text-foreground",
              )}
            >
              {v}
            </span>
          </div>
        ))}
        <div className="h-1 bg-muted rounded-full overflow-hidden mt-1">
          <div
            className="h-full bg-primary/40 rounded-full w-2/5"
            style={{ animation: "sweep 3s linear infinite" }}
          />
        </div>
      </div>
    ),
  },
  {
    title: "Framework agnostic",
    sub: "Next.js today. Same protocol, different adapter for every other stack.",
    icon: <GithubIcon size={14} />,
    content: <FxGrid />,
  },
  {
    title: "Rate limiting built in",
    sub: "Per-project and per-IP limits enforced before requests hit your tools.",
    icon: <Lock size={14} />,
    content: <RateLimitViz />,
  },
];

export function Features() {
  return (
    <section className={SEC}>
      <div className={WRAP}>
        <div className={SECHEAD}>
          <Eyebrow>Built for production</Eyebrow>
          <h2 className={H2}>Boring infrastructure for an exciting layer.</h2>
          <p className={SUB}>
            Streaming, observability, billing, auth, rate-limits, evals. The
            unsexy stuff that decides whether your agent ships.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {BENTO_ITEMS.map((item) => (
            <BentoTile
              key={item.title}
              title={item.title}
              sub={item.sub}
              icon={item.icon}
            >
              {item.content}
            </BentoTile>
          ))}
        </div>
      </div>
    </section>
  );
}
