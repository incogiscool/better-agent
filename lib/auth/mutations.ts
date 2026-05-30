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

export function useResetPasswordOtp() {
  return useMutation({
    mutationFn: async (input: { email: string; otp: string; password: string }) =>
      unwrap(await authClient.emailOtp.resetPassword(input)),
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

export function useUpdateUser() {
  return useMutation({
    mutationFn: async (input: { name?: string; image?: string }) =>
      unwrap(await authClient.updateUser(input)),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (input: {
      currentPassword: string;
      newPassword: string;
      revokeOtherSessions?: boolean;
    }) => unwrap(await authClient.changePassword(input)),
  });
}

export function useChangeEmail() {
  return useMutation({
    mutationFn: async (input: { newEmail: string; callbackURL?: string }) =>
      unwrap(await authClient.changeEmail(input)),
  });
}

export function useDeleteUser() {
  return useMutation({
    mutationFn: async (input: { password?: string; callbackURL?: string }) =>
      unwrap(await authClient.deleteUser(input)),
  });
}

export function useSignOut() {
  return useMutation({
    mutationFn: async () => unwrap(await authClient.signOut()),
  });
}
