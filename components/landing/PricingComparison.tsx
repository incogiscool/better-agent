import { cn } from "@/lib/utils";
import { Check } from "@phosphor-icons/react";
import { PLANS } from "./PricingCards";

// One concise comparison row per feature. `values` is indexed to match the
// order of PLANS (Free, Starter, Plus, Enterprise). A boolean renders as a
// check / em-dash; a string renders as-is.
const FEATURE_ROWS: { label: string; values: (string | boolean)[] }[] = [
  { label: "Price (per project)", values: PLANS.map((p) => `${p.price}${p.unit}`) },
  { label: "Credits / month", values: ["500", "1,500", "4,000", "Custom"] },
  { label: "Projects", values: ["Unlimited", "Unlimited", "Unlimited", "Unlimited"] },
  {
    label: "Overage",
    values: ["Hard cap", "Hard cap", "$10 / 1,000 credits", "Custom"],
  },
  { label: "Bring your own key", values: [false, false, true, true] },
  {
    label: "Support",
    values: ["Community", "Community", "Email", "Dedicated + SLA"],
  },
];

const GRID = "grid grid-cols-[1.4fr_repeat(4,1fr)]";

function Cell({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <span className="text-[oklch(0.55_0.17_145)]">
        <Check size={14} />
      </span>
    ) : (
      <span className="text-muted-foreground">—</span>
    );
  }
  return <span>{value}</span>;
}

export function PricingComparison() {
  return (
    <div className="border border-border rounded-lg overflow-x-auto">
      <div className="min-w-[640px]">
        {/* Header row: plan names, sourced from PLANS */}
        <div
          className={cn(
            GRID,
            "px-[18px] py-3 border-b border-border bg-muted items-center",
          )}
        >
          <span className="font-mono text-[10px] tracking-[0.06em] uppercase text-muted-foreground">
            Plan
          </span>
          {PLANS.map((p) => (
            <span
              key={p.name}
              className={cn(
                "font-mono text-[12px] font-medium tracking-[0.04em] uppercase text-center",
                p.primary ? "text-primary" : "text-foreground",
              )}
            >
              {p.name}
              {p.primary && (
                <span className="ml-1.5 text-[9px] px-1 py-px rounded bg-primary text-primary-foreground align-middle">
                  POPULAR
                </span>
              )}
            </span>
          ))}
        </div>

        {/* Feature rows */}
        {FEATURE_ROWS.map((row, i) => (
          <div
            key={row.label}
            className={cn(
              GRID,
              "px-[18px] py-3.5 font-mono text-[13px] items-center",
              i < FEATURE_ROWS.length - 1 && "border-b border-border",
            )}
          >
            <span className="text-muted-foreground text-xs">{row.label}</span>
            {row.values.map((value, j) => (
              <span
                key={j}
                className={cn(
                  "flex items-center justify-center text-center",
                  PLANS[j].primary && "text-primary",
                )}
              >
                <Cell value={value} />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
