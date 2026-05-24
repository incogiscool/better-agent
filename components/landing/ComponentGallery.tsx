"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { defaultBtn } from "./primitives";

export const COMPS = [
  { id: "drawer",   name: "chat-drawer",    desc: "Right-side drawer + floating trigger. Drop it anywhere in your layout.",           cmd: "betteragent add sidebar"     },
  { id: "sidebar",  name: "chat-sidebar",   desc: "Persistent panel inside a split layout. Survives navigation.",                    cmd: "betteragent add sidebar"     },
  { id: "floating", name: "chat-floating",  desc: "Small bubble that expands into a full conversation. Great for marketing pages.",  cmd: "betteragent add chat-popup"  },
  { id: "inline",   name: "chat-inline",    desc: "Embedded in your page like a comment thread. No portal, no modal.",               cmd: "betteragent add inline-bar"  },
  { id: "cmdk",     name: "chat-cmdk",      desc: "Command-bar interface. Press ⌘K, type a question, ship work.",                   cmd: "betteragent add command-bar" },
  { id: "fullpage", name: "chat-full-page", desc: "Standalone page — like Anthropic's, but inside your product.",                    cmd: "betteragent add sidebar"     },
] as const;

// ── Mini preview building blocks ──────────────────────────────

export function MiniChat({ slim }: { slim?: boolean }) {
  return (
    <div className="flex flex-col flex-1 overflow-hidden text-[9.5px] font-mono bg-card">
      <div className="flex items-center gap-[5px] px-2 py-[5px] border-b border-border text-[8.5px] text-muted-foreground">
        <span
          className="w-[11px] h-[11px] rounded-[3px] inline-flex items-center justify-center text-white font-semibold"
          style={{ fontSize: "6.5px", background: "linear-gradient(135deg, var(--primary), oklch(0.40 0.10 35))" }}
        >CO</span>
        <span className="text-foreground">cohort</span>
      </div>
      <div className="flex-1 p-2 flex flex-col gap-[5px] font-sans overflow-hidden">
        <div className="self-end max-w-[80%] px-[7px] py-1 rounded-[6px_6px_2px_6px] bg-primary text-primary-foreground text-[9.5px]">
          Launch re-engagement campaign.
        </div>
        <div className="self-start inline-flex items-center gap-[5px] px-1.5 py-0.5 border border-dashed border-border rounded font-mono text-[8.5px] text-muted-foreground">
          <span className="text-primary">→</span>
          <b className="text-foreground font-medium">create_campaign</b>
        </div>
        {!slim && (
          <div className="self-start max-w-[90%] px-[7px] py-1 rounded-[6px_6px_6px_2px] bg-muted text-foreground text-[9.5px] border border-border">
            Drafted for 4,820 subscribers.
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 px-[7px] py-[5px] border-t border-border bg-background text-muted-foreground text-[9px]">
        <span className="flex-1">Ask…</span>
        <span className="w-[13px] h-[13px] rounded-[3px] bg-primary text-primary-foreground inline-flex items-center justify-center">→</span>
      </div>
    </div>
  );
}

export function SkelApp({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-background flex flex-col gap-1 p-1.5 h-full">
      <div className="h-1 bg-muted rounded-[1px]" />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-1 bg-muted rounded-[1px]"
          style={{ width: i % 3 === 2 ? "60%" : i % 2 === 0 ? "100%" : "80%" }}
        />
      ))}
      <div className="flex-1" />
      <div className="h-[22px] bg-card border border-border rounded-[2px]" />
    </div>
  );
}

export function CompPreview({ id }: { id: string }) {
  if (id === "sidebar") return (
    <div className="absolute inset-0 grid grid-cols-[1fr_150px]">
      <SkelApp rows={6} /><MiniChat />
    </div>
  );
  if (id === "drawer") return (
    <div className="absolute inset-0">
      <SkelApp rows={6} />
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded bg-primary text-primary-foreground flex items-center justify-center text-[9px] font-mono shadow-lg">›</div>
      <div className="absolute right-0 top-0 bottom-0 w-[120px] bg-card border-l border-border flex flex-col overflow-hidden">
        <MiniChat slim />
      </div>
    </div>
  );
  if (id === "floating") return (
    <div className="absolute inset-0">
      <SkelApp rows={7} />
      <div className="absolute right-3.5 bottom-3.5 w-[180px] h-[156px] bg-card border border-border rounded-xl shadow-lg flex flex-col overflow-hidden">
        <MiniChat />
      </div>
    </div>
  );
  if (id === "inline") return (
    <div className="absolute inset-0 p-3 flex flex-col gap-2 bg-background">
      <div className="h-1 bg-muted rounded-[1px] w-[60%]" />
      <div className="h-1 bg-muted rounded-[1px] w-[85%]" />
      <div className="border border-border rounded-lg flex flex-col overflow-hidden flex-1"><MiniChat /></div>
      <div className="h-1 bg-muted rounded-[1px] w-[70%]" />
    </div>
  );
  if (id === "cmdk") return (
    <div className="absolute inset-0 bg-foreground/8 flex items-center justify-center p-4">
      <div className="w-[90%] bg-card border border-border rounded-[10px] overflow-hidden font-mono">
        <div className="flex items-center gap-1.5 px-2.5 py-2 border-b border-border text-[11px] text-foreground">
          launch campaign for inactive 30d
          <span className="flex-1" />
          <span className="text-[8px] px-1 border border-border rounded bg-muted text-muted-foreground">⌘K</span>
        </div>
        <div className="p-1.5 flex flex-col gap-0.5 text-[10.5px]">
          {([["Run agent on selection", "↩", true], ["Open recent run", "↗", false], ["Tools · 4", "→", false]] as [string, string, boolean][]).map(([txt, kbd, active], i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 px-2 py-[5px] rounded"
              style={{ background: active ? "var(--accent)" : "transparent", color: active ? "var(--foreground)" : "var(--muted-foreground)" }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: active ? "var(--primary)" : "var(--border)" }} />
              <span>{txt}</span>
              <span className="flex-1" />
              <span className="text-[8px]">{kbd}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  return (
    <div className="absolute inset-0 bg-background flex flex-col p-3.5 gap-2">
      <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-[9px]">
        <div className="w-2 h-2 rounded-[2px] bg-primary" />
        <span>cohort / campaigns</span>
      </div>
      <MiniChat slim />
    </div>
  );
}

// ── Gallery grid ──────────────────────────────────────────────

export function ComponentGallery({ showCta = false }: { showCta?: boolean }) {
  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        {COMPS.map((c) => (
          <div key={c.id} className="border border-border rounded-lg bg-card overflow-hidden flex flex-col">
            <div className="h-[220px] bg-muted/50 border-b border-border relative overflow-hidden">
              <CompPreview id={c.id} />
            </div>
            <div className="px-4 py-3.5 flex flex-col gap-1.5">
              <span className="font-mono text-[13px] font-medium text-primary">{c.name}</span>
              <span className="font-sans text-xs text-muted-foreground leading-relaxed">{c.desc}</span>
              <span className="font-mono text-[10.5px] text-muted-foreground pt-1">npx {c.cmd}</span>
            </div>
          </div>
        ))}
      </div>
      {showCta && (
        <div className="flex justify-center mt-7">
          <a href="/components" className={defaultBtn}>
            Browse the full registry <ArrowRight size={12} />
          </a>
        </div>
      )}
    </>
  );
}
