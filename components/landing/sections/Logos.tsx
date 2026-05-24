import { WRAP } from "@/components/landing/primitives";

const LOGO_NAMES = [
  "Resend",
  "Trigger.dev",
  "Convex",
  "Neon",
  "Clerk",
  "Railway",
  "WorkOS",
];

export function Logos() {
  return (
    <section className="py-8 border-t border-b border-border">
      <div className={WRAP}>
        <p className="text-center text-muted-foreground font-mono text-[11px] tracking-[0.08em] uppercase m-0 mb-[18px]">
          Trusted by developer-tool teams shipping with BetterAgent
        </p>
        <div className="flex items-center justify-center gap-14 flex-wrap opacity-70">
          {LOGO_NAMES.map((l) => (
            <span
              key={l}
              className="font-mono text-[13px] font-medium tracking-[-0.02em] text-muted-foreground"
            >
              {l}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
