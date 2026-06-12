"use client";

import { GithubLogo, GoogleLogo } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useSocialSignIn } from "@/lib/auth/mutations";
import posthog from "posthog-js";

interface OAuthButtonsProps {
  callbackURL?: string;
}

export function OAuthButtons({
  callbackURL = "/dashboard",
}: OAuthButtonsProps) {
  const { mutate, isPending, variables } = useSocialSignIn();

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          posthog.capture("oauth_sign_in_started", { provider: "github" });
          mutate({ provider: "github", callbackURL });
        }}
        disabled={isPending}
      >
        <GithubLogo weight="fill" />
        {isPending && variables?.provider === "github"
          ? "Redirecting..."
          : "Continue with GitHub"}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          posthog.capture("oauth_sign_in_started", { provider: "google" });
          mutate({ provider: "google", callbackURL });
        }}
        disabled={isPending}
      >
        <GoogleLogo weight="fill" />
        {isPending && variables?.provider === "google"
          ? "Redirecting..."
          : "Continue with Google"}
      </Button>
    </div>
  );
}
