"use client";

import Link from "next/link";
import { Robot, ArrowUpRight } from "@phosphor-icons/react";
import { CtaSection } from "@/components/landing/CtaSection";
import { Eyebrow, WRAP, SEC, SECHEAD, H2, SUB, DarkCode, CodeChip } from "@/components/landing/primitives";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    n: "01",
    title: "Create a project",
    body: (
      <>
        <p className="font-sans text-[13px] text-muted-foreground leading-[1.55] m-0">
          Sign in to the <Link href="/dashboard" className="underline underline-offset-2">dashboard</Link>, click{" "}
          <strong className="text-foreground font-medium">New project</strong>, and give it a name.
          Once created, copy the <strong className="text-foreground font-medium">secret key</strong> — you{"’"}ll
          need it in the next step and it{"’"}s only shown once.
        </p>
        <p className="font-sans text-[13px] text-muted-foreground leading-[1.55] m-0 mt-2">
          The <strong className="text-foreground font-medium">client key</strong> (shown in settings) is safe to
          expose in client code. The secret key is for the CLI and server only.
        </p>
      </>
    ),
  },
  {
    n: "02",
    title: "Install the CLI",
    body: (
      <>
        <p className="font-sans text-[13px] text-muted-foreground leading-[1.55] m-0">
          Install the CLI as a dev dependency alongside the React and Next.js SDKs.
        </p>
        <DarkCode language="bash">
          {"npm install -D betteragent-cli\nnpm install betteragent-react betteragent-next"}
        </DarkCode>
      </>
    ),
  },
  {
    n: "03",
    title: "Authenticate",
    body: (
      <>
        <p className="font-sans text-[13px] text-muted-foreground leading-[1.55] m-0">
          Log in with the secret key you copied. Credentials are stored in{" "}
          <CodeChip>~/.betteragent/credentials.json</CodeChip> so you only need to do this once per machine.
        </p>
        <DarkCode language="bash">
          {"npx betteragent login --key ba_secret_...\n\n✓ Signed in to acme-app (FREE).\n  Credentials saved to ~/.betteragent/credentials.json"}
        </DarkCode>
      </>
    ),
  },
  {
    n: "04",
    title: "Initialize",
    body: (
      <>
        <p className="font-sans text-[13px] text-muted-foreground leading-[1.55] m-0">
          Run the setup wizard. It will prompt you to pick a chat component variant and optionally scan
          your project for tools. Sidebar is a good default for most apps.
        </p>
        <DarkCode language="bash">
          {"npx betteragent init\n\n? Which chat variant? › sidebar\n\n→ Installing sidebar...\n✓ components/chat/sidebar.tsx\n✓ components/chat/pieces/ (10 files)\n\n? Scan your project for tools? › yes\n→ Found 8 routes · 4 server actions\n\n✓ components/betteragent-provider.tsx (AgentProvider)\n✓ Done. Run betteragent sync to push."}
        </DarkCode>
        <p className="font-sans text-[13px] text-muted-foreground leading-[1.55] m-0 mt-3">
          Init also generates <CodeChip>components/betteragent-provider.tsx</CodeChip> — a ready-to-use{" "}
          <CodeChip>{"<AgentProvider>"}</CodeChip> wrapper that handles wiring server actions to the provider
          automatically. Available variants: <CodeChip>sidebar</CodeChip> · <CodeChip>chat-popup</CodeChip> ·{" "}
          <CodeChip>cmd-k</CodeChip> · <CodeChip>inline-bar</CodeChip>. Add more later with{" "}
          <CodeChip>betteragent add</CodeChip>.
        </p>
      </>
    ),
  },
  {
    n: "05",
    title: "Discover tools",
    body: (
      <>
        <p className="font-sans text-[13px] text-muted-foreground leading-[1.55] m-0">
          If you skipped discovery during init, run it separately. The CLI scans your Next.js routes and
          server actions and generates three tool files. Review them and remove anything the agent
          shouldn{"’"}t access (admin endpoints, internal APIs).
        </p>
        <DarkCode language="bash">
          {"npx betteragent discover\n\n✓ Found 11 route handlers · 9 server action exports\n\n? Select routes to expose as tools › (multiselect)\n? Select server actions to expose › (multiselect)\n\n✓ routes.betteragent.ts (3 routes)\n✓ server-actions.betteragent.ts (4 actions)\n✓ actions.betteragent.ts (template)"}
        </DarkCode>
        <p className="font-sans text-[13px] text-muted-foreground leading-[1.55] m-0 mt-3">
          See the <Link href="/docs/tools" className="underline underline-offset-2">Tool files reference</Link> for
          the full schema and manual authoring guide.
        </p>
      </>
    ),
  },
  {
    n: "06",
    title: "Sync",
    body: (
      <>
        <p className="font-sans text-[13px] text-muted-foreground leading-[1.55] m-0">
          Push your tool definitions to the BetterAgent backend. Run this again whenever the files change.
        </p>
        <DarkCode language="bash">
          {"npx betteragent sync\n\n→ Loading tool files from .\n✓ routes.betteragent.ts (3 tools)\n✓ server-actions.betteragent.ts (4 tools)\n✓ Synced. +7 added · ~0 updated · -0 removed · =0 unchanged."}
        </DarkCode>
      </>
    ),
  },
  {
    n: "07",
    title: "Add the provider",
    body: (
      <>
        <p className="font-sans text-[13px] text-muted-foreground leading-[1.55] m-0">
          Import <CodeChip>AgentProvider</CodeChip> from the component that{" "}
          <CodeChip>betteragent init</CodeChip> generated and wrap your dashboard or root layout with it.
          It handles server action wiring internally — no extra imports needed.
        </p>
        <p className="font-sans text-[13px] text-muted-foreground leading-[1.55] m-0">
          If your agent exposes <strong className="text-foreground font-medium">route tools</strong> that
          read or write per-user data, pass <CodeChip>authToken</CodeChip> so the engine can authenticate
          requests to your backend on behalf of the logged-in user:
        </p>
        <ul className="font-sans text-[13px] text-muted-foreground leading-[1.55] m-0 pl-4 flex flex-col gap-1">
          <li><strong className="text-foreground font-medium">String</strong> — forwarded as <CodeChip>Authorization: Bearer {"<token>"}</CodeChip></li>
          <li><strong className="text-foreground font-medium">Object</strong> — forwarded verbatim, for custom header names or formats</li>
        </ul>
        <DarkCode language="tsx">
          {`import { cookies } from "next/headers";
import { AgentProvider } from "@/components/betteragent-provider";

export default async function Layout({ children }) {
  const user = await requireUser();
  const sessionToken = (await cookies()).get("session")?.value;

  return (
    <AgentProvider
      clientKey={process.env.NEXT_PUBLIC_BETTERAGENT_CLIENT_KEY!}
      apiUrl={process.env.NEXT_PUBLIC_BETTERAGENT_API_URL}
      endUserId={user.id}
      authToken={{ Authorization: \`Bearer \${sessionToken}\` }}
    >
      {children}
    </AgentProvider>
  );
}`}
        </DarkCode>
        <DarkCode language="bash">
          {"# .env.local\nNEXT_PUBLIC_BETTERAGENT_CLIENT_KEY=ba_client_..."}
        </DarkCode>
      </>
    ),
  },
  {
    n: "08",
    title: "Render the chat component",
    body: (
      <>
        <p className="font-sans text-[13px] text-muted-foreground leading-[1.55] m-0">
          The provider supplies context but renders nothing on its own. Import and render the component
          that <CodeChip>betteragent init</CodeChip> installed. For the sidebar variant, add it alongside
          your main content in the root layout:
        </p>
        <DarkCode language="tsx">
          {`import { ChatSidebar } from "@/components/chat/sidebar";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AgentProvider ...>
          <div className="flex h-screen">
            <main className="flex-1 overflow-y-auto">{children}</main>
            <ChatSidebar
              title="Assistant"
              greeting="Hi — how can I help?"
              suggestedPrompts={[
                { label: "What can you do?", prompt: "What can you help me with?" },
              ]}
            />
          </div>
        </AgentProvider>
      </body>
    </html>
  );
}`}
        </DarkCode>
        <p className="font-sans text-[13px] text-muted-foreground leading-[1.55] m-0 mt-3">
          The import path matches whatever <CodeChip>betteragent init</CodeChip> wrote. Check{" "}
          <CodeChip>betteragent.config.json</CodeChip> (written by init) for the installed component name
          and file list. Visit your app — the chat UI should now appear.
        </p>
      </>
    ),
  },
] as const;

