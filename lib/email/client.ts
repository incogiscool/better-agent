import { Resend } from "resend";
import { FROM_EMAIL } from "@/lib/site";

let _resend: Resend | null = null;

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!_resend) _resend = new Resend(key);
  return _resend;
}

type SendEmailParams = {
  to: string;
  subject: string;
  text: string;
};

export async function sendEmail(params: SendEmailParams): Promise<void> {
  const client = getResend();
  if (!client) {
    console.log(`[email] ${params.to} | ${params.subject}`);
    return;
  }
  await client.emails.send({
    from: FROM_EMAIL,
    ...params,
  });
}
