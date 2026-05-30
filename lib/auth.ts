import { betterAuth } from "better-auth";
import { FROM_EMAIL } from "@/lib/site";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { Resend } from "resend";
import { prisma } from "./db";
import { emailOTP } from "better-auth/plugins";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

const socialProviders: Record<
  string,
  { clientId: string; clientSecret: string }
> = {};

if (googleClientId && googleClientSecret) {
  socialProviders.google = {
    clientId: googleClientId,
    clientSecret: googleClientSecret,
  };
}

if (githubClientId && githubClientSecret) {
  socialProviders.github = {
    clientId: githubClientId,
    clientSecret: githubClientSecret,
  };
}

function buildTrustedOrigins(): string[] {
  const origins: string[] = [];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) origins.push(appUrl);
  // Vercel preview deployments use a different origin per branch.
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) origins.push(`https://${vercelUrl}`);
  return origins;
}

export const auth = betterAuth({
  appName: "BetterAgent",
  trustedOrigins: buildTrustedOrigins(),
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    modelName: "user",
    // Account deletion is exposed in dashboard settings and promised in the
    // privacy policy. Email/password users are deleted immediately after
    // re-entering their password; OAuth-only users get a confirmation email.
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url }) => {
        const client = getResend();
        if (!client) {
          console.log(`[auth] delete-account verification for ${user.email}: ${url}`);
          return;
        }
        await client.emails.send({
          from: FROM_EMAIL,
          to: user.email,
          subject: "Confirm your BetterAgent account deletion",
          text: `You requested to delete your BetterAgent account.\n\nConfirm here: ${url}\n\nIf you didn't request this, you can safely ignore this email — no changes will be made.`,
        });
      },
    },
  },
  session: {
    modelName: "session",
  },
  account: {
    modelName: "account",
    accountLinking: {
      enabled: true,
    },
  },
  verification: {
    modelName: "verification",
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    // The supported reset flow is OTP-based (see emailOTP plugin + the
    // /auth/reset-password page). This link-based handler is a fallback so the
    // path is never silently dead if it is ever triggered.
    sendResetPassword: async ({ user, url }) => {
      const client = getResend();
      if (!client) {
        console.log(`[auth] password reset for ${user.email}: ${url}`);
        return;
      }
      await client.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: "Reset your BetterAgent password",
        text: `We received a request to reset your BetterAgent password.\n\nReset it here: ${url}\n\nIf you didn't request this, you can safely ignore this email.`,
      });
    },
  },
  socialProviders:
    Object.keys(socialProviders).length > 0 ? socialProviders : undefined,

  plugins: [
    nextCookies(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        const client = getResend();
        if (!client) {
          console.log(`[auth] OTP for ${email} (type=${type}): ${otp}`);
          return;
        }
        const subjects: Record<string, string> = {
          "email-verification": "Verify your BetterAgent email",
          "sign-in": "Your BetterAgent sign-in code",
          "forget-password": "Reset your BetterAgent password",
        };
        await client.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: subjects[type] ?? "Your BetterAgent code",
          text: `Your verification code is: ${otp}\n\nThis code expires in 10 minutes.`,
        });
      },
    }),
  ],
});
