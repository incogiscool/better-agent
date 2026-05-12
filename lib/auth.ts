import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { Resend } from "resend";
import { prisma } from "./db";
import { emailOTP } from "better-auth/plugins";

const resend = new Resend(process.env.RESEND_API_KEY);

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

export const auth = betterAuth({
  appName: "BetterAgent",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    modelName: "user",
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
    sendResetPassword: async ({ user, url }) => {
      console.log(`[auth] password reset for ${user.email}: ${url}`);
    },
  },
  socialProviders:
    Object.keys(socialProviders).length > 0 ? socialProviders : undefined,

  plugins: [
    nextCookies(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        const subjects: Record<string, string> = {
          "email-verification": "Verify your BetterAgent email",
          "sign-in": "Your BetterAgent sign-in code",
          "forget-password": "Reset your BetterAgent password",
        };
        await resend.emails.send({
          from: "BetterAgent <noreply@betteragent.dev>",
          to: email,
          subject: subjects[type] ?? "Your BetterAgent code",
          text: `Your verification code is: ${otp}\n\nThis code expires in 10 minutes.`,
        });
      },
    }),
  ],
});
