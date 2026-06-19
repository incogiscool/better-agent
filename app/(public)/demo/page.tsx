import { Suspense } from "react";
import type { Metadata } from "next";
import { VariantSwitcher } from "./_components/VariantSwitcher";

export const metadata: Metadata = {
  title: "Live Demo",
  description:
    "Try BetterAgent embedded in a sample SaaS app. Switch between sidebar, popup, cmd-k, inline-bar, and drawer chat layouts and watch the agent manage campaigns and influencers in real time.",
};

export default function DemoPage() {
  return (
    <>
      <h1 className="sr-only">
        BetterAgent live demo — chat agent embedded in a sample SaaS app
      </h1>
      <Suspense
        fallback={
          <div className="flex min-h-[60vh] items-center justify-center px-6 py-24 text-center font-mono text-sm text-muted-foreground">
            Loading the BetterAgent demo…
          </div>
        }
      >
        <VariantSwitcher />
      </Suspense>
    </>
  );
}
