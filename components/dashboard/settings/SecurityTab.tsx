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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useChangePassword, useDeleteUser } from "@/lib/auth/mutations";
import { SettingsRow } from "./SettingsRow";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z.string().min(8, "Must be at least 8 characters.").max(128),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

type PasswordValues = z.infer<typeof passwordSchema>;

function PasswordField({
  label,
  name,
  form,
}: {
  label: string;
  name: "currentPassword" | "newPassword" | "confirmPassword";
  form: ReturnType<typeof useForm<PasswordValues>>;
}) {
  const [show, setShow] = React.useState(false);
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type={show ? "text" : "password"}
                autoComplete={
                  name === "currentPassword" ? "current-password" : "new-password"
                }
                className="pr-9"
                {...field}
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute top-1/2 right-2 -translate-y-1/2 border border-border bg-background p-1 text-muted-foreground hover:text-foreground"
                aria-label={show ? "Hide" : "Show"}
              >
                {show ? <EyeSlash size={12} /> : <Eye size={12} />}
              </button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function SecurityTab() {
  const router = useRouter();
  const changePassword = useChangePassword();
  const deleteUser = useDeleteUser();

  const [deleteConfirm, setDeleteConfirm] = React.useState("");
  const [deletePassword, setDeletePassword] = React.useState("");
  const [showDeletePassword, setShowDeletePassword] = React.useState(false);

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    mode: "onChange",
  });

  const { currentPassword, newPassword, confirmPassword } = passwordForm.watch();
  const passwordsFilled = !!currentPassword && !!newPassword && !!confirmPassword;

  const onChangePassword = (values: PasswordValues) => {
    changePassword.mutate(
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: true,
      },
      { onSuccess: () => passwordForm.reset() },
    );
  };

  const onDeleteAccount = () => {
    if (deleteConfirm !== "DELETE") return;
    deleteUser.mutate(
      { password: deletePassword || undefined, callbackURL: "/" },
      {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    );
  };

  const canDelete = deleteConfirm === "DELETE" && deletePassword.length > 0;

  return (
    <div>
      <SettingsRow
        title="Password"
        description="Use a strong password. Changing it will sign out all other active sessions."
        footer={
          <>
            {changePassword.isSuccess ? (
              <p className="text-[10px] text-muted-foreground">
                Password updated. Other sessions signed out.
              </p>
            ) : changePassword.error ? (
              <p className="text-[10px] text-destructive">
                {changePassword.error.message}
              </p>
            ) : (
              <p className="text-[10px] text-muted-foreground">
                Must be at least 8 characters.
              </p>
            )}
            <Button
              size="sm"
              disabled={
                changePassword.isPending ||
                !passwordsFilled ||
                !passwordForm.formState.isValid
              }
              onClick={passwordForm.handleSubmit(onChangePassword)}
            >
              {changePassword.isPending ? "Updating..." : "Update password"}
            </Button>
          </>
        }
      >
        <Form {...passwordForm}>
          <form
            onSubmit={passwordForm.handleSubmit(onChangePassword)}
            className="space-y-3"
          >
            <PasswordField
              label="Current password"
              name="currentPassword"
              form={passwordForm}
            />
            <PasswordField
              label="New password"
              name="newPassword"
              form={passwordForm}
            />
            <PasswordField
              label="Confirm new password"
              name="confirmPassword"
              form={passwordForm}
            />
          </form>
        </Form>
      </SettingsRow>

      <SettingsRow
        title="Delete account"
        description="Permanently deletes your account and all associated projects and data. This cannot be undone."
        danger
        footer={
          <>
            {deleteUser.error ? (
              <p className="text-[10px] text-destructive">
                {deleteUser.error.message}
              </p>
            ) : (
              <p className="text-[10px] text-muted-foreground">
                This action is irreversible.
              </p>
            )}
            <Button
              size="sm"
              variant="destructive"
              disabled={!canDelete || deleteUser.isPending}
              onClick={onDeleteAccount}
            >
              {deleteUser.isPending ? "Deleting..." : "Delete account"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Password</label>
            <div className="relative">
              <Input
                type={showDeletePassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Your current password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="pr-9"
              />
              <button
                type="button"
                onClick={() => setShowDeletePassword((v) => !v)}
                className="absolute top-1/2 right-2 -translate-y-1/2 border border-border bg-background p-1 text-muted-foreground hover:text-foreground"
                aria-label={showDeletePassword ? "Hide" : "Show"}
              >
                {showDeletePassword ? (
                  <EyeSlash size={12} />
                ) : (
                  <Eye size={12} />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">
              Type <span className="font-mono text-foreground">DELETE</span> to
              confirm
            </label>
            <Input
              autoComplete="off"
              placeholder="DELETE"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="font-mono"
            />
          </div>
        </div>
      </SettingsRow>
    </div>
  );
}
