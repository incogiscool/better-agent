import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const signUpSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  workspaceSlug: z
    .string()
    .trim()
    .min(2, "Workspace slug must be at least 2 characters.")
    .max(40, "Workspace slug is too long.")
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
      "Use lowercase letters, numbers, and dashes.",
    ),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email address."),
});

export const verifyCodeSchema = z.object({
  code: z
    .string()
    .length(6, "Enter the 6-digit code.")
    .regex(/^\d{6}$/, "Code must be 6 digits."),
});

export const resetPasswordSchema = z.object({
  code: z
    .string()
    .length(6, "Enter the 6-digit code.")
    .regex(/^\d{6}$/, "Code must be 6 digits."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});
