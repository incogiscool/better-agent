"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSignUpEmail, useSendVerificationOtp } from "@/lib/auth/mutations";
import { signUpSchema } from "@/lib/schemas/auth";
import { cn } from "@/lib/utils";
import { OAuthButtons } from "./OAuthButtons";
import { OrDivider } from "./OrDivider";

type SignupFormValues = z.infer<typeof signUpSchema>;
type PasswordStrength = { score: 0 | 1 | 2 | 3 | 4; label: string };

function scorePassword(value: string): PasswordStrength {
  let score = 0;
  if (value.length >= 12) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/\d/.test(value) || /[^a-zA-Z0-9]/.test(value)) score++;
  if (value.length >= 16) score++;
  const labels = ["WEAK", "WEAK", "OKAY", "GOOD", "STRONG"] as const;
  return { score: score as PasswordStrength["score"], label: labels[score] };
}

export function SignupForm({ callbackURL = "/dashboard" }: { callbackURL?: string }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const signUp = useSignUpEmail();
  const sendOtp = useSendVerificationOtp();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", workspaceSlug: "cassio" },
  });

  const password = form.watch("password");
  const slug = form.watch("workspaceSlug");
  const strength = scorePassword(password);

  const onSubmit = (values: SignupFormValues) => {
    signUp.mutate(
      {
        email: values.email,
        password: values.password,
        name: values.workspaceSlug,
        callbackURL,
      },
      {
        onSuccess: () => {
          sendOtp.mutate(
            { email: values.email, type: "email-verification" },
            {
              onSuccess: () => {
                router.push(
                  `/auth/check-inbox?email=${encodeURIComponent(values.email)}&callbackURL=${encodeURIComponent(callbackURL)}`,
                );
              },
              onError: () => {
                router.push(
                  `/auth/check-inbox?email=${encodeURIComponent(values.email)}&callbackURL=${encodeURIComponent(callbackURL)}`,
                );
              },
            },
          );
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-[10px] tracking-wide text-muted-foreground">
          /SIGNUP
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Make your app <span className="text-primary">agent-native.</span>
        </h1>
        <p className="text-xs text-muted-foreground">
          Three fields. No card. You&apos;ll be on the dashboard in about 20 seconds.
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
                <FormLabel>Work email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.dev"
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
                <FormLabel>Password</FormLabel>
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
                <FormDescription>
                  {password ? (
                    <div className="space-y-1.5">
                      <StrengthMeter score={strength.score} />
                      <div className="flex items-center justify-between">
                        <span>12+ characters · mix case · number/symbol</span>
                        <span className="text-foreground/80">
                          {strength.label}
                        </span>
                      </div>
                    </div>
                  ) : (
                    "12+ characters · mix case · number/symbol"
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="workspaceSlug"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Workspace slug</FormLabel>
                  <span className="text-[10px] text-muted-foreground">
                    betteragent.dev/{slug || "your-slug"}
                  </span>
                </div>
                <FormControl>
                  <Input
                    autoComplete="off"
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value.toLowerCase())
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {signUp.error && (
            <p className="text-[10px] text-destructive">{signUp.error.message}</p>
          )}

          <Button type="submit" className="w-full" disabled={signUp.isPending}>
            {signUp.isPending ? "Provisioning..." : "Create workspace"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

function StrengthMeter({ score }: { score: PasswordStrength["score"] }) {
  return (
    <div className="grid grid-cols-4 gap-1">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={cn("h-0.5 w-full", i < score ? "bg-primary" : "bg-border")}
        />
      ))}
    </div>
  );
}
