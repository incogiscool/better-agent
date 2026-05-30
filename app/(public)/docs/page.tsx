"use client";

import Link from "next/link";
import { ArrowUpRight, Lightning, Package, Terminal, Wrench, Robot } from "@phosphor-icons/react";
import { CtaSection } from "@/components/landing/CtaSection";
import { Eyebrow, WRAP, SEC, SECHEAD, H2, SUB } from "@/components/landing/primitives";
import { cn } from "@/lib/utils";

const DOC_CARDS = [
  {
    title: "Quickstart",
    desc: "Zero to working agent in eight steps. Create a project, install the CLI, scaffold components, define tools, wire up the provider, and render the UI.",
    href: "/docs/quickstart",
    Icon: Lightning,
  },
  {
    title: "Tool Files",
    desc: "Reference for routes.betteragent.ts, server-actions.betteragent.ts, and actions.betteragent.ts — the files that teach your agent what it can do.",
    href: "/docs/tools",
    Icon: Wrench,
  },
  {
    title: "CLI Reference",
    desc: "Eight commands covering auth, component installation, tool discovery, and sync. Full flag reference with examples.",
    href: "/cli",
    Icon: Terminal,
  },
  {
    title: "Components",
    desc: "Shadcn-style registry of agent UI — sidebar, chat-popup, cmd-k, inline-bar. Install one and own the code.",
    href: "/components",
    Icon: Package,
  },
] as const;

export default function DocsPage() {
  return (
    <>
      <DocsHero />
      <AgentSetupCallout />
      <DocCards />
      <CtaSection />
    </>
  );
}

function DocsHero() {
  return (
    <section className="pt-24 pb-16 border-b border-border">
      <div className={cn(WRAP, "max-w-[760px]")}>
        <div className="flex flex-col gap-5">
          <Eyebrow>Documentation</Eyebrow>
          <h1 className="font-mono font-medium text-[56px] leading-[1.04] tracking-[-0.03em] m-0">
            Everything you need<br />to ship your agent.
          </h1>
          <p className={SUB}>
            Quickstart, CLI reference, tool file schema, and component registry.
            Plus an AI setup prompt you can paste straight into Claude Code or Cursor.
          </p>
        </div>
      </div>
    </section>
  );
}

function AgentSetupCallout() {
  return (
    <section className="py-10 border-b border-border">
      <div className={WRAP}>
        <Link
          href="/docs/agent"
          className="flex items-start gap-5 p-6 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors group"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary text-primary-foreground shrink-0 mt-0.5">
            <Robot size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono font-semibold text-[15px]">AI Setup Prompt</span>
              <span className="font-mono text-[10px] tracking-[0.06em] uppercase text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-sm">
                New
              </span>
            </div>
            <p className="font-sans text-[13px] text-muted-foreground leading-[1.55] m-0">
              Copy one prompt into Claude Code, Cursor, or any AI IDE and your coding assistant
              sets up BetterAgent automatically — installs packages, authenticates, discovers tools,
              and wires up the provider.
            </p>
          </div>
          <ArrowUpRight size={16} className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0 mt-1" />
        </Link>
      </div>
    </section>
  );
}

function DocCards() {
  return (
    <section className={SEC}>
      <div className={WRAP}>
        <div className={SECHEAD}>
          <Eyebrow>Reference</Eyebrow>
          <h2 className={H2}>Four sections. Full coverage.</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {DOC_CARDS.map(({ title, desc, href, Icon }) => (
            <Link
              key={title}
              href={href}
              className="flex flex-col gap-3 p-6 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-md border border-border bg-muted shrink-0">
                  <Icon size={15} className="text-foreground" />
                </div>
                <span className="font-mono font-semibold text-[14px]">{title}</span>
                <ArrowUpRight
                  size={14}
                  className="text-muted-foreground group-hover:text-foreground transition-colors ml-auto shrink-0"
                />
              </div>
              <p className="font-sans text-[13px] text-muted-foreground leading-[1.55] m-0">{desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
