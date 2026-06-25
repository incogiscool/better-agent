"use client";

import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { ArrowRight, List as MenuIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { PUBLIC_NAVBAR_LINKS } from "@/lib/const/PUBLIC_NAVBAR_LINKS";
import { GITHUB_URL } from "@/lib/const/GITHUB_URL";
import { GithubIcon } from "@/components/landing/primitives";

export function LandingNav() {
  return (
    <header className="lnav-header flex items-center gap-4 sm:gap-6 px-4 sm:px-6 lg:px-10 py-[18px] border-b border-border bg-background/92 backdrop-blur-sm sticky top-0 z-10">
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

      <nav className="hidden lg:flex gap-5" aria-label="Main navigation">
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

      <Button asChild variant="outline" size="icon" aria-label="BetterAgent on GitHub">
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
          <GithubIcon size={16} />
        </a>
      </Button>
      <ModeToggle />
      <div className="hidden lg:flex items-center gap-2">
        <Button asChild variant="outline">
          <a href="/auth/sign-in">Sign in</a>
        </Button>
        <Button asChild>
          <a href="/auth/sign-up">Get started <ArrowRight size={12} /></a>
        </Button>
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon-sm"
            className="lg:hidden"
            aria-label="Open menu"
          >
            <MenuIcon size={16} />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-3/4 sm:max-w-xs">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 px-4" aria-label="Mobile navigation">
            {PUBLIC_NAVBAR_LINKS.map(({ name, link, external }) => (
              <SheetClose key={name} asChild>
                <Link
                  href={link}
                  className="text-foreground text-sm no-underline font-mono py-2.5 border-b border-border last:border-b-0"
                  {...(external && { target: "_blank", rel: "noopener noreferrer" })}
                >
                  {name}
                </Link>
              </SheetClose>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-2 p-4">
            <Button asChild variant="outline">
              <a href="/auth/sign-in">Sign in</a>
            </Button>
            <Button asChild>
              <a href="/auth/sign-up">Get started <ArrowRight size={12} /></a>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
