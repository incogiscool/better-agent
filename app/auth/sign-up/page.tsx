import Link from "next/link";
import type { Metadata } from "next";
import {
  AuthShell,
  AuthTerminal,
  SIGNUP_TERMINAL,
  SignupForm,
} from "@/components/public/auth";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a BetterAgent account and ship an agent inside your SaaS.",
  robots: { index: false, follow: true },
};

export default function SignUpPage() {
  return (
    <AuthShell
      terminal={
        <AuthTerminal
          title="creation.log"
          // rightLabel="agent · workspace.create"
          lines={SIGNUP_TERMINAL}
        />
      }
      footer={
        <div className="flex items-center gap-3">
          <Link href="/auth/sign-in" className="hover:text-foreground">
            Already have an account? Sign in
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
      <SignupForm callbackURL="/dashboard/projects/new" />
    </AuthShell>
  );
}
