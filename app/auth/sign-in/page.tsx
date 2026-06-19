import Link from "next/link";
import type { Metadata } from "next";
import {
  AuthShell,
  AuthTerminal,
  SIGNIN_TERMINAL,
  SigninForm,
} from "@/components/public/auth";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your BetterAgent dashboard.",
  robots: { index: false, follow: true },
};

export default function SignInPage() {
  return (
    <AuthShell
      terminal={
        <AuthTerminal
          title="betteragent.auth"
          // rightLabel="agent · auth.session"
          lines={SIGNIN_TERMINAL}
        />
      }
      footer={
        <div className="flex items-center gap-3">
          <Link href="/auth/sign-up" className="hover:text-foreground">
            New here? Create an account
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
        </div>
      }
    >
      <SigninForm />
    </AuthShell>
  );
}
