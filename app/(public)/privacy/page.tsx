import { Eyebrow, WRAP, SEC } from "@/components/landing/primitives";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Privacy Policy",
  description: "How BetterAgent collects, uses, and protects your data.",
};

const EFFECTIVE_DATE = "June 24, 2026";

export default function PrivacyPage() {
  return (
    <>
      <section className="pt-12 md:pt-20 pb-14 border-b border-border">
        <div className={cn(WRAP, "max-w-[760px]")}>
          <div className="flex flex-col gap-4">
            <Eyebrow>Legal</Eyebrow>
            <h1 className="font-mono font-medium text-[clamp(30px,6vw,48px)] leading-[1.06] tracking-[-0.03em] m-0">
              Privacy Policy
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
              This Privacy Policy describes how BetterAgent (&ldquo;we&rdquo;,
              &ldquo;us&rdquo;, &ldquo;our&rdquo;) collects, uses, and shares
              information when you use betteragent.dev and related services
              (the &ldquo;Service&rdquo;). BetterAgent is operated by an
              individual (sole proprietor) based in Ontario, Canada.
            </p>
            <p>
              This policy describes how we handle data for which we are the
              controller — primarily account holders&rsquo; data. When you
              deploy an agent in your own application, we process your end
              users&rsquo; conversation data on your behalf, as your processor;
              you remain responsible for your own privacy notice and legal basis
              for that data (see &ldquo;Conversation data&rdquo; below and the{" "}
              <a href="/terms">Terms of Service</a>).
            </p>

            <H3>1. Information We Collect</H3>
            <p>
              <strong>Account information.</strong> When you register, we
              collect your email address and name. If you sign up with email and
              password, we store a securely hashed password. You may also sign
              in with Google or GitHub, in which case we store an account
              identifier from that provider and the OAuth tokens needed to
              authenticate you. Authentication is handled by our self-hosted
              auth layer (better-auth).
            </p>
            <p>
              <strong>Billing information.</strong> When you subscribe to a paid
              plan, payments are processed by Stripe. We do not receive or store
              your full payment card number; Stripe handles card data directly.
              We store a Stripe customer identifier, your subscription plan and
              status, billing period, and the email associated with billing.
            </p>
            <p>
              <strong>Usage data.</strong> We log API requests, credit
              consumption events, tool executions, and error traces associated
              with your account. This includes request timestamps, tool names,
              status codes, durations, and token/credit counts.
            </p>
            <p>
              <strong>Project and configuration data.</strong> Projects, tool
              schemas, overrides, system prompts, and other configuration you
              save in the dashboard are stored in our database.
            </p>
            <p>
              <strong>Conversation data (end users).</strong> When a user of
              your application sends a message to an agent, we store that
              message, the agent&rsquo;s response, and the inputs and outputs of
              any tools the agent calls. We retain this conversation history to
              power multi-turn context and to display run history in your
              dashboard. We process this data on your behalf as your processor;
              you are responsible for the lawful basis and any notices required
              for your end users. See &ldquo;Data Retention&rdquo; below.
            </p>
            <p>
              <strong>Product analytics.</strong> We use PostHog to understand
              how the dashboard and marketing site are used and to capture error
              diagnostics. This includes events such as page views and feature
              interactions, along with a device/browser identifier. Analytics
              requests are routed through our own domain.
            </p>
            <p>
              <strong>Technical data.</strong> We store the IP address and
              browser user-agent associated with your active login sessions for
              security purposes. Our hosting provider may also retain standard
              server logs.
            </p>

            <H3>2. How We Use Information</H3>
            <ul>
              <li>Authenticate you and operate your account.</li>
              <li>Process payments and manage paid subscriptions.</li>
              <li>Enforce plan credit limits and prevent overuse.</li>
              <li>
                Route agent requests and return responses to your application.
              </li>
              <li>
                Provide dashboard analytics (run history, tool usage, credit
                spend).
              </li>
              <li>
                Send account emails such as email-verification and sign-in
                codes (via Resend).
              </li>
              <li>
                Detect and prevent abuse, fraud, and policy violations.
              </li>
              <li>
                Understand and improve the Service through product analytics and
                error diagnostics.
              </li>
              <li>
                Send operational account emails, such as credit-limit warnings.
              </li>
            </ul>
            <p>
              We do not use conversation content to train AI models.
            </p>
            <p>
              Where the law requires a legal basis (such as the EU/UK GDPR), we
              rely on performance of our contract with you, our legitimate
              interests in operating and securing the Service, compliance with
              legal obligations, and your consent where applicable.
            </p>

            <H3>3. Information Sharing and Subprocessors</H3>
            <p>
              We do not sell personal information. We share data only with:
            </p>
            <ul>
              <li>
                <strong>Service providers (subprocessors)</strong> necessary to
                operate the platform: Anthropic (AI inference), Stripe
                (payments), Neon (database hosting), Upstash (rate limiting),
                Resend (email), PostHog (product analytics), and Vercel
                (application hosting). We enter into data processing agreements
                with these providers where applicable.
              </li>
              <li>
                <strong>Legal and safety.</strong> We may disclose data when
                required by law, subpoena, or to protect the rights, property,
                or safety of BetterAgent, our users, or the public.
              </li>
              <li>
                <strong>Business transfers.</strong> If BetterAgent is acquired
                or merges, data may be transferred as part of the transaction.
                We will notify affected users beforehand.
              </li>
            </ul>

            <H3>4. Data Security</H3>
            <p>
              We use industry-standard measures including TLS in transit,
              encryption at rest, and least-privilege access controls. Project
              secret keys are stored only as one-way hashes (scrypt) and cannot
              be recovered by us; publishable client keys are stored as-is,
              since they are designed to be exposed in client-side code.
            </p>
            <p>
              No method of transmission over the internet is completely secure.
              You are responsible for maintaining the confidentiality of your
              credentials and API keys.
            </p>

            <H3>5. Data Retention</H3>
            <p>
              Account, configuration, conversation, and usage data is retained
              for as long as your account is active. We do not currently enforce
              automated time-based deletion windows. When you delete your
              account or a project from the dashboard, the associated data —
              including projects, tools, conversation history, and usage logs —
              is permanently deleted. We do not keep a recovery copy after
              deletion. We may retain limited billing records where required for
              tax or accounting purposes.
            </p>

            <H3>6. Your Rights</H3>
            <p>
              Under Canada&rsquo;s Personal Information Protection and Electronic
              Documents Act (PIPEDA) and, depending on where you live, other
              laws such as the EU/UK GDPR or U.S. state privacy laws, you may
              have rights to access, correct, delete, or port your personal
              data, to object to or restrict certain processing, and to withdraw
              consent. You can delete your account and its data directly from the
              dashboard. For other requests, email{" "}
              <a href="mailto:legal@betteragent.dev">
                legal@betteragent.dev
              </a>
              . We will respond within the timeframe required by applicable law,
              and within 30 days where no specific period applies.
            </p>
            <p>
              If you are an end user of an application built on BetterAgent,
              please direct privacy requests to the operator of that
              application, who is the controller of your data; we will assist
              them as their processor.
            </p>
            <p>
              If you have a concern we have not resolved, you may contact the
              Office of the Privacy Commissioner of Canada or your local data
              protection authority.
            </p>

            <H3>7. Cookies and Tracking</H3>
            <p>
              We use strictly-necessary cookies to maintain your session, and
              analytics cookies/identifiers from PostHog to measure product
              usage. We do not use advertising cookies or sell your data for
              cross-context behavioural advertising. You can control cookies in
              your browser settings, though disabling session cookies will
              prevent you from logging in.
            </p>

            <H3>8. Children&rsquo;s Privacy</H3>
            <p>
              The Service is not directed to children under 16. We do not
              knowingly collect personal information from anyone under 16. If
              you believe we have done so, contact us and we will delete the
              data.
            </p>

            <H3>9. International Transfers</H3>
            <p>
              BetterAgent operates in Canada, and our subprocessors may process
              data in the United States and elsewhere. If you access the Service
              from outside Canada — including from the EU or UK — your
              information will be transferred to and processed in Canada, the
              United States, and other countries where we or our subprocessors
              operate. We rely on appropriate safeguards for these transfers,
              such as adequacy decisions or standard contractual clauses, where
              required by law. By using the Service you consent to these
              transfers.
            </p>

            <H3>10. Changes to This Policy</H3>
            <p>
              We may update this Privacy Policy from time to time. Material
              changes will be announced by email or a dashboard notice at least
              14 days before they take effect. The updated policy will be posted
              on this page with a new effective date.
            </p>

            <H3>11. Contact</H3>
            <p>
              Questions or requests relating to privacy:{" "}
              <a href="mailto:legal@betteragent.dev">
                legal@betteragent.dev
              </a>
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
