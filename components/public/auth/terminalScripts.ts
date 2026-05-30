import type { TerminalLine } from "./AuthTerminal";

export const SIGNIN_TERMINAL: TerminalLine[] = [
  { tone: "comment", text: "# Waiting for credentials..." },
  { tone: "prompt", text: "auth.signIn({" },
  { tone: "code", text: '  email: "you@example.com",' },
  { tone: "code", text: '  password: "••••••••"' },
  { tone: "code", text: "})", pauseAfterMs: 400 },
  { tone: "comment", text: "# Verifying identity..." },
  { tone: "success", text: "session created · expires in 7d" },
  { tone: "success", text: "redirecting to dashboard" },
];

export const SIGNUP_TERMINAL: TerminalLine[] = [
  { tone: "comment", text: "# Creating your account..." },
  { tone: "prompt", text: "account.create({" },
  { tone: "code", text: '  email: "you@example.com",' },
  { tone: "code", text: '  plan: "free"' },
  { tone: "code", text: "})", pauseAfterMs: 400 },
  { tone: "success", text: "account created" },
  { tone: "success", text: "verification email dispatched" },
  { tone: "comment", text: "# Free plan — 500 credits/mo, no card required." },
];

export const FORGOT_TERMINAL: TerminalLine[] = [
  { tone: "comment", text: "# Looking up account..." },
  { tone: "prompt", text: "auth.password.requestReset({" },
  { tone: "code", text: '  email: "you@example.com"' },
  { tone: "code", text: "})", pauseAfterMs: 400 },
  { tone: "success", text: "reset code generated (expires in 10m)" },
  { tone: "success", text: "dispatched via resend" },
  {
    tone: "comment",
    text: "# Check spam if it doesn't arrive within a minute.",
  },
];

export const RESET_TERMINAL: TerminalLine[] = [
  { tone: "comment", text: "# Verifying reset code..." },
  { tone: "prompt", text: "auth.password.reset({" },
  { tone: "code", text: '  email: "you@example.com",' },
  { tone: "code", text: '  code: "••••••",' },
  { tone: "code", text: '  password: "••••••••"' },
  { tone: "code", text: "})", pauseAfterMs: 400 },
  { tone: "success", text: "password updated" },
  { tone: "comment", text: "# Sign in with your new password." },
];

export const VERIFY_TERMINAL: TerminalLine[] = [
  { tone: "comment", text: "# Sending verification OTP..." },
  { tone: "prompt", text: "resend.emails.send({" },
  { tone: "code", text: '  to: "you@example.com",' },
  { tone: "code", text: '  template: "emailVerification"' },
  { tone: "code", text: "})", pauseAfterMs: 400 },
  { tone: "success", text: "queued · message-id a91f3c" },
  { tone: "success", text: "delivered to inbox" },
  { tone: "comment", text: "# Enter the 6-digit code to verify your email." },
  { tone: "muted", text: "listening •••" },
];
