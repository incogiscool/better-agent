"use client";

import { useState, useEffect, useRef } from "react";

type ScriptStep =
  | { kind: "user"; text: string; delay: number; speed: number }
  | { kind: "agent"; text: string; delay: number; speed: number }
  | { kind: "think"; text: string; delay: number; speed: number }
  | { kind: "tool"; name: string; args: string; dur: string; delay: number };

const SCRIPT: ScriptStep[] = [
  { kind: "user",  text: "Set up a re-engagement campaign for everyone who hasn't opened in 30 days. 15% off code, send tomorrow 9am.", delay: 400, speed: 14 },
  { kind: "think", text: "Pulling the inactive audience and benchmarking your last re-engagement…", delay: 500, speed: 18 },
  { kind: "tool",  name: "list_audiences",      args: '{ filter: "inactive_30d" }',                      dur: "118ms", delay: 500 },
  { kind: "tool",  name: "get_campaign_metrics", args: '{ tag: "reengagement", period: "90d" }',          dur: "164ms", delay: 350 },
  { kind: "agent", text: "4,820 inactive subscribers. Your last re-engagement hit 18.2% open / 3.4% click — I'll mirror that template and swap in the 15% code.", delay: 350, speed: 14 },
  { kind: "tool",  name: "create_campaign",      args: '{ name: "We miss you — 15% off", segment: "inactive_30d" }', dur: "412ms", delay: 450 },
  { kind: "tool",  name: "schedule_send",        args: '{ campaign_id: "cmp_91a4", at: "2026-05-20T09:00Z" }',        dur: "98ms",  delay: 350 },
  { kind: "tool",  name: "openCampaignEditor",   args: '{ id: "cmp_91a4" }  · client action',              dur: "8ms",   delay: 300 },
  { kind: "agent", text: "Drafted \"We miss you — 15% off\" to 4,820 subscribers, scheduled for tomorrow 9:00 AM. Opened it in the editor — review and ship.", delay: 350, speed: 14 },
];

function useTypewriter(text: string, speed: number, run: boolean) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!run) return;
    setI(0);
    let cancelled = false;
    const tick = (idx: number) => {
      if (cancelled || idx >= text.length) return;
      setI(idx + 1);
      setTimeout(() => tick(idx + 1), speed);
    };
    tick(0);
    return () => { cancelled = true; };
  }, [text, speed, run]);
  return { visible: text.slice(0, i), done: i >= text.length };
}

function LiveMsg({ step }: { step: ScriptStep & { kind: "user" | "agent" } }) {
  const tw = useTypewriter(step.text, step.speed, true);
  return (
    <div className={step.kind === "user" ? "chat-msg-user" : "chat-msg-agent"} style={{ fontFamily: "var(--font-sans)", fontSize: 14, lineHeight: 1.55 }}>
      {tw.visible}{!tw.done && <span className="opacity-50">▌</span>}
    </div>
  );
}

function ThinkMsg({ step }: { step: ScriptStep & { kind: "think" } }) {
  const tw = useTypewriter(step.text, step.speed, true);
  return (
    <div className="inline-flex items-center gap-2 opacity-85 font-sans text-[13px]">
      <span className="inline-flex gap-1 items-center text-primary">
        <span className="thinking-dot" /><span className="thinking-dot" /><span className="thinking-dot" />
      </span>
      <span className="text-muted-foreground italic">{tw.visible}</span>
    </div>
  );
}

export function ChatDemo({ height = 400 }: { height?: number }) {
  const [step, setStep] = useState(0);
  const [key, setKey] = useState(0);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cur = SCRIPT[step];
    if (!cur) {
      const id = setTimeout(() => { setStep(0); setKey((k) => k + 1); }, 5000);
      return () => clearTimeout(id);
    }
    if (cur.kind === "tool") {
      const id = setTimeout(() => setStep((s) => s + 1), cur.delay + 700);
      return () => clearTimeout(id);
    }
    const dur = cur.delay + cur.speed * cur.text.length + 400;
    const id = setTimeout(() => setStep((s) => s + 1), dur);
    return () => clearTimeout(id);
  }, [step, key]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [step]);

  return (
    <div key={key} className="flex flex-col overflow-hidden rounded-xl bg-card border border-border shadow-md">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-3 text-xs text-muted-foreground">
        <span
          className="inline-flex items-center justify-center w-[22px] h-[22px] text-[10px] font-semibold text-white rounded"
          style={{ background: "linear-gradient(135deg, var(--primary), oklch(0.40 0.10 35))" }}
        >CO</span>
        <span className="text-foreground font-medium text-[13px] font-mono">cohort · campaigns assistant</span>
        <span
          className="ml-auto inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-mono"
          style={{
            background: "color-mix(in oklch, oklch(0.65 0.17 145) 12%, transparent)",
            border: "1px solid color-mix(in oklch, oklch(0.65 0.17 145) 30%, transparent)",
            color: "oklch(0.55 0.17 145)",
          }}
        >
          <span className="inline-block h-1 w-1 rounded-full bg-current" />
          live
        </span>
      </div>

      {/* Body */}
      <div
        ref={bodyRef}
        className="flex flex-col gap-2.5 p-[18px] overflow-y-scroll [scrollbar-width:none] [-ms-overflow-style:none]"
        style={{ height }}
      >
        {SCRIPT.slice(0, step).map((s, i) => {
          if (s.kind === "tool") return (
            <div key={i} className="inline-flex items-center gap-2 rounded border border-dashed border-border px-3 py-1.5 self-start font-mono text-[11.5px] text-muted-foreground">
              <span className="text-primary">→</span>
              <b className="text-foreground font-medium">{s.name}</b>
              <span>{s.args}</span>
              <span className="ml-auto pl-2.5 text-[oklch(0.55_0.17_145)]">✓ {s.dur}</span>
            </div>
          );
          if (s.kind === "user") return <div key={i} className="chat-msg-user font-sans text-sm leading-[1.55]">{s.text}</div>;
          if (s.kind === "think") return <div key={i} className="opacity-85 text-muted-foreground italic text-[13px] font-sans">{s.text}</div>;
          return <div key={i} className="chat-msg-agent font-sans text-sm leading-[1.55]">{s.text}</div>;
        })}

        {step < SCRIPT.length && (() => {
          const cur = SCRIPT[step]!;
          if (cur.kind === "user") return <LiveMsg step={cur} />;
          if (cur.kind === "agent") return <LiveMsg step={cur} />;
          if (cur.kind === "think") return <ThinkMsg step={cur} />;
          if (cur.kind === "tool") return (
            <div
              className="inline-flex items-center gap-2 rounded border border-dashed border-border px-3 py-1.5 self-start font-mono text-[11.5px] text-muted-foreground"
              style={{ animation: "fadeIn 240ms ease-out" }}
            >
              <span className="text-primary">→</span>
              <b className="text-foreground font-medium">{cur.name}</b>
              <span>{cur.args}</span>
              <span className="ml-auto pl-2.5 inline-flex items-center gap-1 text-primary">
                <span className="thinking-dot" /><span className="thinking-dot" /><span className="thinking-dot" />
              </span>
            </div>
          );
          return null;
        })()}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-border px-3 py-2.5 bg-background">
        <input
          readOnly
          placeholder="Ask the agent…"
          className="flex-1 bg-transparent outline-none border-0 font-sans text-sm text-foreground"
        />
        <button className="inline-flex items-center justify-center rounded w-7 h-7 bg-primary text-primary-foreground border-0 cursor-pointer">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4 20-7z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
