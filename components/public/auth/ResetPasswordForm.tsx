"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeSlash } from "@phosphor-icons/react";
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
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useResetPasswordOtp, useSendVerificationOtp } from "@/lib/auth/mutations";
import { resetPasswordSchema } from "@/lib/schemas/auth";

const RESEND_SECONDS = 60;
const CODE_LENGTH = 6;

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm({ email }: { email: string }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [resendIn, setResendIn] = React.useState(RESEND_SECONDS);
  const resetPassword = useResetPasswordOtp();
  const sendOtp = useSendVerificationOtp();

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { code: "", password: "" },
  });

  React.useEffect(() => {
    if (resendIn <= 0) return;
    const id = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [resendIn]);

  const onSubmit = (values: ResetPasswordValues) => {
    resetPassword.mutate(
      { email, otp: values.code, password: values.password },
      {
        onSuccess: () => {
          router.push("/auth/sign-in");
        },
      },
    );
  };

  const handleResend = () => {
    if (resendIn > 0 || sendOtp.isPending) return;
    sendOtp.mutate(
      { email, type: "forget-password" },
      { onSuccess: () => setResendIn(RESEND_SECONDS) },
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-[10px] tracking-wide text-muted-foreground">
          /RESET
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Set a new password.
        </h1>
        <p className="text-xs text-muted-foreground">
          Enter the 6-digit code sent to{" "}
          <span className="font-medium text-foreground">{email}</span> and choose
          a new password.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reset code</FormLabel>
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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className="pr-9"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute top-1/2 right-2 -translate-y-1/2 border border-border bg-background p-1 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeSlash size={12} /> : <Eye size={12} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {resetPassword.error && (
            <p className="text-[10px] text-destructive">
              {resetPassword.error.message}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={resetPassword.isPending}
          >
            {resetPassword.isPending ? "Updating..." : "Update password"}
            <ArrowRight />
          </Button>

          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendIn > 0 || sendOtp.isPending}
              className="disabled:opacity-60"
            >
              {sendOtp.isPending
                ? "Resending..."
                : resendIn > 0
                  ? `Resend code in 0:${resendIn.toString().padStart(2, "0")}`
                  : "Resend code"}
            </button>
            <Link href="/auth/forgot-password" className="hover:text-foreground">
              Use a different email
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
