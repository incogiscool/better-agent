"use client";

import { Lightning, Sparkle, ArrowUpRight } from "@phosphor-icons/react";
import { Pill, DOT_BG } from "./primitives";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function CtaSection() {
  return (
    <section className={cn("py-24", DOT_BG)}>
      <div className="max-w-[920px] mx-auto px-10 text-center">
        <div className="flex flex-col gap-5 items-center">
          <Pill primary>
            <Sparkle size={11} /> 5 minutes to a working agent
          </Pill>
          <h2 className="font-mono font-medium text-[56px] leading-[1.02] tracking-[-0.035em] m-0">
            Stop describing what your app does.
            <br />
            <span className="text-muted-foreground">Let it do the work.</span>
          </h2>
          <p className="font-sans text-lg leading-[1.55] text-muted-foreground m-0 max-w-[540px]">
            Free forever for prototypes. Plug in your routes, drop in the
            components, ship a real agent before lunch.
          </p>
          <div className="flex gap-2.5 mt-3 flex-wrap justify-center">
            <Button asChild size="lg">
              <Link href="/auth/sign-up"><Lightning size={14} /> Get started — free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/docs/quickstart">Read the quickstart <ArrowUpRight size={12} /></Link>
            </Button>
          </div>
          <div className="flex gap-4 flex-wrap justify-center font-mono text-xs text-muted-foreground mt-2">
            {["No credit card", "500 free credits", "Open source SDKs"].map((t, i) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                {i > 0 && <span className="text-border">·</span>}
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
