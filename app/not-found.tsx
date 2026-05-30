import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-72px)] flex-col items-center justify-center px-6 py-24">
      <div className="flex max-w-md flex-col items-center gap-5 text-center">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          404
        </span>
        <h1 className="font-mono text-3xl font-medium tracking-[-0.02em]">
          Page not found.
        </h1>
        <p className="font-sans text-sm leading-relaxed text-muted-foreground">
          That URL doesn&rsquo;t map to anything we&rsquo;ve shipped. If you got
          here from a link inside the app, let us know.
        </p>
        <div className="mt-2 flex gap-2.5">
          <Button asChild>
            <Link href="/">
              Back home <ArrowRight size={12} />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">Report it</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
