import type { TerminalLine } from "./AuthTerminal";

export const SIGNIN_TERMINAL: TerminalLine[] = [
  { tone: "comment", text: "# Waiting for credentials..." },
  { tone: "prompt", text: "auth.session.create({" },
  { tone: "code", text: '  email: "dax@cassio.dev",' },
  { tone: "code", text: '  workspace: "cassio-prod"' },
  { tone: "code", text: "})", pauseAfterMs: 400 },
  { tone: "comment", text: "# Verifying scopes: agent:run, tools:read" },
  { tone: "success", text: "mfa challenge sent to +1 ••• ••• 4419" },
  { tone: "success", text: "session bound to device macbook-pro · sf" },
];

export const SIGNUP_TERMINAL: TerminalLine[] = [
  { tone: "comment", text: "# Provisioning workspace..." },
  { tone: "prompt", text: "workspace.create({" },
  { tone: "code", text: '  slug: "cassio",' },
  { tone: "code", text: '  plan: "hobby"' },
  { tone: "code", text: "})", pauseAfterMs: 400 },
  { tone: "success", text: "workspace cassio reserved" },
  { tone: "success", text: "seeded with 1 agent · 0 tools · 0 routes" },
  { tone: "comment", text: "# Free tier — 10k agent calls/mo, no card required." },
];

export const FORGOT_TERMINAL: TerminalLine[] = [
  { tone: "comment", text: "# Looking up account..." },
  { tone: "prompt", text: "auth.reset.request({" },
  { tone: "code", text: '  email: "dax@cassio.dev"' },
  { tone: "code", text: "})", pauseAfterMs: 400 },
  { tone: "success", text: "reset token signed (expires in 15m)" },
  { tone: "success", text: "dispatch to mail.relay" },
  { tone: "comment", text: "# If no email arrives, check spam or contact support." },
];

export const VERIFY_TERMINAL: TerminalLine[] = [
  { tone: "comment", text: "# Verification mail sent." },
  { tone: "prompt", text: "mail.send({" },
  { tone: "code", text: '  to: "dax@cassio.dev",' },
  { tone: "code", text: '  template: "verify_email"' },
  { tone: "code", text: "})", pauseAfterMs: 400 },
  { tone: "success", text: "queued (smtp #a91f)" },
  { tone: "success", text: "accepted by gmail-smtp-in.l.google.com" },
  { tone: "comment", text: "# Waiting for OTP entry or click-through..." },
  { tone: "muted", text: "listening •••" },
];
