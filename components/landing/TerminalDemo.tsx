"use client";

import { useState, useEffect, useRef } from "react";

type Line = { html: string; hold: number };

const LINES: Line[] = [
  { html: `<span class="t-prompt">$</span> <span class="t-fg">betteragent</span> <span class="t-ok">discover</span>`, hold: 600 },
  { html: `<span class="t-dim"># scanning project for tool candidates…</span>`, hold: 500 },
  { html: `&nbsp;&nbsp;<span class="t-ok">✓</span> next.js 16 · app router · typescript`, hold: 200 },
  { html: `&nbsp;&nbsp;<span class="t-ok">✓</span> found <span class="t-fg">11</span> routes in <span class="t-file">app/api/</span>`, hold: 200 },
  { html: `&nbsp;&nbsp;<span class="t-ok">✓</span> found <span class="t-fg">9</span> server actions in <span class="t-file">app/actions.ts</span>`, hold: 200 },
  { html: `&nbsp;`, hold: 200 },
  { html: `<span class="t-dim">? Which tools should be available to the agent?</span>`, hold: 400 },
  { html: `&nbsp;&nbsp;<span class="t-ok">✓</span> <span class="t-fg">list_audiences</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="t-dim">app/api/audiences/route.ts</span>`, hold: 80 },
  { html: `&nbsp;&nbsp;<span class="t-ok">✓</span> <span class="t-fg">create_campaign</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="t-dim">app/actions.ts:24</span>`, hold: 80 },
  { html: `&nbsp;&nbsp;<span class="t-ok">✓</span> <span class="t-fg">schedule_send</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="t-dim">app/actions.ts:67</span>`, hold: 80 },
  { html: `&nbsp;&nbsp;<span class="t-ok">✓</span> <span class="t-fg">get_campaign_metrics</span> <span class="t-dim">app/api/campaigns/[id]/metrics/route.ts</span>`, hold: 80 },
  { html: `&nbsp;&nbsp;<span class="t-dim">+ 8 more selected</span>`, hold: 400 },
  { html: `&nbsp;`, hold: 200 },
  { html: `<span class="t-dim"># inferring schemas from typescript types…</span>`, hold: 350 },
  { html: `<span class="t-dim"># generating descriptions via claude-sonnet-4.6…</span>`, hold: 600 },
  { html: `&nbsp;&nbsp;<span class="t-ok">✓</span> wrote <span class="t-file">server-actions.betteragent.ts</span>`, hold: 200 },
  { html: `&nbsp;&nbsp;<span class="t-ok">✓</span> wrote <span class="t-file">routes.betteragent.ts</span>`, hold: 200 },
  { html: `&nbsp;&nbsp;<span class="t-ok">✓</span> synced 12 tools to <span class="t-fg">cohort-prod</span>`, hold: 350 },
  { html: `&nbsp;`, hold: 200 },
  { html: `<span class="t-dim"># your app has an agent. open <span class="t-file">localhost:3000</span> to chat.</span>`, hold: 1400 },
];

export function TerminalDemo({ height = 380 }: { height?: number }) {
  const [revealed, setRevealed] = useState(0);
  const [tick, setTick] = useState(0);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (revealed >= LINES.length) {
      const id = setTimeout(() => { setRevealed(0); setTick((t) => t + 1); }, 3000);
      return () => clearTimeout(id);
    }
    const line = LINES[revealed];
    if (!line) return;
    const id = setTimeout(() => setRevealed((r) => r + 1), line.hold);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [revealed]);

  return (
    <div
      key={tick}
      className="flex flex-col overflow-hidden rounded-xl bg-[oklch(0.145_0_0)] border border-[oklch(1_0_0/10%)] font-mono text-[13px] leading-[1.7]"
    >
      <div className="flex items-center gap-2.5 border-b border-[oklch(1_0_0/10%)] px-4 py-3 text-[11px] text-[oklch(0.65_0_0)]">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="inline-block w-[9px] h-[9px] rounded-full bg-[oklch(1_0_0/15%)]" />
          ))}
        </div>
        <span className="ml-2">~/cohort-app · zsh</span>
        <span className="ml-auto flex items-center gap-1.5">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{
              background: "oklch(0.769 0.188 70.08)",
              boxShadow: "0 0 0 3px color-mix(in oklch, oklch(0.769 0.188 70.08) 30%, transparent)",
              animation: "tPulse 1.4s ease-out infinite",
            }}
          />
          running
        </span>
      </div>
      <div
        ref={bodyRef}
        className="overflow-y-scroll [scrollbar-width:none] [-ms-overflow-style:none] p-[18px_22px] text-[oklch(0.985_0_0)]"
        style={{ height }}
      >
        {LINES.slice(0, revealed).map((l, i) => (
          <div key={i} dangerouslySetInnerHTML={{ __html: l.html }} />
        ))}
        {revealed < LINES.length && <div><span className="t-caret" /></div>}
      </div>
    </div>
  );
}
