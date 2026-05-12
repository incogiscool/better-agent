"use client";

import { useRouter } from "next/navigation";
import { useSendVerificationOtp, useVerifyEmail } from "@/lib/auth/mutations";
import { VerifyForm } from "@/components/public/auth";

interface CheckInboxClientProps {
  email: string;
  callbackURL?: string;
}

export function CheckInboxClient({
  email,
  callbackURL = "/dashboard",
}: CheckInboxClientProps) {
  const router = useRouter();
  const verifyEmail = useVerifyEmail();
  const sendOtp = useSendVerificationOtp();

  const handleVerify = async (otp: string) => {
    await verifyEmail.mutateAsync({ email, otp });
    router.push(callbackURL);
    router.refresh();
  };

  const handleResend = async () => {
    await sendOtp.mutateAsync({ email, type: "email-verification" });
  };

  return (
    <VerifyForm email={email} onVerify={handleVerify} onResend={handleResend} />
  );
}
