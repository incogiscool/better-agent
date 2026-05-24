"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// ── SSE stream viz ─────────────────────────────────────────────
const SSE_EVENTS = [
  { ts: "+0ms",   k: "agent.start",  v: 'run="run_8a91f3"' },
  { ts: "+184ms", k: "tool.call",    v: '"list_audiences"' },
  { ts: "+302ms", k: "tool.result",  v: "4820 rows" },
  { ts: "+311ms", k: "text.delta",   v: '"Found 4,820…"' },
  { ts: "+412ms", k: "tool.call",    v: '"create_campaign"' },
  { ts: "+824ms", k: "tool.result",  v: "cmp_91a4 · 412ms" },
  { ts: "+922ms", k: "text.delta",   v: '"Drafted…"' },
  { ts: "+950ms", k: "done",         v: 'run="run_8a91f3"' },
];

export function SSEViz() {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let i = 0;
    const tick = () => {
      i = (i + 1) % (SSE_EVENTS.length + 3);
      setN(Math.min(i, SSE_EVENTS.length));
      setTimeout(tick, 480);
    };
    const id = setTimeout(tick, 600);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [n]);

  return (
    <div
      ref={ref}
      className="w-full h-[110px] overflow-y-scroll [scrollbar-width:none] [-ms-overflow-style:none] flex flex-col gap-[3px] rounded-[var(--radius-md)] p-[10px_12px] bg-[oklch(0.145_0_0)] border border-[oklch(1_0_0/10%)] font-mono text-[10.5px] leading-relaxed"
    >
      {SSE_EVENTS.slice(0, n).map((e, i) => (
        <div
          key={i}
          className="flex gap-1.5"
          style={{ animation: i === n - 1 ? "fadeIn 200ms ease-out" : undefined }}
        >
          <span className="text-[oklch(0.50_0_0)] w-[42px] shrink-0">{e.ts}</span>
          <span className="text-[oklch(0.769_0.188_70.08)]">{e.k}</span>
          <span className="text-[oklch(0.985_0_0)] opacity-75">{e.v}</span>
        </div>
      ))}
      {n < SSE_EVENTS.length && (
        <div className="opacity-40 flex gap-1.5">
          <span className="text-[oklch(0.50_0_0)]">…</span>
          <span className="inline-flex items-center gap-[3px] text-primary">
            <span className="thinking-dot" /><span className="thinking-dot" /><span className="thinking-dot" />
          </span>
        </div>
      )}
    </div>
  );
}

