"use client";

import { useState } from "react";
import { Lightning, Copy, Check } from "@phosphor-icons/react";
import { TerminalDemo } from "@/components/landing/TerminalDemo";
import { ChatDemo } from "@/components/landing/ChatDemo";
import { WRAP, DOT_BG } from "@/components/landing/primitives";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AGENT_PROMPT } from "@/lib/agent-prompt";

function CopyPromptButton() {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(AGENT_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }
  return (
    <Button type="button" className="w-fit" onClick={copy} variant="outline">
      {copied ? <Check size={13} /> : <Copy size={13} />}
      <span>{copied ? "Copied!" : "Copy AI setup prompt"}</span>
    </Button>
  );
}

export function Hero() {
  return (
    <section className={cn("py-[72px]", DOT_BG)}>
      <div className={WRAP}>
        <div className="flex flex-col gap-7 mb-12 max-w-[880px]">
          <h1 className="font-mono font-medium text-[clamp(36px,5vw,64px)] leading-[1.02] tracking-[-0.035em] m-0">
            The agent layer your{" "}
            <em
              className="not-italic"
              style={{
                background:
                  "linear-gradient(180deg, transparent 60%, color-mix(in oklch, var(--primary) 25%, transparent) 60%)",
              }}
            >
              SaaS
            </em>{" "}
            is missing.
            <br />
            {/* <span className="text-muted-foreground">
              From zero to AI agent in five minutes.
            </span> */}
          </h1>
          <p className="font-sans text-lg leading-[1.55] text-muted-foreground m-0 max-w-[660px]">
            Point BetterAgent at your codebase. It reads your routes and server
            actions - and now your users get an agent that does real work inside
            the product you already shipped.
          </p>
          <div className="flex items-center gap-2.5 mt-1 flex-wrap">
            <Link href="/auth/sign-up">
              <Button>
                <Lightning size={14} /> Get started — free
              </Button>
            </Link>

            <CopyPromptButton />
          </div>

          <div className="flex gap-4 flex-wrap font-mono text-xs text-muted-foreground">
            {[
              "CLI-driven setup",
              "500 free credits / mo",
              "shadcn-compatible",
              "Next.js",
            ].map((t, i) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                {i > 0 && <span className="text-border">·</span>}
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-[1.05fr_1fr] gap-6 items-stretch">
          <TerminalDemo height={400} />
          <ChatDemo height={400} />
        </div>
      </div>
    </section>
  );
}
