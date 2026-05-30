"use client";

import { useState } from "react";
import { Plus } from "@phosphor-icons/react";
import { PricingCards } from "@/components/landing/PricingCards";
import { CtaSection } from "@/components/landing/CtaSection";
import { Eyebrow, WRAP, SEC, SECHEAD, H2, SUB } from "@/components/landing/primitives";
import { cn } from "@/lib/utils";

const CREDIT_EVENTS = [
  { event: "Conversation start", credits: 2,  note: "once per new conversation" },
  { event: "Per message",         credits: 1,  note: "each user turn" },
  { event: "Per tool call",       credits: 3,  note: "routes + server/client actions" },
] as const;

const FAQ_ITEMS = [
  { q: "What happens when I hit the free limit?",  a: "Your project is hard-capped at 500 credits. The chat endpoint returns a clear error and no further billing occurs. Wait for your next monthly reset, or join the Pro waitlist." },
  { q: "When does Pro launch?",                    a: "Pro is on the waitlist while we finish billing. Join from the pricing card above and we'll email you when it's ready." },
  { q: "Do unused credits roll over?",             a: "No — credits reset at the start of each 30-day billing period." },
  { q: "Are token costs hidden from me?",          a: "Yes. You pay a flat rate per event (conversation start, message, tool call). Token usage is included in the credit price on Free and Pro." },
];

export default function PricingPage() {
  return (
    <>
      <PricingHero />
      <PlansSection />
      <CreditExplainer />
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
            Free until your agent<br />earns its keep.
          </h1>
          <p className={SUB}>500 credits a month on the house — roughly 25 conversations. Pro ($39/mo with 10,000 credits) is launching soon — join the waitlist. No card required to start.</p>
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
          <p className={SUB}>Credits are consumed per event, not per token. Here{"’"}s the full cost table:</p>
        </div>

        <div className="grid grid-cols-2 gap-6 items-start">
          {/* Cost table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="grid grid-cols-[1fr_80px_1fr] px-[18px] py-2.5 border-b border-border bg-muted font-mono text-[10px] tracking-[0.06em] uppercase text-muted-foreground">
              <span>Event</span>
              <span className="text-center">Credits</span>
              <span>Note</span>
            </div>
            {CREDIT_EVENTS.map((row, i) => (
              <div
                key={row.event}
                className={cn("grid grid-cols-[1fr_80px_1fr] px-[18px] py-3 font-mono text-[13px] items-center", i < CREDIT_EVENTS.length - 1 && "border-b border-border")}
              >
                <span>{row.event}</span>
                <span className="text-center font-semibold text-primary">{row.credits}</span>
                <span className="text-muted-foreground text-xs">{row.note}</span>
              </div>
            ))}
          </div>

          {/* Math examples */}
          <div className="flex flex-col gap-4">
            <h3 className="font-mono font-medium text-lg m-0 tracking-[-0.01em]">What does that look like?</h3>

            {[
              { plan: "Free · 500 credits",       eg: "Roughly 25 short conversations with a couple of tool calls each." },
              { plan: "Pro · 10,000 credits",      eg: "Roughly 500 short conversations, or fewer deeper multi-step runs." },
            ].map((row) => (
              <div key={row.plan} className="p-4 border border-border rounded-[var(--radius-md)]">
                <div className="font-mono font-semibold text-[13px] mb-1.5">{row.plan}</div>
                <div className="font-sans text-[13px] text-muted-foreground leading-relaxed">{row.eg}</div>
              </div>
            ))}

            <p className="font-sans text-[13px] text-muted-foreground leading-[1.55] m-0">
              Token costs are included in credit pricing — you pay a flat rate per event, not for individual tokens.
            </p>
          </div>
        </div>
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
            <div key={i} className={i < FAQ_ITEMS.length - 1 ? "border-b border-border" : undefined}>
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-[18px] border-0 bg-transparent text-foreground font-mono text-sm font-medium cursor-pointer text-left gap-3"
              >
                {item.q}
                <span
                  className="shrink-0 text-muted-foreground transition-transform duration-200"
                  style={{ transform: open === i ? "rotate(45deg)" : "rotate(0deg)" }}
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
