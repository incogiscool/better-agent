import { Eyebrow, WRAP, SEC } from "@/components/landing/primitives";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Privacy Policy — BetterAgent",
  description: "How BetterAgent collects, uses, and protects your data.",
};

const EFFECTIVE_DATE = "May 26, 2026";

export default function PrivacyPage() {
  return (
    <>
      <section className="pt-20 pb-14 border-b border-border">
        <div className={cn(WRAP, "max-w-[760px]")}>
          <div className="flex flex-col gap-4">
            <Eyebrow>Legal</Eyebrow>
            <h1 className="font-mono font-medium text-[48px] leading-[1.06] tracking-[-0.03em] m-0">
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
              (the &ldquo;Service&rdquo;). BetterAgent is operated from Ontario,
              Canada.
            </p>
            <Placeholder>
              Confirm the legal operating entity (sole proprietorship vs.
              incorporated company) and insert its legal name here.
            </Placeholder>

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
            <Placeholder>
              Paid billing is not yet active. When it launches: payment
              information will be collected by Stripe on our behalf, and we will
              store only a Stripe customer ID and subscription status.
            </Placeholder>
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
              dashboard. See &ldquo;Data Retention&rdquo; below.
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
                Improve the Service through aggregated, anonymized usage
                analytics.
              </li>
            </ul>
            <Placeholder>
              Not yet implemented: payment processing and billing-related
              emails (credit warnings, payment receipts, security alerts). Add
              these uses when the billing and notification systems ship.
            </Placeholder>
            <p>
              We do not use conversation content to train AI models.
            </p>

            <H3>3. Information Sharing</H3>
            <p>
              We do not sell personal information. We share data only with:
            </p>
            <ul>
              <li>
                <strong>Service providers</strong> necessary to operate the
                platform: Anthropic (AI inference), Neon (database hosting),
                Upstash (rate limiting), Resend (email), and our hosting
                provider. We enter into data processing agreements with these
                providers where applicable.
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
            <Placeholder>
              Add Stripe (billing) to this list when paid plans launch.
            </Placeholder>

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
              Account and configuration data is retained for as long as your
              account is active. When you delete your account from the
              dashboard, your data — including projects, tools, and conversation
              history — is permanently deleted. We do not currently keep a
              recovery copy after deletion.
            </p>
            <Placeholder>
              Automated retention schedules are not yet implemented. When they
              are, document the default windows here (e.g., conversation
              history and usage-log retention periods).
            </Placeholder>

            <H3>6. Your Rights</H3>
            <p>
              Under Canada&rsquo;s Personal Information Protection and Electronic
              Documents Act (PIPEDA) and, depending on where you live, other
              applicable laws, you may have rights to access, correct, or delete
              your personal data, or to receive a portable copy of it. You can
              delete your account and its data directly from the dashboard. For
              other requests, email{" "}
              <a href="mailto:privacy@betteragent.dev">
                privacy@betteragent.dev
              </a>
              . We will respond within 30 days.
            </p>
            <p>
              If you have a concern we have not resolved, you may contact the
              Office of the Privacy Commissioner of Canada.
            </p>

            <H3>7. Cookies and Tracking</H3>
            <p>
              We use strictly-necessary cookies to maintain your session. We do
              not use third-party advertising cookies or cross-site tracking.
              You can control cookie preferences in your browser settings, though
              disabling session cookies will prevent you from logging in.
            </p>
            <Placeholder>
              We do not currently use any web analytics. If self-hosted or
              privacy-respecting analytics are added later, describe them here.
            </Placeholder>

            <H3>8. Children&rsquo;s Privacy</H3>
            <p>
              The Service is not directed to children under 16. We do not
              knowingly collect personal information from anyone under 16. If
              you believe we have done so, contact us and we will delete the
              data.
            </p>

            <H3>9. International Transfers</H3>
            <p>
              BetterAgent operates in Canada. If you access the Service from
              outside Canada, your information will be transferred to and
              processed in Canada. By using the Service you consent to this
              transfer.
            </p>
            <Placeholder>
              If you serve EEA/UK users, confirm the cross-border transfer basis
              here. Note Canada has a partial EU adequacy decision, which may
              remove the need for Standard Contractual Clauses.
            </Placeholder>

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
              <a href="mailto:privacy@betteragent.dev">
                privacy@betteragent.dev
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
    <div className="font-sans text-[15px] leading-[1.7] text-foreground [&_p]:text-muted-foreground [&_p]:mb-4 [&_ul]:text-muted-foreground [&_ul]:mb-4 [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:list-disc [&_a]:text-foreground [&_a]:underline [&_a:hover]:text-primary [&_strong]:text-foreground">
      {children}
    </div>
  );
}
