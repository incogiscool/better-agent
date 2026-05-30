import { AuthShell, AuthTerminal, VERIFY_TERMINAL } from "@/components/public/auth";
import { CheckInboxClient } from "./CheckInboxClient";

interface CheckInboxPageProps {
  searchParams: Promise<{ email?: string; callbackURL?: string }>;
}

export default async function CheckInboxPage({
  searchParams,
}: CheckInboxPageProps) {
  const { email, callbackURL } = await searchParams;
  const targetEmail = email ?? "your email";

  return (
    <AuthShell
      badges={[{ label: "otp · 6 digits" }]}
      terminal={
        <AuthTerminal
          title="mail.log"
          rightLabel="agent · mail.verify"
          lines={VERIFY_TERMINAL}
        />
      }
      footer={<span>Code expires in 10 minutes.</span>}
    >
      <CheckInboxClient email={targetEmail} callbackURL={callbackURL} />
    </AuthShell>
  );
}
