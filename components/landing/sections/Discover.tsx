import { TerminalDemo } from "@/components/landing/TerminalDemo";
import { Eyebrow, WRAP, SEC, SECHEAD, H2, SUB } from "@/components/landing/primitives";

const DISCOVER_STEPS = [
  {
    n: "01",
    title: "betteragent discover",
    body: "We walk your codebase: every Server Action, every API route, every exported handler. You pick which ones the agent can call.",
  },
  {
    n: "02",
    title: "Tool files scaffolded",
    body: "We scaffold one entry per selected handler with an empty Zod schema you fill in. The agent gets the same contract your IDE has once you describe the arguments.",
  },
  {
    n: "03",
    title: "betteragent sync",
    body: "Diff against the server, confirm, ship. Routes are static at runtime — the LLM only sees the names and schemas you approved.",
  },
];

export function Discover() {
  return (
    <section className={SEC}>
      <div className={WRAP}>
        <div className={SECHEAD}>
          <Eyebrow>Zero-config DX</Eyebrow>
          <h2 className={H2}>
            Your app already has tools.
            <br />
            <span className="text-muted-foreground">
              BetterAgent finds them.
            </span>
          </h2>
          <p className={SUB}>
            Point the CLI at your codebase and we read your routes and server
            actions. You pick which handlers the agent can call and write the
            descriptions it uses to decide when.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <TerminalDemo height={460} />
          <div className="flex flex-col gap-7 justify-center">
            {DISCOVER_STEPS.map((s) => (
              <div key={s.n} className="flex flex-col gap-2.5">
                <span className="font-mono text-[11px] text-muted-foreground tracking-[0.06em] uppercase">
                  {s.n}
                </span>
                <h3 className="font-mono font-medium text-lg tracking-[-0.01em] m-0">
                  {s.title}
                </h3>
                <p className="font-sans text-sm leading-[1.55] text-muted-foreground m-0">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
