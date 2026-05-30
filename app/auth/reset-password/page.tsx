import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import {
  AuthShell,
  AuthTerminal,
  RESET_TERMINAL,
  ResetPasswordForm,
} from "@/components/public/auth";

interface ResetPasswordPageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { email } = await searchParams;

  // No email in the URL means the user landed here without requesting a reset.
  if (!email) {
    redirect("/auth/forgot-password");
  }

  return (
    <AuthShell
      badges={[{ label: "otp · 6 digits" }]}
      terminal={
        <AuthTerminal
          title="auth.log"
          rightLabel="agent · auth.reset"
          lines={RESET_TERMINAL}
        />
      }
      footer={<span>Code expires in 10 minutes.</span>}
    >
      <div className="space-y-6">
        <ResetPasswordForm email={email} />
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
