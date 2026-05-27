import Link from "next/link";
import {
  AuthShell,
  AuthTerminal,
  SIGNIN_TERMINAL,
  SigninForm,
} from "@/components/public/auth";

export default function SignInPage() {
  return (
    <AuthShell
      badges={[{ label: "live", tone: "live" }, { label: "us-east-1 · 42ms" }]}
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
