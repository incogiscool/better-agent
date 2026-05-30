"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <main className="flex min-h-[calc(100vh-72px)] flex-col items-center justify-center px-6 py-24">
      <div className="flex max-w-md flex-col items-center gap-5 text-center">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          Something broke
        </span>
        <h1 className="font-mono text-3xl font-medium tracking-[-0.02em]">
          We hit an unexpected error.
        </h1>
        <p className="font-sans text-sm leading-relaxed text-muted-foreground">
          The error has been logged. Try the page again, or head back home.
        </p>
        {error.digest && (
          <code className="font-mono text-[11px] text-muted-foreground">
            ref: {error.digest}
          </code>
        )}
        <div className="mt-2 flex gap-2.5">
          <Button onClick={reset}>Try again</Button>
          <Button asChild variant="outline">
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
