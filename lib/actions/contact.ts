"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { sendEmail } from "@/lib/email/client";
import { checkRateLimit, contactLimiter } from "@/lib/ratelimit";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(100),
  email: z.string().email("Enter a valid email address."),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters.")
    .max(5000),
});

export type ContactFormState = {
  success?: boolean;
  submittedEmail?: string;
  message?: string;
  errors?: {
    name?: string[];
    email?: string[];
    message?: string[];
  };
};

export async function contactAction(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown";

  const rl = await checkRateLimit(contactLimiter, `contact:${ip}`);
  if (rl.limited) {
    return {
      message: "Too many messages. Please wait a few minutes before trying again.",
    };
  }

  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, message } = parsed.data;

  const isCreditsRequest = formData.get("topic") === "credits";
  const subject = isCreditsRequest
    ? `Credits request: ${name}`
    : `Contact form: ${name}`;

  await sendEmail({
    to: "support@betteragent.dev",
    subject,
    text: `From: ${name} <${email}>\n\n${message}`,
  });

  return { success: true, submittedEmail: email };
}
