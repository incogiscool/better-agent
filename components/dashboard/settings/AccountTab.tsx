"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useUpdateUser, useChangeEmail, useSignOut } from "@/lib/auth/mutations";
import { SettingsRow } from "./SettingsRow";

type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
};

const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(100),
});

const emailSchema = z.object({
  newEmail: z.email("Enter a valid email address."),
});

type ProfileValues = z.infer<typeof profileSchema>;
type EmailValues = z.infer<typeof emailSchema>;

export function AccountTab({ user }: { user: User }) {
  const router = useRouter();
  const updateUser = useUpdateUser();
  const changeEmail = useChangeEmail();
  const signOut = useSignOut();
  const [emailSent, setEmailSent] = React.useState(false);

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name },
  });

  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { newEmail: "" },
    mode: "onChange",
  });

  const newEmail = emailForm.watch("newEmail");

  const onSaveProfile = (values: ProfileValues) => {
    updateUser.mutate({ name: values.name }, { onSuccess: () => router.refresh() });
  };

  const onChangeEmail = (values: EmailValues) => {
    changeEmail.mutate(
      { newEmail: values.newEmail, callbackURL: "/dashboard/settings" },
      {
        onSuccess: () => {
          setEmailSent(true);
          emailForm.reset();
        },
      },
    );
  };

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div>
      <SettingsRow
        title="Profile"
        description="Your name as it appears across the dashboard."
        footer={
          <>
            {updateUser.isSuccess ? (
              <p className="text-[10px] text-muted-foreground">Saved.</p>
            ) : updateUser.error ? (
              <p className="text-[10px] text-destructive">
                {updateUser.error.message}
              </p>
            ) : (
              <p className="text-[10px] text-muted-foreground">
                Used for display only.
              </p>
            )}
            <Button
              size="sm"
              disabled={updateUser.isPending || !profileForm.formState.isDirty}
              onClick={profileForm.handleSubmit(onSaveProfile)}
            >
              {updateUser.isPending ? "Saving..." : "Save"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center bg-primary text-[11px] font-bold text-primary-foreground">
              {initials}
            </div>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onSaveProfile)}>
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display name</FormLabel>
                    <FormControl>
                      <Input autoComplete="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </SettingsRow>

      <SettingsRow
        title="Email address"
        description="Changing your email sends a confirmation link to the new address."
        footer={
          emailSent ? null : (
            <>
              <div className="flex items-center gap-2">
                <p className="font-mono text-[10px]">{user.email}</p>
                {user.emailVerified ? (
                  <span className="text-[10px] text-muted-foreground">
                    verified
                  </span>
                ) : (
                  <span className="text-[10px] text-destructive">
                    unverified
                  </span>
                )}
              </div>
              <Button
                size="sm"
                disabled={
                  changeEmail.isPending ||
                  !emailForm.formState.isValid ||
                  !newEmail
                }
                onClick={emailForm.handleSubmit(onChangeEmail)}
              >
                {changeEmail.isPending ? "Sending..." : "Send confirmation"}
              </Button>
            </>
          )
        }
      >
        {emailSent ? (
          <div className="space-y-2">
            <p className="text-xs font-medium">Check your inbox.</p>
            <p className="text-xs text-muted-foreground">
              A confirmation link was sent to the new address. The change takes
              effect once you click it.
            </p>
            <button
              type="button"
              onClick={() => setEmailSent(false)}
              className="text-[10px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              Use a different address
            </button>
          </div>
        ) : (
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onChangeEmail)}>
              <FormField
                control={emailForm.control}
                name="newEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New email address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="new@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    {changeEmail.error && (
                      <p className="text-[10px] text-destructive">
                        {changeEmail.error.message}
                      </p>
                    )}
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )}
      </SettingsRow>

      <SettingsRow
        title="Sign out"
        description="Sign out of your account on this device."
        footer={
          <>
            <p className="text-[10px] text-muted-foreground">
              You will be redirected to the sign-in page.
            </p>
            <Button
              size="sm"
              variant="outline"
              disabled={signOut.isPending}
              onClick={() =>
                signOut.mutate(undefined, {
                  onSuccess: () => {
                    router.push("/auth/sign-in");
                    router.refresh();
                  },
                })
              }
            >
              {signOut.isPending ? "Signing out..." : "Sign out"}
            </Button>
          </>
        }
      >
        <p className="text-xs text-muted-foreground">
          Signed in as{" "}
          <span className="font-mono text-foreground">{user.email}</span>
        </p>
      </SettingsRow>
    </div>
  );
}
