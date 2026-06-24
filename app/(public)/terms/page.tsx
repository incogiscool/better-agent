import { Eyebrow, WRAP, SEC } from "@/components/landing/primitives";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using BetterAgent.",
};

const EFFECTIVE_DATE = "June 24, 2026";

export default function TermsPage() {
  return (
    <>
      <section className="pt-12 md:pt-20 pb-14 border-b border-border">
        <div className={cn(WRAP, "max-w-[760px]")}>
          <div className="flex flex-col gap-4">
            <Eyebrow>Legal</Eyebrow>
            <h1 className="font-mono font-medium text-[clamp(30px,6vw,48px)] leading-[1.06] tracking-[-0.03em] m-0">
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
              (the &ldquo;Service&rdquo;). BetterAgent is operated by an
              individual (sole proprietor) based in Ontario, Canada. By creating
              an account or using the Service you agree to these Terms. If you do
              not agree, do not use the Service.
            </p>

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
            <p>
              You must be at least the age of majority in your jurisdiction, or
              old enough to form a binding contract, to use the Service.
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
            <p>
              We may add, change, or discontinue features of the Service at any
              time. We will give reasonable notice of changes that materially
              reduce core functionality of a paid plan.
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

            <H3>4. Credits, Plans, and Billing</H3>
            <p>
              The Service operates on a credit system. Credits are consumed per
              agent event (conversation start, message, tool call) and certain
              other agent operations. Free-plan accounts receive 500 credits per
              30-day period. Unused credits do not roll over.
            </p>
            <p>
              <strong>Paid plans.</strong> Paid plans are billed as recurring
              monthly subscriptions on a per-project basis. Current plans,
              included credits, and prices are shown at{" "}
              <a href="/pricing">betteragent.dev/pricing</a> and may change as
              described below. Each paid subscription renews automatically every
              month until you cancel.
            </p>
            <p>
              <strong>Payment processing.</strong> Payments are processed by our
              payment provider, Stripe. By subscribing you authorize us, through
              Stripe, to charge your payment method for the applicable fees, and
              you agree to Stripe&rsquo;s terms. We do not receive or store full
              payment card numbers; Stripe handles card data directly.
            </p>
            <p>
              <strong>Overage.</strong> Plans that permit overage are billed in
              arrears for usage beyond included credits, at the per-credit
              overage rate posted on the pricing page. Plans without overage are
              hard-capped: once included credits are exhausted, agent requests
              are declined until the next period or an upgrade.
            </p>
            <p>
              <strong>Taxes.</strong> Prices are exclusive of taxes unless
              stated otherwise. You are responsible for any sales, use,
              value-added, GST/HST, or similar taxes associated with your
              subscription, except for taxes based on our net income.
            </p>
            <p>
              <strong>Cancellation and refunds.</strong> You may cancel a paid
              plan at any time from the billing portal in your dashboard.
              Cancellation takes effect at the end of the current billing
              period, and you retain access to the paid plan until then. Except
              where required by law, fees already paid are non-refundable and we
              do not provide prorated refunds for partial periods.
            </p>
            <p>
              <strong>Failed payments.</strong> If a charge fails, we may retry
              it, suspend access to paid features, or downgrade the project to
              the free plan.
            </p>
            <p>
              <strong>Price changes.</strong> We may change plan prices or the
              credit allowances of a plan. We will give advance notice of
              changes that affect your active subscription, and changes take
              effect on your next renewal. Continued use after a price change
              takes effect constitutes acceptance.
            </p>

            <H3>5. API Keys and Client Keys</H3>
            <p>
              You are responsible for keeping your secret API keys confidential.
              Do not commit keys to public source repositories. Client
              (publishable) keys are designed to be used in client-side code. If
              a key is compromised, rotate it immediately in the dashboard. We
              are not liable for charges or damage caused by key exposure.
            </p>

            <H3>6. Your End Users</H3>
            <p>
              If you use the Service to operate an agent inside your own
              application, the people who interact with that agent are your end
              users. As between you and us, you are responsible for those end
              users and for the data you and they send through the Service. You
              must maintain your own privacy notice and obtain any consents or
              other legal bases required to collect their data and have it
              processed by the Service on your behalf.
            </p>
            <p>
              We process end-user conversation data on your behalf solely to
              provide the Service to you (see our{" "}
              <a href="/privacy">Privacy Policy</a>). You will not send us
              special categories of personal data or data subject to
              heightened legal protection unless we have agreed in writing to
              handle it.
            </p>

            <H3>7. Intellectual Property</H3>
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

            <H3>8. Privacy</H3>
            <p>
              Your use of the Service is subject to our{" "}
              <a href="/privacy">Privacy Policy</a>, which is incorporated by
              reference.
            </p>

            <H3>9. Third-Party Services</H3>
            <p>
              The Service integrates with third-party services, including
              Anthropic (AI models), Stripe (payments), Resend (email), PostHog
              (product analytics), and Google and GitHub (optional OAuth
              sign-in). Your use of those services is governed by their own
              terms and privacy policies. We are not responsible for the
              practices of third parties.
            </p>

            <H3>10. Disclaimers</H3>
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

            <H3>11. Limitation of Liability</H3>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, BETTERAGENT&rsquo;S
              AGGREGATE LIABILITY FOR CLAIMS ARISING FROM OR RELATED TO THESE
              TERMS OR THE SERVICE IS LIMITED TO THE GREATER OF THE AMOUNT YOU
              PAID US IN THE 12 MONTHS PRECEDING THE CLAIM OR CAD $100. IN NO
              EVENT WILL BETTERAGENT BE LIABLE FOR INDIRECT, INCIDENTAL,
              SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES. Some jurisdictions do
              not allow certain limitations, so parts of this section may not
              apply to you.
            </p>

            <H3>12. Indemnification</H3>
            <p>
              You agree to indemnify and hold harmless BetterAgent from and
              against any claims, damages, liabilities, and reasonable expenses
              (including legal fees) arising out of your use of the Service,
              your content, your end users, or your violation of these Terms or
              of any law or third-party right.
            </p>

            <H3>13. Termination</H3>
            <p>
              You may stop using the Service and close your account at any
              time. We may suspend or terminate your access if you violate
              these Terms, with or without notice. Upon termination, your right
              to use the Service ends immediately. Sections that by their nature
              should survive — including Intellectual Property, Disclaimers,
              Limitation of Liability, Indemnification, and Governing Law —
              survive termination.
            </p>

            <H3>14. Changes to These Terms</H3>
            <p>
              We may revise these Terms at any time by posting an updated
              version on this page with a new effective date. For material
              changes we will notify you by email or a notice in the dashboard.
              Continued use after the effective date constitutes acceptance of
              the revised Terms.
            </p>

            <H3>15. Governing Law</H3>
            <p>
              These Terms are governed by the laws of the Province of Ontario
              and the federal laws of Canada applicable therein, without regard
              to conflict-of-law principles. Disputes shall be resolved
              exclusively in the courts located in Ontario, and each party
              consents to the jurisdiction of those courts. Nothing in these
              Terms removes mandatory consumer-protection rights you may have
              under the laws of your place of residence.
            </p>

            <H3>16. General</H3>
            <p>
              These Terms, together with the Privacy Policy, are the entire
              agreement between you and us regarding the Service. If any
              provision is held unenforceable, the remaining provisions stay in
              effect. Our failure to enforce a provision is not a waiver of it.
              You may not assign these Terms without our consent; we may assign
              them in connection with a merger, acquisition, or sale of assets.
              We are not liable for delays or failures caused by events beyond
              our reasonable control.
            </p>

            <H3>17. Contact</H3>
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

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-sans text-[15px] leading-[1.7] text-foreground [&_p]:text-muted-foreground [&_p]:mb-4 [&_ul]:text-muted-foreground [&_ul]:mb-4 [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:list-disc [&_a]:text-foreground [&_a]:underline [&_a:hover]:text-primary [&_strong]:text-foreground">
      {children}
    </div>
  );
}
