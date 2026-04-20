"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { handleApiError } from "@/lib/handle-error";

// ── Step 1 schema — just email ─────────────────────────
const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// ── Step 2 schema — OTP + new password ─────────────────
const resetSchema = z
  .object({
    otp: z
      .string()
      .length(6, "OTP must be exactly 6 digits")
      .regex(/^\d+$/, "OTP must contain only numbers"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type EmailFormData = z.infer<typeof emailSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp" | "success">("email");
  const [submittedEmail, setSubmittedEmail] = useState("");

  // ── Step 1 form ───────────────────────────────────────
  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  // ── Step 2 form ───────────────────────────────────────
  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { otp: "", newPassword: "", confirmPassword: "" },
  });

  // ── Step 1 submit — send OTP ──────────────────────────
  const onEmailSubmit = async (data: EmailFormData) => {
    const toastId = toast.loading("Sending OTP to your email...");
    try {
      await api.post("/auth/forgot-password", { email: data.email });
      setSubmittedEmail(data.email);
      setStep("otp");
      toast.success("OTP sent! Check your email.", { id: toastId });
    } catch (error) {
      handleApiError(error, toastId);
    }
  };

  // ── Step 2 submit — verify OTP + set new password ─────
  const onResetSubmit = async (data: ResetFormData) => {
    const toastId = toast.loading("Resetting your password...");
    try {
      await api.post("/auth/reset-password", {
        email: submittedEmail,
        otp: data.otp,
        newPassword: data.newPassword,
      });
      setStep("success");
      toast.success("Password reset successfully!", { id: toastId });
    } catch (error) {
      handleApiError(error, toastId);
    }
  };

  // ── Success state ─────────────────────────────────────
  if (step === "success") {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/50 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                Password Reset Successfully
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                You can now log in with your new password.
              </p>
            </div>
            <Button
              className="w-full mt-2 rounded-full bg-linear-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 border-0 text-white"
              onClick={() => router.push("/login")}
            >
              Go to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Step 2: OTP + new password ────────────────────────
  if (step === "otp") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enter OTP</CardTitle>
          <CardDescription>
            We sent a 6-digit code to{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-50">
              {submittedEmail}
            </span>
            . Enter it below along with your new password.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            id="reset-form"
            onSubmit={resetForm.handleSubmit(onResetSubmit)}
          >
            <FieldGroup>
              {/* OTP */}
              <Field data-invalid={!!resetForm.formState.errors.otp}>
                <FieldLabel htmlFor="otp">6-Digit OTP</FieldLabel>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  {...resetForm.register("otp")}
                />
                <FieldDescription>
                  Check your inbox — the code expires in 10 minutes
                </FieldDescription>
                {resetForm.formState.errors.otp && (
                  <FieldError errors={[resetForm.formState.errors.otp]} />
                )}
              </Field>

              {/* New Password */}
              <Field data-invalid={!!resetForm.formState.errors.newPassword}>
                <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Min 8 characters"
                  {...resetForm.register("newPassword")}
                />
                {resetForm.formState.errors.newPassword && (
                  <FieldError
                    errors={[resetForm.formState.errors.newPassword]}
                  />
                )}
              </Field>

              {/* Confirm Password */}
              <Field
                data-invalid={!!resetForm.formState.errors.confirmPassword}
              >
                <FieldLabel htmlFor="confirmPassword">
                  Confirm New Password
                </FieldLabel>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your new password"
                  {...resetForm.register("confirmPassword")}
                />
                {resetForm.formState.errors.confirmPassword && (
                  <FieldError
                    errors={[resetForm.formState.errors.confirmPassword]}
                  />
                )}
              </Field>
            </FieldGroup>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            form="reset-form"
            type="submit"
            className="w-full rounded-full bg-linear-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 border-0 text-white"
            disabled={resetForm.formState.isSubmitting}
          >
            {resetForm.formState.isSubmitting
              ? "Resetting..."
              : "Reset Password"}
          </Button>

          {/* Allow going back to re-enter email */}
          <button
            type="button"
            onClick={() => setStep("email")}
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
          >
            ← Use a different email
          </button>
        </CardFooter>
      </Card>
    );
  }

  // ── Step 1: Email input ───────────────────────────────
  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot Password?</CardTitle>
        <CardDescription>
          Enter your email address and we&apos;ll send you a one-time code to
          reset your password.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form id="forgot-form" onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
          <FieldGroup>
            <Field data-invalid={!!emailForm.formState.errors.email}>
              <FieldLabel htmlFor="email">Email Address</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...emailForm.register("email")}
              />
              {emailForm.formState.errors.email && (
                <FieldError errors={[emailForm.formState.errors.email]} />
              )}
            </Field>
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-5">
        <Button
          form="forgot-form"
          type="submit"
          className="w-full rounded-full bg-linear-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 border-0 text-white"
          disabled={emailForm.formState.isSubmitting}
        >
          {emailForm.formState.isSubmitting ? "Sending..." : "Send OTP"}
        </Button>

        <Link
          href="/login"
          className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to login
        </Link>
      </CardFooter>
    </Card>
  );
}
