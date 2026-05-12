"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { verifyCodeSchema } from "@/lib/schemas/auth";

const RESEND_SECONDS = 60;
const CODE_LENGTH = 6;

type VerifyFormValues = z.infer<typeof verifyCodeSchema>;

interface VerifyFormProps {
  email: string;
  onVerify?: (code: string) => Promise<void>;
  onResend?: () => Promise<void>;
}

export function VerifyForm({ email, onVerify, onResend }: VerifyFormProps) {
  const [resendIn, setResendIn] = React.useState(RESEND_SECONDS);

  const form = useForm<VerifyFormValues>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: { code: "" },
  });

  const verify = useMutation({
    mutationFn: async (code: string) => {
      if (!onVerify) {
        throw new Error(
          "Verification is link-based. Use the link sent to your email.",
        );
      }
      await onVerify(code);
    },
  });

  const resend = useMutation({
    mutationFn: async () => {
      if (!onResend) return;
      await onResend();
    },
    onSuccess: () => setResendIn(RESEND_SECONDS),
  });

  React.useEffect(() => {
    if (resendIn <= 0) return;
    const id = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [resendIn]);

  const onSubmit = (values: VerifyFormValues) => {
    verify.mutate(values.code);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-[10px] tracking-wide text-muted-foreground">
          /VERIFY
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Check your inbox.
        </h1>
        <p className="text-xs text-muted-foreground">
          Sent a 6-digit code to{" "}
          <span className="font-medium text-foreground">{email}</span>. Paste it
          here, or click the link in the email.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verification code</FormLabel>
                <FormControl>
                  <InputOTP
                    maxLength={CODE_LENGTH}
                    value={field.value}
                    onChange={field.onChange}
                  >
                    <InputOTPGroup className="gap-2">
                      {Array.from({ length: CODE_LENGTH }).map((_, i) => (
                        <InputOTPSlot key={i} index={i} className="h-10 w-10" />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {verify.error && (
            <p className="text-[10px] text-destructive">
              {verify.error.message}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={verify.isPending}>
            {verify.isPending ? "Verifying..." : "Verify and continue"}
            <ArrowRight />
          </Button>

          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <button
              type="button"
              onClick={() => {
                if (resendIn > 0) return;
                resend.mutate();
              }}
              disabled={resendIn > 0 || resend.isPending}
              className="disabled:opacity-60"
            >
              {resend.isPending
                ? "Resending..."
                : resendIn > 0
                  ? `Resend code in 0:${resendIn.toString().padStart(2, "0")}`
                  : "Resend code"}
            </button>
            <Link
              href="/auth/forgot-password"
              className="hover:text-foreground"
            >
              Use a different email
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
