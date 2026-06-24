"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Check } from "@phosphor-icons/react";
import { CtaSection } from "@/components/landing/CtaSection";
import {
  Eyebrow,
  WRAP,
  SEC,
  H2,
  SUB,
} from "@/components/landing/primitives";
import { Button } from "@/components/ui/button";
import { contactAction, type ContactFormState } from "@/lib/actions/contact";
import { cn } from "@/lib/utils";

const CONTACT_ADDRESSES = [
  {
    label: "General",
    email: "support@betteragent.dev",
    desc: "Questions, feedback, anything else.",
  },
  {
    label: "Privacy",
    email: "legal@betteragent.dev",
    desc: "Data requests, GDPR inquiries, data deletion.",
  },
  {
    label: "Legal",
    email: "legal@betteragent.dev",
    desc: "Terms, licensing, business inquiries.",
  },
] as const;

const initialState: ContactFormState = {};

const CREDITS_MESSAGE_DRAFT =
  "Hi! I'm running low on credits and would love some more to keep building.\n\nHere's what I'm working on:\n";

export default function ContactPage() {
  return (
    <Suspense fallback={null}>
      <ContactPageContent />
    </Suspense>
  );
}

function ContactPageContent() {
  const isCreditsRequest = useSearchParams().get("topic") === "credits";
  const [state, formAction, pending] = useActionState(contactAction, initialState);

  return (
    <>
      <ContactHero isCreditsRequest={isCreditsRequest} />
      <section className={cn(SEC, "border-b-0")}>
        <div className={WRAP}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 lg:gap-16 items-start">
            <ContactForm
              state={state}
              formAction={formAction}
              pending={pending}
              isCreditsRequest={isCreditsRequest}
            />
            <ContactInfo />
          </div>
        </div>
      </section>
      <CtaSection />
    </>
  );
}

function ContactHero({ isCreditsRequest }: { isCreditsRequest: boolean }) {
  return (
    <section className="pt-14 md:pt-24 pb-16 border-b border-border">
      <div className={cn(WRAP, "max-w-[760px]")}>
        <div className="flex flex-col gap-5">
          <Eyebrow>{isCreditsRequest ? "More credits" : "Contact"}</Eyebrow>
          <h1 className="font-mono font-medium text-[clamp(32px,6vw,56px)] leading-[1.04] tracking-[-0.03em] m-0">
            {isCreditsRequest ? "Need more credits?" : "Get in touch."}
          </h1>
          <p className={SUB}>
            {isCreditsRequest
              ? "Tell us what you're building and we'll top you up. We read every message and usually reply within one business day."
              : "We read every message and aim to respond within one business day."}
          </p>
        </div>
      </div>
    </section>
  );
}

function ContactForm({
  state,
  formAction,
  pending,
  isCreditsRequest,
}: {
  state: ContactFormState;
  formAction: (payload: FormData) => void;
  pending: boolean;
  isCreditsRequest: boolean;
}) {
  if (state.success) {
    return (
      <div className="flex flex-col gap-4 py-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 border border-primary/20">
            <Check size={16} className="text-primary" />
          </div>
          <h2 className={H2}>Message sent.</h2>
        </div>
        <p className="font-sans text-[15px] text-muted-foreground leading-[1.55]">
          We{"'"}ll be in touch at{" "}
          <strong className="text-foreground font-medium">{state.submittedEmail}</strong>.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {isCreditsRequest && <input type="hidden" name="topic" value="credits" />}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="font-mono text-[12px] uppercase tracking-[0.06em] text-muted-foreground">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          disabled={pending}
          className="w-full border border-border bg-background px-3 py-2.5 font-sans text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary rounded-[var(--radius-md)] disabled:opacity-60"
          placeholder="Your name"
        />
        <FieldError errors={state.errors?.name} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="font-mono text-[12px] uppercase tracking-[0.06em] text-muted-foreground">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          disabled={pending}
          className="w-full border border-border bg-background px-3 py-2.5 font-sans text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary rounded-[var(--radius-md)] disabled:opacity-60"
          placeholder="you@example.com"
        />
        <FieldError errors={state.errors?.email} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="font-mono text-[12px] uppercase tracking-[0.06em] text-muted-foreground">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          disabled={pending}
          defaultValue={isCreditsRequest ? CREDITS_MESSAGE_DRAFT : undefined}
          className="w-full border border-border bg-background px-3 py-2.5 font-sans text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary rounded-[var(--radius-md)] resize-y disabled:opacity-60"
          placeholder="Tell us what's on your mind…"
        />
        <FieldError errors={state.errors?.message} />
      </div>

      {state.message && !state.errors && (
        <p className="font-sans text-[13px] text-destructive">{state.message}</p>
      )}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="font-sans text-[12px] text-destructive">{errors[0]}</p>;
}

function ContactInfo() {
  return (
    <div className="flex flex-col gap-6 pt-1">
      <div className="flex flex-col gap-3">
        {CONTACT_ADDRESSES.map(({ label, email, desc }) => (
          <div key={label} className="p-[14px_16px] border border-border rounded-lg flex flex-col gap-1.5">
            <div className="font-mono text-[11px] uppercase tracking-[0.07em] text-muted-foreground">
              {label}
            </div>
            <a
              href={`mailto:${email}`}
              className="font-mono text-[13px] text-primary hover:underline underline-offset-2"
            >
              {email}
            </a>
            <p className="font-sans text-[12px] text-muted-foreground leading-[1.5] m-0">{desc}</p>
          </div>
        ))}
      </div>
      <p className="font-sans text-[12px] text-muted-foreground leading-[1.5]">
        Response time: typically within one business day.
      </p>
    </div>
  );
}
