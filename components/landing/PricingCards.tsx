"use client";
import { cn } from "@/lib/utils";
import { Check } from "@phosphor-icons/react";
import Link from "next/link";
import { Button } from "../ui/button";
import posthog from "posthog-js";

export const PLANS = [
  {
    name: "Free",
    price: "$0",
    unit: "/mo",
    primary: false,
    cta: "Start free",
    href: "/auth/sign-up",
    tagline: "For prototyping and small projects.",
    features: ["500 credits / 30 days", "Unlimited projects", "Hosted Sonnet 4.6"],
  },
  {
    name: "Starter",
    price: "$0.99",
    unit: "/mo",
    primary: true,
    cta: "Get started",
    href: "/contact",
    tagline: "3x the runway, for less than a pack of gum.",
    features: [
      "1,500 credits / 30 days",
      "Hard-capped, no surprise charges",
      "Hosted Sonnet 4.6",
    ],
  },
  {
    name: "Plus",
    price: "$14.99",
    unit: "/mo",
    primary: false,
    cta: "Get started",
    href: "/contact",
    tagline: "For agents that need a little more room.",
    features: [
      "4,000 credits / 30 days",
      "$10 per 1,000 additional credits",
      "Bring your own API key for unlimited usage",
      "Hosted Sonnet 4.6",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    unit: "",
    primary: false,
    cta: "Talk to sales",
    href: "/contact",
    tagline: "Custom plans for teams shipping at scale.",
    features: [],
  },
] as const;

export function PricingCards() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {PLANS.map((p) => (
        <div
          key={p.name}
          className={cn(
            "border rounded-xl p-7 flex flex-col gap-4",
            p.primary ? "border-primary bg-primary/4" : "border-border bg-card",
          )}
        >
          <span
            className={cn(
              "font-mono text-sm font-medium tracking-[0.04em] uppercase",
              p.primary ? "text-primary" : "text-muted-foreground",
            )}
          >
            {p.name}
            {p.primary && (
              <span className="ml-1.5 text-[10px] px-1.5 py-px rounded bg-primary text-primary-foreground">
                POPULAR
              </span>
            )}
          </span>

          <div className="font-mono text-[clamp(32px,6vw,44px)] font-medium tracking-[-0.025em] leading-none">
            {p.price}
            <span className="text-sm text-muted-foreground ml-1">{p.unit}</span>
          </div>

          <p className="font-sans text-sm text-muted-foreground leading-relaxed m-0">
            {p.tagline}
          </p>

          <ul className="list-none p-0 m-0 flex flex-col gap-2">
            {p.features.map((f) => (
              <li
                key={f}
                className="flex items-start gap-2 font-mono text-[12.5px] leading-relaxed"
              >
                <span className="text-[oklch(0.55_0.17_145)] shrink-0 mt-0.5">
                  <Check size={11} />
                </span>
                {f}
              </li>
            ))}
          </ul>

          <Link
            href={p.href}
            className={"mt-auto w-full"}
            onClick={() => posthog.capture("pricing_plan_cta_clicked", { plan: p.name, cta: p.cta })}
          >
            <Button
              variant={p.primary ? "default" : "outline"}
              className="mt-auto w-full"
            >
              {p.cta}
            </Button>
          </Link>
        </div>
        ))}
      </div>
      <p className="font-mono text-[12px] text-muted-foreground text-center m-0">
        Every plan is priced per project — create as many projects as you want.
      </p>
    </div>
  );
}
