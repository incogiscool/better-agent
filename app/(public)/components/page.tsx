"use client";

import { ComponentGallery } from "@/components/landing/ComponentGallery";
import { CtaSection } from "@/components/landing/CtaSection";
import { Eyebrow, WRAP, SEC, SECHEAD, H2, SUB, DarkCode, CodeChip } from "@/components/landing/primitives";
import { cn } from "@/lib/utils";

export default function ComponentsPage() {
  return (
    <>
      <ComponentsHero />
      <GallerySection />
      <InstallSection />
      <ThemingSection />
      <CtaSection />
    </>
  );
}

function ComponentsHero() {
  return (
    <section className="pt-24 pb-16 border-b border-border">
      <div className={cn(WRAP, "max-w-[760px]")}>
        <div className="flex flex-col gap-5">
          <Eyebrow>Component Registry</Eyebrow>
          <h1 className="font-mono font-medium text-[56px] leading-[1.04] tracking-[-0.03em] m-0">
            shadcn-style registry<br />of agent UI.
          </h1>
          <p className={SUB}>
            Pick a layout, run <CodeChip>betteragent add</CodeChip>, and you own the code. Theming inherits from your shadcn tokens — restyle anything without forking a package.
          </p>
        </div>
      </div>
    </section>
  );
}

function GallerySection() {
  return (
    <section className={SEC}>
      <div className={WRAP}>
        <div className={SECHEAD}>
          <Eyebrow>All components</Eyebrow>
          <h2 className={H2}>Four layouts, one protocol.</h2>
          <p className={SUB}>Every container composes the same shared pieces — messages, input, header, suggested prompts. Install one and you get them all.</p>
        </div>
        <ComponentGallery />
      </div>
    </section>
  );
}

const INSTALL_STEPS = [
  {
    n: "01",
    title: "Install the packages",
    code: "npm i betteragent-react betteragent-next betteragent-cli",
    language: "bash",
  },
  {
    n: "02",
    title: "Add a chat component",
    code: "npx betteragent add sidebar",
    language: "bash",
  },
  {
    n: "03",
    title: "Import theming + wrap your app",
    code: `// globals.css
@import "./components/chat/styles/betteragent.css";

// app/layout.tsx
import { BetterAgentProvider } from "betteragent-react";

<BetterAgentProvider
  clientKey={process.env.NEXT_PUBLIC_BETTERAGENT_CLIENT_KEY!}
  endUserId={currentUser.id}
  actions={{ openSettings: ({ tab }) => router.push(\`/settings?tab=\${tab}\`) }}
>
  {children}
</BetterAgentProvider>`,
    language: "tsx",
  },
  {
    n: "04",
    title: "Drop in the component",
    code: `import { ChatSidebar } from "@/components/chat/sidebar";

// Inside your layout:
<div className="flex h-screen">
  <MainContent />
  <ChatSidebar
    title="Your agent"
    greeting="Hi — how can I help?"
    suggestedPrompts={[
      { label: "Show me recent activity", prompt: "What happened in the last 7 days?" },
    ]}
  />
</div>`,
    language: "tsx",
  },
] as const;

function InstallSection() {
  return (
    <section className={SEC}>
      <div className={WRAP}>
        <div className={SECHEAD}>
          <Eyebrow>Getting started</Eyebrow>
          <h2 className={H2}>Four steps to a working agent UI.</h2>
        </div>
        <div className="flex flex-col gap-8">
          {INSTALL_STEPS.map((s) => (
            <div key={s.n} className="grid grid-cols-[80px_1fr] gap-6 items-start">
              <div className="flex flex-col gap-1 pt-1">
                <span className="font-mono text-[11px] text-muted-foreground tracking-[0.06em] uppercase">{s.n}</span>
                <h3 className="font-mono font-medium text-[15px] m-0 tracking-[-0.01em]">{s.title}</h3>
              </div>
              <DarkCode language={s.language}>
                {s.code}
              </DarkCode>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ThemingSection() {
  return (
    <section className={SEC}>
      <div className={WRAP}>
        <div className={SECHEAD}>
          <Eyebrow>Theming</Eyebrow>
          <h2 className={H2}>Theming through CSS variables.</h2>
          <p className={SUB}>Components inherit your shadcn tokens by default. Override any <CodeChip>--ba-*</CodeChip> variable in your own globals to retheme without touching component source.</p>
        </div>
        <div className="grid grid-cols-2 gap-6 items-start">
          <div>
            <h3 className="font-mono font-medium text-base m-0 mb-4 tracking-[-0.01em]">Defaults (shadcn fallbacks)</h3>
            <DarkCode language="css">
              {`:root {
  /* Surfaces */
  --ba-bg:          var(--background);
  --ba-fg:          var(--foreground);
  --ba-panel-bg:    var(--card);
  --ba-muted:       var(--muted);
  --ba-muted-fg:    var(--muted-foreground);
  --ba-border:      var(--border);

  /* Brand */
  --ba-primary:     var(--primary);
  --ba-primary-fg:  var(--primary-foreground);

  /* Messages */
  --ba-msg-user-bg:  var(--ba-primary);
  --ba-msg-user-fg:  var(--ba-primary-fg);
  --ba-msg-agent-bg: var(--ba-muted);
  --ba-msg-agent-fg: var(--ba-fg);

  /* Shape */
  --ba-radius:      0;
  --ba-radius-msg:  0.5rem;
  --ba-font-sans:   var(--font-sans);
  --ba-font-mono:   var(--font-mono);
}`}
            </DarkCode>
          </div>
          <div>
            <h3 className="font-mono font-medium text-base m-0 mb-4 tracking-[-0.01em]">Custom override (no shadcn)</h3>
            <DarkCode language="css">
              {`/* globals.css — works without shadcn */
@import "./components/chat/styles/betteragent.css";

:root {
  --ba-primary:    #f97316;     /* your brand orange */
  --ba-primary-fg: #ffffff;
  --ba-radius-msg: 1rem;        /* rounder bubbles */
  --ba-font-sans:  "Inter", sans-serif;
}

/* Dark mode */
.dark {
  --ba-bg:      #0a0a0a;
  --ba-fg:      #fafafa;
  --ba-panel-bg: #111111;
  --ba-border:  rgba(255,255,255,0.08);
}`}
            </DarkCode>
            <p className="font-sans text-[13px] text-muted-foreground leading-[1.55] mt-3">
              The CSS file is copied into your project by <CodeChip>betteragent add</CodeChip> — you own it and can edit it directly.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