// ── Credits gauge ─────────────────────────────────────────────
export function CapsGauge() {
  const limit = 10000;
  const [used, setUsed] = useState(8234);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setUsed((u) => { const next = u + Math.floor(Math.random() * 8) + 2; return next > limit ? 8234 : next; });
    }, 600);
    return () => clearInterval(id);
  }, [paused]);

  const pct = (used / limit) * 100;

  return (
    <div className="w-full flex flex-col gap-2 font-mono text-[11px]">
      <div className="flex justify-between">
        <span>{used.toLocaleString()} <span className="text-muted-foreground">/ {limit.toLocaleString()}</span></span>
        <span className={pct > 80 ? "text-destructive" : "text-muted-foreground"}>{pct.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-[600ms] ease-out"
          style={{
            width: `${Math.min(pct, 100)}%`,
            background: "linear-gradient(90deg, var(--primary), oklch(0.704 0.191 22.216))",
          }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>20 turns / conv</span>
        <button
          onClick={() => setPaused((p) => !p)}
          className="text-[10px] font-mono border border-border bg-background text-foreground px-2 py-px cursor-pointer rounded-[var(--radius-sm)]"
        >
          {paused ? "▶ resume" : "⏸ pause"}
        </button>
      </div>
      <div className="flex gap-2 text-[10px] text-muted-foreground flex-wrap">
        {["80k tokens / conv", "8KB / tool result", "30s route timeout"].map((t) => (
          <span key={t} className="bg-muted border border-border px-1.5 py-px rounded-[var(--radius-sm)]">{t}</span>
        ))}
      </div>
    </div>
  );
}

// ── Model selector ────────────────────────────────────────────
const MODELS = [
  { id: "sonnet", name: "claude-sonnet-4.6", tag: "default", price: "$3 / 1M" },
  { id: "haiku",  name: "claude-haiku-4.5",  tag: "fast",    price: "$0.80" },
  { id: "opus",   name: "claude-opus-4.5",   tag: "smart",   price: "$15" },
];

export function ModelStack() {
  const [sel, setSel] = useState("sonnet");
  return (
    <div className="w-full flex flex-col gap-1 font-mono">
      {MODELS.map((m) => (
        <div
          key={m.id}
          onClick={() => setSel(m.id)}
          className={cn(
            "flex items-center gap-2 p-[8px_10px] text-[11.5px] cursor-pointer rounded-[var(--radius-sm)] border transition-colors",
            sel === m.id
              ? "border-primary bg-primary/6"
              : "border-border bg-background",
          )}
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0 inline-block"
            style={{
              background: sel === m.id ? "var(--primary)" : "var(--border)",
              boxShadow: sel === m.id ? "0 0 0 3px color-mix(in oklch, var(--primary) 25%, transparent)" : undefined,
            }}
          />
          <span className={sel === m.id ? "text-foreground" : "text-muted-foreground"}>{m.name}</span>
          <span className="text-muted-foreground text-[10px]">· {m.tag}</span>
          <span className={cn("ml-auto text-[10px]", sel === m.id ? "text-primary" : "text-muted-foreground")}>{m.price}</span>
        </div>
      ))}
      <div className="mt-0.5 text-[10.5px] text-muted-foreground">BYOK on Enterprise · cache hits at 10%</div>
    </div>
  );
}

// ── Hosted / self-host toggle ─────────────────────────────────
export function HostToggle() {
  const [mode, setMode] = useState<"hosted" | "self">("hosted");
  return (
    <div className="w-full flex flex-col gap-2.5">
      <div className="flex p-[3px] bg-muted border border-border rounded-full w-max">
        {(["hosted", "self"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "px-3.5 py-[5px] rounded-full font-mono text-xs border-0 cursor-pointer flex items-center gap-[5px] transition-colors",
              mode === m ? "bg-background text-foreground" : "bg-transparent text-muted-foreground",
            )}
          >
            {m === "hosted" ? "✦ Hosted" : "⬡ Self-host"}
          </button>
        ))}
      </div>
      <div className="p-[10px_12px] rounded-[var(--radius-md)] bg-[oklch(0.145_0_0)] border border-[oklch(1_0_0/10%)] font-mono text-[11px] leading-[1.7] text-[oklch(0.985_0_0)]">
        {mode === "hosted" ? (
          <>
            <span className="text-[oklch(0.55_0_0)]"># us-east-1 · 99.95% SLA</span><br />
            <span className="text-[oklch(0.769_0.188_70.08)]">BETTERAGENT_KEY</span><span className="text-[oklch(0.55_0_0)]">=</span><span className="text-[oklch(0.78_0.13_145)]">"ba_live_••3F2A"</span><br />
            <span className="text-[oklch(0.55_0_0)]"># tokens billed to your account.</span>
          </>
        ) : (
          <>
            <span className="text-[oklch(0.55_0_0)]"># pull, deploy, point SDK at it</span><br />
            <span className="text-[oklch(0.985_0_0)]">$ docker run betteragent/runtime</span><br />
            <span className="text-[oklch(0.769_0.188_70.08)]">BETTERAGENT_HOST</span><span className="text-[oklch(0.55_0_0)]">=</span><span className="text-[oklch(0.78_0.13_145)]">"https://agent.acme.dev"</span>
          </>
        )}
      </div>
    </div>
  );
}

// ── Framework grid ────────────────────────────────────────────
export function FxGrid() {
  const items = [
    { name: "Next.js", live: true }, { name: "Vue", tag: "beta" }, { name: "Svelte", tag: "beta" },
    { name: "Remix", tag: "soon" },  { name: "Express", tag: "soon" }, { name: "Hono", tag: "soon" },
  ];
  return (
    <div className="w-full grid grid-cols-3 gap-1.5">
      {items.map((it) => (
        <div
          key={it.name}
          className={cn(
            "rounded-[var(--radius-md)] p-[10px_6px] flex flex-col items-center gap-[5px] font-mono text-[11px] border",
            it.live ? "border-primary bg-primary/5" : "border-border bg-background",
          )}
        >
          <span className="font-semibold">{it.name}</span>
          {it.live
            ? <span className="text-[9px] px-[5px] py-px rounded-full bg-[oklch(0.65_0.17_145/14%)] text-[oklch(0.55_0.17_145)]">SHIPPED</span>
            : <span className="text-[9px] text-muted-foreground">{it.tag}</span>
          }
        </div>
      ))}
    </div>
  );
}

