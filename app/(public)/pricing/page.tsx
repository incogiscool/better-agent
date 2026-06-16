"use client";

import { useState, useEffect } from "react";
import { Plus } from "@phosphor-icons/react";
import posthog from "posthog-js";
import { PricingCards } from "@/components/landing/PricingCards";
import { PricingComparison } from "@/components/landing/PricingComparison";
import { CtaSection } from "@/components/landing/CtaSection";
import {
  Eyebrow,
  WRAP,
  SEC,
  SECHEAD,
  H2,
  SUB,
} from "@/components/landing/primitives";
import { cn } from "@/lib/utils";

const CREDIT_EVENTS = [
  {
    event: "Conversation start",
    credits: 2,
    note: "once per new conversation",
  },
  { event: "Per message", credits: 1, note: "each user turn" },
  {
    event: "Per tool call",
    credits: 3,
    note: "routes + server/client actions",
  },
] as const;

const FAQ_ITEMS = [
  {
    q: "What happens when I hit the free limit?",
    a: "Your project is hard-capped at 500 credits. The chat endpoint returns a clear error and no further billing occurs. Wait for your next monthly reset, or upgrade to Starter.",
  },
  {
    q: "When does Plus launch?",
    a: "Plus is on the waitlist while we finish billing. Join from the pricing card above and we'll email you when it's ready.",
  },
  {
    q: "Do unused credits roll over?",
    a: "No — credits reset at the start of each 30-day billing period.",
  },
  {
    q: "Are token costs hidden from me?",
    a: "Yes. You pay a flat rate per event (conversation start, message, tool call). Token usage is included in the credit price on Free and Starter.",
  },
];

export default function PricingPage() {
  useEffect(() => {
    posthog.capture("pricing_page_viewed");
  }, []);

  return (
    <>
      <PricingHero />
      <PlansSection />
      <CreditExplainer />
      <ComparisonSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}

function PricingHero() {
  return (
    <section className="pt-24 pb-16 border-b border-border">
      <div className={cn(WRAP, "max-w-[760px]")}>
        <div className="flex flex-col gap-5">
          <Eyebrow>Pricing</Eyebrow>
          <h1 className="font-mono font-medium text-[56px] leading-[1.04] tracking-[-0.03em] m-0">
            Free until your agent
            <br />
            earns its keep.
          </h1>
          <p className={SUB}>
            500 credits a month, free — no card required. Paid plans start at
            $0.99/mo when you need more room.
          </p>
        </div>
      </div>
    </section>
  );
}

function PlansSection() {
  return (
    <section className={SEC}>
      <div className={WRAP}>
        <PricingCards />
      </div>
    </section>
  );
}

function CreditExplainer() {
  return (
    <section className={SEC}>
      <div className={WRAP}>
        <div className={SECHEAD}>
          <Eyebrow>How credits work</Eyebrow>
          <h2 className={H2}>One credit ≈ one small agent action.</h2>
          <p className={SUB}>Credits are consumed per event, not per token.</p>
        </div>

        <div className="border border-border rounded-lg overflow-hidden">
          <div className="grid grid-cols-[1.6fr_120px_2fr] px-[18px] py-2.5 border-b border-border bg-muted font-mono text-[10px] tracking-[0.06em] uppercase text-muted-foreground">
            <span>Event</span>
            <span className="text-center">Credits</span>
            <span>What it covers</span>
          </div>
          {CREDIT_EVENTS.map((row, i) => (
            <div
              key={row.event}
              className={cn(
                "grid grid-cols-[1.6fr_120px_2fr] px-[18px] py-3.5 font-mono text-[13px] items-center",
                i < CREDIT_EVENTS.length - 1 && "border-b border-border",
              )}
            >
              <span>{row.event}</span>
              <span className="text-center font-semibold text-primary">
                {row.credits}
              </span>
              <span className="text-muted-foreground text-xs">{row.note}</span>
            </div>
          ))}
        </div>

        <p className="font-sans text-[13px] text-muted-foreground leading-[1.55] mt-5">
          Flat rate per event — token costs are always included.
        </p>
      </div>
    </section>
  );
}

function ComparisonSection() {
  return (
    <section className={SEC}>
      <div className={WRAP}>
        <div className={SECHEAD}>
          <Eyebrow>Compare plans</Eyebrow>
          <h2 className={H2}>Every plan, side by side.</h2>
          <p className={SUB}>
            The essentials at a glance. Full feature details live in each plan
            card above.
          </p>
        </div>
        <PricingComparison />
      </div>
    </section>
  );
}

function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className={SEC}>
      <div className={cn(WRAP, "max-w-[800px]")}>
        <div className={SECHEAD}>
          <Eyebrow>FAQ</Eyebrow>
          <h2 className={H2}>Common questions.</h2>
        </div>
        <div className="flex flex-col border border-border rounded-lg overflow-hidden">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              className={
                i < FAQ_ITEMS.length - 1 ? "border-b border-border" : undefined
              }
            >
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-[18px] border-0 bg-transparent text-foreground font-mono text-sm font-medium cursor-pointer text-left gap-3"
              >
                {item.q}
                <span
                  className="shrink-0 text-muted-foreground transition-transform duration-200"
                  style={{
                    transform: open === i ? "rotate(45deg)" : "rotate(0deg)",
                  }}
                >
                  <Plus size={16} />
                </span>
              </button>
              {open === i && (
                <div className="px-5 pb-[18px] font-sans text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
