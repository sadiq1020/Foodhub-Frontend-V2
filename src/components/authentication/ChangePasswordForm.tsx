"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { handleApiError } from "@/lib/handle-error";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export function ChangePasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    const toastId = toast.loading("Changing password...");
    try {
      await api.post("/auth/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      toast.success("Password changed successfully. Please log in again.", {
        id: toastId,
      });

      reset();

      // Brief delay so the user sees the success toast, then redirect to login
      // Backend wipes all sessions on password change
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch (error) {
      handleApiError(error, toastId);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
      <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
        Change Password
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5">
        After changing your password you will be logged out of all sessions.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FieldGroup>
          <Field data-invalid={!!errors.currentPassword}>
            <FieldLabel htmlFor="currentPassword">Current Password</FieldLabel>
            <Input
              id="currentPassword"
              type="password"
              placeholder="Enter your current password"
              {...register("currentPassword")}
            />
            {errors.currentPassword && (
              <FieldError errors={[errors.currentPassword]} />
            )}
          </Field>

          <Field data-invalid={!!errors.newPassword}>
            <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
            <Input
              id="newPassword"
              type="password"
              placeholder="Min 8 characters"
              {...register("newPassword")}
            />
            {errors.newPassword && <FieldError errors={[errors.newPassword]} />}
          </Field>

          <Field data-invalid={!!errors.confirmPassword}>
            <FieldLabel htmlFor="confirmPassword">
              Confirm New Password
            </FieldLabel>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your new password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <FieldError errors={[errors.confirmPassword]} />
            )}
          </Field>
        </FieldGroup>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-linear-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 border-0 text-white px-8"
          >
            {isSubmitting ? "Changing..." : "Change Password"}
          </Button>
        </div>
      </form>
    </div>
  );
}
