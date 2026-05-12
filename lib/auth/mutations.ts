"use client";

import { useMutation } from "@tanstack/react-query";
import { authClient } from "./client";

type EmailSignInInput = {
  email: string;
  password: string;
  rememberMe?: boolean;
  callbackURL?: string;
};

type EmailSignUpInput = {
  email: string;
  password: string;
  name: string;
  callbackURL?: string;
};

type SocialSignInInput = {
  provider: "github" | "google";
  callbackURL?: string;
};

type PasswordResetInput = {
  email: string;
  redirectTo?: string;
};

type SendVerificationOtpInput = {
  email: string;
  type: "email-verification" | "sign-in" | "forget-password";
};

type VerifyEmailInput = {
  email: string;
  otp: string;
};

function unwrap<T>(result: { data?: T; error?: { message?: string } | null }) {
  if (result.error) {
    throw new Error(result.error.message ?? "Request failed.");
  }
  return result.data as T;
}

export function useSignInEmail() {
  return useMutation({
    mutationFn: async (input: EmailSignInInput) =>
      unwrap(await authClient.signIn.email(input)),
  });
}

export function useSignUpEmail() {
  return useMutation({
    mutationFn: async (input: EmailSignUpInput) =>
      unwrap(await authClient.signUp.email(input)),
  });
}

export function useSocialSignIn() {
  return useMutation({
    mutationFn: async (input: SocialSignInInput) =>
      unwrap(await authClient.signIn.social(input)),
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: async (input: PasswordResetInput) =>
      unwrap(await authClient.requestPasswordReset(input)),
  });
}

export function useSendVerificationOtp() {
  return useMutation({
    mutationFn: async (input: SendVerificationOtpInput) =>
      unwrap(await authClient.emailOtp.sendVerificationOtp(input)),
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: async (input: VerifyEmailInput) =>
      unwrap(await authClient.emailOtp.verifyEmail(input)),
  });
}
