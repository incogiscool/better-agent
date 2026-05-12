import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import {
  AuthShell,
  AuthTerminal,
  FORGOT_TERMINAL,
  ForgotPasswordForm,
} from "@/components/public/auth";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      badges={[
        { label: "dispatched", tone: "live" },
        { label: "queued · 0s" },
      ]}
      terminal={
        <AuthTerminal
          title="auth.log"
          rightLabel="agent · auth.reset"
          lines={FORGOT_TERMINAL}
        />
      }
      footer={
        <span>Lost access to your email? Contact support.</span>
      }
    >
      <div className="space-y-6">
        <ForgotPasswordForm />
        <Link
          href="/auth/sign-in"
          className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={12} />
          Back to sign in
        </Link>
      </div>
    </AuthShell>
  );
}