// ── Auth flow ─────────────────────────────────────────────────
export function AuthFlow() {
  return (
    <div className="w-full rounded-[var(--radius-md)] p-[12px_14px] bg-[oklch(0.145_0_0)] border border-[oklch(1_0_0/10%)] font-mono text-[oklch(0.985_0_0)] text-[11.5px] leading-[1.7] flex flex-col gap-0.5">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="inline-flex items-center gap-[5px] px-2 py-px rounded-full border text-[10.5px]"
          style={{
            background: "color-mix(in oklch, oklch(0.769 0.188 70.08) 15%, transparent)",
            borderColor: "color-mix(in oklch, oklch(0.769 0.188 70.08) 30%, transparent)",
            color: "oklch(0.769 0.188 70.08)",
          }}
        >
          <span
            className="w-3.5 h-3.5 rounded-full inline-flex items-center justify-center text-white font-semibold"
            style={{ fontSize: 7, background: "linear-gradient(135deg, oklch(0.65 0.17 50), oklch(0.40 0.10 35))" }}
          >AR</span>
          alex@cohort.dev
        </span>
        <span className="text-[oklch(0.50_0_0)] text-[10px]">campaigns:write</span>
      </div>
      <div><span className="text-[oklch(0.769_0.188_70.08)]">const</span> {`{ user } = `}<span className="text-[oklch(0.985_0_0)]">auth()</span></div>
      <div className="text-[oklch(0.50_0_0)] italic text-[10.5px]">{`// agent runs as the signed-in user`}</div>
      <div><span className="text-[oklch(0.985_0_0)]">createCampaign</span><span className="text-[oklch(0.50_0_0)]">{"({ user_id: "}</span><span className="text-[oklch(0.78_0.13_145)]">"u_92ab"</span><span className="text-[oklch(0.50_0_0)]">{"  })"}</span></div>
      <div className="border-t border-dashed border-[oklch(1_0_0/10%)] mt-1.5 pt-1.5 text-[10px] text-[oklch(0.55_0_0)]">
        <span className="text-[oklch(0.769_0.188_70.08)]">✓</span> No service accounts · No scope leaks
      </div>
    </div>
  );
}

// ── Idempotency viz ────────────────────────────────────────────
export function IdempotencyViz() {
  const [dupe, setDupe] = useState(false);

  useEffect(() => {
    const flip = () => { setDupe(true); setTimeout(() => setDupe(false), 1400); };
    const id = setInterval(flip, 3500);
    return () => clearInterval(id);
  }, []);

  const reqs = [
    { key: "req_a3f1", status: "accepted", ms: "12ms" },
    { key: "req_a3f1", status: dupe ? "duplicate" : "...", ms: dupe ? "0ms" : "..." },
    { key: "req_b2c8", status: "accepted", ms: "9ms" },
  ];

  return (
    <div className="w-full flex flex-col gap-[5px] font-mono text-[11px]">
      {reqs.map((r, i) => (
        <div key={i} className="flex items-center gap-2 p-[6px_10px] border border-border bg-background rounded-[var(--radius-sm)]">
          <span className="text-muted-foreground text-[10px]">{r.key}</span>
          <span className="flex-1" />
          <span
            className="text-[10px] px-1.5 py-px rounded-full transition-all duration-200"
            style={{
              background: r.status === "duplicate"
                ? "color-mix(in oklch, oklch(0.55 0.17 230) 12%, transparent)"
                : r.status === "accepted"
                  ? "color-mix(in oklch, oklch(0.65 0.17 145) 12%, transparent)"
                  : "var(--muted)",
              color: r.status === "duplicate"
                ? "oklch(0.55 0.17 230)"
                : r.status === "accepted"
                  ? "oklch(0.55 0.17 145)"
                  : "var(--muted-foreground)",
            }}
          >
            {r.status}
          </span>
          <span className="text-muted-foreground text-[10px] w-7 text-right">{r.ms}</span>
        </div>
      ))}
      <div className="text-[10px] text-muted-foreground mt-0.5">
        Duplicate keys return instantly — no double-billing.
      </div>
    </div>
  );
}

// ── Rate limit viz ─────────────────────────────────────────────
export function RateLimitViz() {
  const [count, setCount] = useState(14);

  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => (c >= 20 ? 0 : c + 1));
    }, 800);
    return () => clearInterval(id);
  }, []);

  const pct = (count / 20) * 100;
  const isHot = count >= 18;

  return (
    <div className="w-full flex flex-col gap-2 font-mono text-[11px]">
      <div className="flex justify-between">
        <span className="text-muted-foreground">u_92ab · /v1/chat</span>
        <span className={isHot ? "text-destructive" : "text-muted-foreground"}>{count}/20 req/min</span>
      </div>
      <div className="h-[5px] bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-[width,background] duration-[800ms]", isHot ? "bg-destructive" : "bg-primary")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="grid grid-cols-2 gap-1.5 text-[10px]">
        <div className="p-[6px_8px] border border-border bg-background rounded-[var(--radius-sm)]">
          <div className="text-muted-foreground mb-0.5">per end-user</div>
          <div className="font-semibold">20 msg / min</div>
        </div>
        <div className="p-[6px_8px] border border-border bg-background rounded-[var(--radius-sm)]">
          <div className="text-muted-foreground mb-0.5">signup guard</div>
          <div className="font-semibold">5 req / 15min</div>
        </div>
      </div>
    </div>
  );
}
