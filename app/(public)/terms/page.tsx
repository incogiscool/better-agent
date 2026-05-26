import { Eyebrow, WRAP, SEC } from "@/components/landing/primitives";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Terms of Service — BetterAgent",
  description: "Terms and conditions for using BetterAgent.",
};

const EFFECTIVE_DATE = "May 26, 2026";

export default function TermsPage() {
  return (
    <>
      <section className="pt-20 pb-14 border-b border-border">
        <div className={cn(WRAP, "max-w-[760px]")}>
          <div className="flex flex-col gap-4">
            <Eyebrow>Legal</Eyebrow>
            <h1 className="font-mono font-medium text-[48px] leading-[1.06] tracking-[-0.03em] m-0">
              Terms of Service
            </h1>
            <p className="font-sans text-muted-foreground text-sm m-0">
              Effective {EFFECTIVE_DATE}
            </p>
          </div>
        </div>
      </section>

      <section className={SEC}>
        <div className={cn(WRAP, "max-w-[760px]")}>
          <Prose>
            <p>
              These Terms of Service (&ldquo;Terms&rdquo;) govern your access to
              and use of BetterAgent (&ldquo;we&rdquo;, &ldquo;us&rdquo;,
              &ldquo;our&rdquo;) and the services available at betteragent.dev
              (the &ldquo;Service&rdquo;). By creating an account or using the
              Service you agree to these Terms. If you do not agree, do not use
              the Service.
            </p>
            <Placeholder>
              Confirm the legal operating entity (sole proprietorship vs.
              incorporated company) and insert its legal name here.
            </Placeholder>

            <H3>1. Account Registration</H3>
            <p>
              You must provide accurate, current information when creating an
              account and keep it up to date. You are responsible for all
              activity that occurs under your account. Notify us immediately at{" "}
              <a href="mailto:support@betteragent.dev">
                support@betteragent.dev
              </a>{" "}
              if you suspect unauthorized access.
            </p>
            <p>
              Accounts are for individual use. You may not share login
              credentials or allow multiple people to access a single account
              unless you are on a plan that explicitly supports it.
            </p>

            <H3>2. The Service</H3>
            <p>
              BetterAgent is a hosted agent platform that lets you embed
              AI-powered chat interfaces into web applications. The Service
              includes an API, a dashboard, client-side React components, a
              CLI tool, and related infrastructure.
            </p>
            <p>
              We use third-party AI model providers (including Anthropic) to
              power conversation and tool-calling. Your use of those models is
              also subject to those providers&rsquo; acceptable-use policies.
            </p>

            <H3>3. Acceptable Use</H3>
            <p>You agree not to use the Service to:</p>
            <ul>
              <li>
                Violate any applicable law or regulation, including export
                control laws.
              </li>
              <li>
                Generate, distribute, or facilitate content that is unlawful,
                harmful, defamatory, sexually explicit, or harassing.
              </li>
              <li>
                Attempt to reverse-engineer, probe, or exploit the Service
                infrastructure.
              </li>
              <li>
                Exceed rate limits, scrape the Service, or interfere with
                other users&rsquo; access.
              </li>
              <li>
                Misrepresent the source of messages or impersonate any person
                or entity.
              </li>
            </ul>
            <p>
              We reserve the right to suspend or terminate accounts that
              violate these restrictions without prior notice.
            </p>

            <H3>4. Credits and Billing</H3>
            <p>
              The Service operates on a credit system. Credits are consumed per
              agent event (conversation start, message, tool call) and certain
              other agent operations. Free-plan accounts receive 500 credits per
              30-day period. Unused credits do not roll over.
            </p>
            <Placeholder>
              Paid plans and billing are not yet active. When they launch: Pro
              accounts receive 10,000 credits per billing period, with
              pay-as-you-go overage at $5 per 1,000 additional credits. Billing
              is processed via Stripe; all fees are in USD and non-refundable
              except where required by law. We may change pricing with 30
              days&rsquo; notice. If a payment method fails, we will retry for up
              to 7 days before downgrading the account to the Free plan.
            </Placeholder>

            <H3>5. API Keys and Client Keys</H3>
            <p>
              You are responsible for keeping your secret API keys confidential.
              Do not commit keys to public source repositories. Client
              (publishable) keys are designed to be used in client-side code. If
              a key is compromised, rotate it immediately in the dashboard. We
              are not liable for charges or damage caused by key exposure.
            </p>

            <H3>6. Intellectual Property</H3>
            <p>
              The Service, including its software, design, and documentation,
              is owned by BetterAgent and protected by copyright, trademark,
              and other laws. These Terms do not grant you any rights to our
              trademarks or brand.
            </p>
            <p>
              You retain ownership of any content you submit through the
              Service. By using the Service you grant us a limited license to
              process and store that content solely as needed to operate and
              provide the Service.
            </p>

            <H3>7. Privacy</H3>
            <p>
              Your use of the Service is subject to our{" "}
              <a href="/privacy">Privacy Policy</a>, which is incorporated by
              reference.
            </p>

            <H3>8. Third-Party Services</H3>
            <p>
              The Service integrates with third-party services such as Resend
              (email), Anthropic (AI models), and Google and GitHub (optional
              OAuth sign-in). Your use of those services is governed by their
              own terms and privacy policies. We are not responsible for the
              practices of third parties.
            </p>
            <Placeholder>
              Add Stripe (billing) to this list when paid plans launch.
            </Placeholder>

            <H3>9. Disclaimers</H3>
            <p>
              THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; WITHOUT WARRANTIES OF
              ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR
              NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE
              UNINTERRUPTED, ERROR-FREE, OR FREE FROM HARMFUL COMPONENTS.
            </p>
            <p>
              AI-generated responses may be inaccurate or incomplete. You are
              responsible for validating outputs before acting on them.
            </p>

            <H3>10. Limitation of Liability</H3>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, BETTERAGENT&rsquo;S
              AGGREGATE LIABILITY FOR CLAIMS ARISING FROM OR RELATED TO THESE
              TERMS OR THE SERVICE IS LIMITED TO THE AMOUNT YOU PAID IN THE 12
              MONTHS PRECEDING THE CLAIM. IN NO EVENT WILL BETTERAGENT BE
              LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
              EXEMPLARY DAMAGES.
            </p>

            <H3>11. Termination</H3>
            <p>
              You may stop using the Service and close your account at any
              time. We may suspend or terminate your access if you violate
              these Terms, with or without notice. Upon termination, your right
              to use the Service ends immediately. Sections 6, 9, 10, and 13
              survive termination.
            </p>

            <H3>12. Changes to These Terms</H3>
            <p>
              We may revise these Terms at any time by posting an updated
              version on this page with a new effective date. For material
              changes we will notify you by email or a notice in the dashboard.
              Continued use after the effective date constitutes acceptance of
              the revised Terms.
            </p>

            <H3>13. Governing Law</H3>
            <p>
              These Terms are governed by the laws of the Province of Ontario
              and the federal laws of Canada applicable therein, without regard
              to conflict-of-law principles. Disputes shall be resolved
              exclusively in the courts located in Ontario, and each party
              consents to the jurisdiction of those courts.
            </p>

            <H3>14. Contact</H3>
            <p>
              Questions about these Terms?{" "}
              <a href="mailto:legal@betteragent.dev">legal@betteragent.dev</a>
            </p>
          </Prose>
        </div>
      </section>
    </>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-mono font-semibold text-[17px] tracking-[-0.01em] mt-10 mb-3">
      {children}
    </h3>
  );
}

function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 rounded-md border border-dashed border-amber-500/60 bg-amber-500/10 px-3 py-2 font-mono text-[13px] leading-relaxed text-amber-700 dark:text-amber-400">
      <span className="font-semibold">PLACEHOLDER · </span>
      {children}
    </div>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-sans text-[15px] leading-[1.7] text-foreground [&_p]:text-muted-foreground [&_p]:mb-4 [&_ul]:text-muted-foreground [&_ul]:mb-4 [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:list-disc [&_a]:text-foreground [&_a]:underline [&_a:hover]:text-primary">
      {children}
    </div>
  );
}
