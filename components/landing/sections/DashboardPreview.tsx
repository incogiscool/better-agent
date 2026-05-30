import {
  Eyebrow,
  WRAP,
  SEC,
  SECHEAD,
  H2,
  SUB,
} from "@/components/landing/primitives";
import { cn } from "@/lib/utils";

const RUNS = [
  [
    "run_8a91f3",
    "running",
    "/api/agent/campaigns",
    "2",
    "612",
    "—",
    "just now",
  ],
  [
    "run_8a91f0",
    "done",
    "/api/agent/campaigns",
    "4",
    "1,284",
    "3.2s",
    "12s ago",
  ],
  ["run_8a91eb", "done", "/api/agent/audiences", "1", "412", "0.9s", "1m ago"],
  [
    "run_8a91e8",
    "failed",
    "/api/agent/analytics",
    "2",
    "901",
    "30.0s",
    "4m ago",
  ],
  [
    "run_8a91e2",
    "done",
    "/api/agent/campaigns",
    "5",
    "2,140",
    "4.8s",
    "7m ago",
  ],
];

function RunStatus({ status }: { status: string }) {
  const styles = {
    done: {
      bg: "color-mix(in oklch, oklch(0.65 0.17 145) 12%, transparent)",
      color: "oklch(0.55 0.17 145)",
    },
    running: {
      bg: "color-mix(in oklch, var(--primary) 14%, transparent)",
      color: "var(--primary)",
    },
    failed: {
      bg: "color-mix(in oklch, var(--destructive) 12%, transparent)",
      color: "var(--destructive)",
    },
  }[status] ?? { bg: "var(--muted)", color: "var(--muted-foreground)" };

  return (
    <span
      className="inline-flex items-center gap-[5px] h-[18px] px-[7px] rounded-full text-[10px] font-medium max-w-max border border-current"
      style={{ background: styles.bg, color: styles.color }}
    >
      <span className="w-1 h-1 rounded-full bg-current inline-block" />
      {status}
    </span>
  );
}

const STAT_ROWS: [string, string, string, boolean][] = [
  ["Runs (24h)", "1,284", "+18% vs y'day", true],
  ["Avg latency", "2.41s", "p95: 4.8s", true],
  ["Tool calls", "4,012", "list_audiences top", false],
  ["Spend (mo)", "$148", "$0.0114 / run", false],
];

const TABLE_HEADERS = [
  "id",
  "status",
  "route",
  "tools",
  "tokens",
  "latency",
  "started",
];

export function DashboardPreview() {
  return (
    <section className={SEC}>
      <div className={WRAP}>
        <div className={SECHEAD}>
          <Eyebrow>Observability built in</Eyebrow>
          <h2 className={H2}>
            Debug like an HTTP request,
            <br />
            <span className="text-muted-foreground">not a model.</span>
          </h2>
          <p className={SUB}>
            Every conversation, every tool call, every token, all recorded and
            queryable.
          </p>
        </div>
        <div className="border border-border rounded-[var(--radius-xl)] bg-card overflow-hidden shadow-md">
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border bg-muted/30">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-[9px] h-[9px] rounded-full bg-border inline-block"
                />
              ))}
            </div>
            <span className="font-mono text-[11px] text-muted-foreground ml-2">
              cohort-mail / cohort-prod / runs
            </span>
            <span className="flex-1" />
            <span className="font-mono text-[11px] text-muted-foreground">
              app.betteragent.dev
            </span>
          </div>
          <div className="grid grid-cols-4 border-b border-border">
            {STAT_ROWS.map(([k, v, d, up], i) => (
              <div
                key={i}
                className={cn(
                  "px-[18px] py-3.5 flex flex-col gap-1",
                  i < 3 && "border-r border-border",
                )}
              >
                <span className="font-mono text-[10px] tracking-[0.06em] uppercase text-muted-foreground">
                  {k}
                </span>
                <span className="font-mono text-[22px] tracking-[-0.01em] font-medium">
                  {v}
                </span>
                <span
                  className={cn(
                    "font-mono text-[11px]",
                    up
                      ? "text-[oklch(0.55_0.17_145)]"
                      : "text-muted-foreground",
                  )}
                >
                  {d}
                </span>
              </div>
            ))}
          </div>
          <div className="px-[18px] py-2.5 grid grid-cols-[120px_90px_1fr_80px_80px_80px_100px] gap-2.5 font-mono text-[10px] text-muted-foreground tracking-[0.06em] uppercase border-b border-border">
            {TABLE_HEADERS.map((h, i) => (
              <div key={h} className={i >= 3 ? "text-right" : ""}>
                {h}
              </div>
            ))}
          </div>
          {RUNS.map((r, i) => (
            <div
              key={i}
              className={cn(
                "px-[18px] py-2.5 grid grid-cols-[120px_90px_1fr_80px_80px_80px_100px] gap-2.5 font-mono text-[12px] items-center",
                i < 4 && "border-b border-border",
              )}
            >
              <span className="text-muted-foreground">{r[0]}</span>
              <RunStatus status={r[1]!} />
              <span className="font-mono text-[11px] px-2 py-px rounded-[5px] bg-muted border border-border">
                {r[2]}
              </span>
              <span className="text-right">{r[3]}</span>
              <span className="text-right">{r[4]}</span>
              <span className="text-right">{r[5]}</span>
              <span className="text-muted-foreground">{r[6]}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
