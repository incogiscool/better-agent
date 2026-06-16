"use client";

import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { PUBLIC_NAVBAR_LINKS } from "@/lib/const/PUBLIC_NAVBAR_LINKS";

export function LandingNav() {
  return (
    <header className="lnav-header flex items-center gap-6 px-10 py-[18px] border-b border-border bg-background/92 backdrop-blur-sm sticky top-0 z-10">
      <Link
        href="/"
        className="inline-flex items-center gap-2 font-mono font-semibold text-[15px] tracking-[-0.01em] no-underline text-foreground"
      >
        <span className="text-primary inline-flex">
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
            <path
              d="M11 8 L20 16 L11 24"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        betteragent
      </Link>

      <nav className="flex gap-5" aria-label="Main navigation">
        {PUBLIC_NAVBAR_LINKS.map(({ name, link, external }) => (
          <Link
            key={name}
            href={link}
            className="text-muted-foreground text-[13px] no-underline font-mono"
            {...(external && { target: "_blank", rel: "noopener noreferrer" })}
          >
            {name}
          </Link>
        ))}
      </nav>

      <span className="flex-1" />

<ModeToggle />
      <Button asChild variant="outline">
        <a href="/auth/sign-in">Sign in</a>
      </Button>
      <Button asChild>
        <a href="/auth/sign-up">Get started <ArrowRight size={12} /></a>
      </Button>
    </header>
  );
}
