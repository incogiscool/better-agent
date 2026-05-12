"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "@phosphor-icons/react";
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
import { useRequestPasswordReset } from "@/lib/auth/mutations";
import { forgotPasswordSchema } from "@/lib/schemas/auth";

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const router = useRouter();
  const requestReset = useRequestPasswordReset();

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (values: ForgotPasswordValues) => {
    requestReset.mutate(
      { email: values.email, redirectTo: "/auth/reset-password" },
      {
        onSuccess: () => {
          router.push(
            `/auth/check-inbox?email=${encodeURIComponent(values.email)}`,
          );
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-[10px] tracking-wide text-muted-foreground">
          /RESET
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Reset your password.
        </h1>
        <p className="text-xs text-muted-foreground">
          Enter the email on your account. We&apos;ll send a one-time link.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="dax@cassio.dev"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {requestReset.error && (
            <p className="text-[10px] text-destructive">
              {requestReset.error.message}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={requestReset.isPending}
          >
            {requestReset.isPending ? "Sending..." : "Send reset link"}
            <ArrowRight />
          </Button>
        </form>
      </Form>
    </div>
  );
}
