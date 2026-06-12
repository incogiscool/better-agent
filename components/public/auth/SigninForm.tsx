"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeSlash } from "@phosphor-icons/react";
import posthog from "posthog-js";
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
import { useSignInEmail } from "@/lib/auth/mutations";
import { signInSchema } from "@/lib/schemas/auth";
import { OAuthButtons } from "./OAuthButtons";
import { OrDivider } from "./OrDivider";

const signinFormSchema = signInSchema.extend({
  remember: z.boolean().optional(),
});

type SigninFormValues = z.infer<typeof signinFormSchema>;

export function SigninForm({
  callbackURL = "/dashboard",
}: {
  callbackURL?: string;
}) {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const signIn = useSignInEmail();

  const form = useForm<SigninFormValues>({
    resolver: zodResolver(signinFormSchema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = (values: SigninFormValues) => {
    signIn.mutate(
      {
        email: values.email,
        password: values.password,
        rememberMe: values.remember,
        callbackURL,
      },
      {
        onSuccess: () => {
          posthog.identify(values.email, { email: values.email });
          posthog.capture("sign_in_completed", { method: "email" });
          router.push(callbackURL);
          router.refresh();
        },
        onError: (err) => {
          posthog.captureException(err);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-[10px] tracking-wide text-muted-foreground">
          /LOGIN
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Welcome back.</h1>
        <p className="text-xs text-muted-foreground">
          Pick up where you left off.
        </p>
      </div>

      <OAuthButtons callbackURL={callbackURL} />

      <OrDivider />

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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href="/auth/forgot-password"
                    className="text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    Forgot?
                  </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      className="pr-9"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute top-1/2 right-2 -translate-y-1/2 border border-border bg-background p-1 text-muted-foreground hover:text-foreground"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeSlash size={12} />
                      ) : (
                        <Eye size={12} />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {signIn.error && (
            <p className="text-[10px] text-destructive">
              {signIn.error.message}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={signIn.isPending}>
            {signIn.isPending ? "Signing in..." : "Continue"}
            <ArrowRight />
          </Button>

          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <FormField
              control={form.control}
              name="remember"
              render={({ field }) => (
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={field.value ?? false}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="size-3 accent-primary"
                  />
                  Remember this device
                </label>
              )}
            />
            <div className="flex items-center gap-2">
              <kbd className="border border-border px-1">↵</kbd>
              <span>submit</span>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