export default function QuickstartPage() {
  return (
    <>
      <QuickstartHero />
      <AgentCallout />
      <StepsSection />
      <CtaSection />
    </>
  );
}

function QuickstartHero() {
  return (
    <section className="pt-24 pb-16 border-b border-border">
      <div className={cn(WRAP, "max-w-[760px]")}>
        <div className="flex flex-col gap-5">
          <Eyebrow>Quickstart</Eyebrow>
          <h1 className="font-mono font-medium text-[56px] leading-[1.04] tracking-[-0.03em] m-0">
            Zero to working agent<br />in eight steps.
          </h1>
          <p className={SUB}>
            Create a project, install the CLI, scaffold a chat component, define your tools, wire up the
            provider, and render the UI. Takes about five minutes on an existing Next.js app.
          </p>
        </div>
      </div>
    </section>
  );
}

function AgentCallout() {
  return (
    <section className="py-8 border-b border-border bg-muted/30">
      <div className={WRAP}>
        <Link
          href="/docs/agent"
          className="flex items-center gap-4 group"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground shrink-0">
            <Robot size={16} />
          </div>
          <p className="font-sans text-[13px] text-muted-foreground leading-snug m-0">
            <strong className="text-foreground font-medium">Skip the manual steps.</strong>{" "}
            Paste the AI setup prompt into Claude Code or Cursor and your coding assistant handles all of this automatically.
          </p>
          <span className="font-mono text-[12px] text-primary flex items-center gap-1 ml-auto shrink-0 group-hover:underline">
            Get the prompt <ArrowUpRight size={12} />
          </span>
        </Link>
      </div>
    </section>
  );
}

function StepsSection() {
  return (
    <section className={SEC}>
      <div className={WRAP}>
        <div className={SECHEAD}>
          <Eyebrow>Steps</Eyebrow>
          <h2 className={H2}>Eight steps to your first agent.</h2>
        </div>
        <div className="flex flex-col gap-12">
          {STEPS.map(({ n, title, body }) => (
            <div key={n} className="grid grid-cols-[100px_1fr] gap-8 items-start">
              <div className="flex flex-col gap-1 pt-0.5">
                <span className="font-mono text-[11px] text-muted-foreground tracking-[0.06em] uppercase">{n}</span>
                <h3 className="font-mono font-medium text-[15px] m-0 tracking-[-0.01em] leading-snug">{title}</h3>
              </div>
              <div className="flex flex-col gap-3">{body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
