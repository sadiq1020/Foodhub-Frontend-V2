"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { handleApiError } from "@/lib/handle-error";
import Link from "next/link";
import { useState } from "react";
import { Button } from "../ui/button";

const formSchema = z
  .object({
    name: z.string().min(1, "This field is required"),
    email: z.string().email("Please enter a valid email"),
    phone: z
      .string()
      .regex(/^[0-9]{10,15}$/, "Phone must be 10-15 digits")
      .optional()
      .or(z.literal("")),
    password: z.string().min(8, "Minimum length is 8"),
    confirmPassword: z.string().min(1, "This field is required"),
    role: z.enum(["CUSTOMER", "PROVIDER"], { error: "Please select a role" }),
    businessName: z.string().optional(),
    address: z.string().optional(),
    description: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (d) =>
      d.role !== "PROVIDER" || (!!d.businessName && d.businessName.length >= 1),
    {
      message: "This field is required",
      path: ["businessName"],
    },
  )
  .refine(
    (d) => d.role !== "PROVIDER" || (!!d.address && d.address.length >= 1),
    {
      message: "This field is required",
      path: ["address"],
    },
  );

type RegisterFormData = z.infer<typeof formSchema>;

const inputCls =
  "bg-zinc-800/60 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/60 focus:ring-emerald-500/20";

export function RegisterForm() {
  const router = useRouter();

  const [verificationStep, setVerificationStep] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!sessionStorage.getItem("pendingVerificationEmail");
  });
  const [registeredEmail, setRegisteredEmail] = useState(() => {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem("pendingVerificationEmail") || "";
  });
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "CUSTOMER",
      businessName: "",
      address: "",
      description: "",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterFormData) => {
    const toastId = toast.loading("Creating account...");
    try {
      const { data: authData, error } = await authClient.signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
        // @ts-expect-error - Better Auth additional fields
        phone: data.phone || "",
        role: data.role,
      });

      if (error) {
        toast.error(error.message, { id: toastId });
        return;
      }

      if (data.role === "PROVIDER" && authData?.user) {
        sessionStorage.setItem(
          "pendingProviderData",
          JSON.stringify({
            businessName: data.businessName,
            address: data.address,
            description: data.description || "",
            userId: authData.user.id,
          }),
        );
      }

      toast.dismiss(toastId);
      sessionStorage.setItem("pendingVerificationEmail", data.email);
      setRegisteredEmail(data.email);
      setVerificationStep(true);
      toast.success("Check your email for a 6-digit verification code.");
    } catch (err) {
      handleApiError(err, toastId);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }
    const toastId = toast.loading("Verifying...");
    setIsVerifying(true);
    try {
      const { error } = await authClient.emailOtp.verifyEmail({
        email: registeredEmail,
        otp,
      });
      if (error) {
        toast.error(error.message || "Invalid or expired code", {
          id: toastId,
        });
        return;
      }
      const raw = sessionStorage.getItem("pendingProviderData");
      if (raw) {
        await api.post("/provider/profile", JSON.parse(raw));
        sessionStorage.removeItem("pendingProviderData");
      }
      toast.success("Email verified! You can now log in.", { id: toastId });
      router.push("/login");
      sessionStorage.removeItem("pendingVerificationEmail");
    } catch {
      toast.error("Verification failed. Please try again.", { id: toastId });
    } finally {
      setIsVerifying(false);
    }
  };

  // ── OTP verification screen ───────────────────────────────────────────────
  if (verificationStep) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Check your email
          </h1>
          <p className="text-sm text-zinc-500">
            We sent a 6-digit code to{" "}
            <span className="text-emerald-400 font-medium">
              {registeredEmail}
            </span>
            . Enter it below to activate your account.
          </p>
        </div>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="otp" className="text-zinc-300">
              Verification Code
            </FieldLabel>
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className={`${inputCls} text-center text-2xl tracking-[0.5em] font-bold`}
            />
            <FieldDescription className="text-zinc-600">
              Check your inbox — the code expires in 10 minutes
            </FieldDescription>
          </Field>
        </FieldGroup>

        <Button
          onClick={handleVerifyOtp}
          disabled={isVerifying || otp.length !== 6}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold shadow-md shadow-emerald-500/20"
        >
          {isVerifying ? "Verifying..." : "Verify Email"}
        </Button>

        <button
          type="button"
          onClick={() => {
            sessionStorage.removeItem("pendingVerificationEmail");
            sessionStorage.removeItem("pendingProviderData");
            setVerificationStep(false);
          }}
          className="text-sm text-zinc-500 hover:text-emerald-400 transition-colors text-center"
        >
          ← Use a different email
        </button>
      </div>
    );
  }

  // ── Registration form ─────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">
          Create an account
        </h1>
        <p className="text-sm text-zinc-500">
          Join thousands of food lovers on FoodHub
        </p>
      </div>

      <form id="register-form" onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          {/* Name */}
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="name" className="text-zinc-300">
              Full Name
            </FieldLabel>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              className={inputCls}
              {...register("name")}
            />
            {errors.name && <FieldError errors={[errors.name]} />}
          </Field>

          {/* Email */}
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email" className="text-zinc-300">
              Email
            </FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className={inputCls}
              {...register("email")}
            />
            {errors.email && <FieldError errors={[errors.email]} />}
          </Field>

          {/* Phone */}
          <Field data-invalid={!!errors.phone}>
            <FieldLabel htmlFor="phone" className="text-zinc-300">
              Phone <span className="text-zinc-600">(optional)</span>
            </FieldLabel>
            <Input
              id="phone"
              type="tel"
              placeholder="01700000000"
              className={inputCls}
              {...register("phone")}
            />
            <FieldDescription className="text-zinc-600">
              10-15 digit phone number
            </FieldDescription>
            {errors.phone && <FieldError errors={[errors.phone]} />}
          </Field>

          {/* Password */}
          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password" className="text-zinc-300">
              Password
            </FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="Min 8 characters"
              className={inputCls}
              {...register("password")}
            />
            <FieldDescription className="text-zinc-600">
              Must be at least 8 characters long.
            </FieldDescription>
            {errors.password && <FieldError errors={[errors.password]} />}
          </Field>

          {/* Confirm Password */}
          <Field data-invalid={!!errors.confirmPassword}>
            <FieldLabel htmlFor="confirmPassword" className="text-zinc-300">
              Confirm Password
            </FieldLabel>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              className={inputCls}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <FieldError errors={[errors.confirmPassword]} />
            )}
          </Field>

          {/* Role */}
          <Field data-invalid={!!errors.role}>
            <FieldLabel htmlFor="role" className="text-zinc-300">
              I want to register as
            </FieldLabel>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className={`w-full ${inputCls}`}>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    <SelectItem value="CUSTOMER">
                      🛒 Customer — Order food
                    </SelectItem>
                    <SelectItem value="PROVIDER">
                      🍽️ Provider — Sell food
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldDescription className="text-zinc-600">
              Select whether you want to order or sell food.
            </FieldDescription>
            {errors.role && <FieldError errors={[errors.role]} />}
          </Field>

          {/* Provider extra fields */}
          {selectedRole === "PROVIDER" && (
            <FieldGroup className="border border-emerald-500/20 rounded-xl p-4 bg-emerald-500/5">
              <Field>
                <FieldLabel className="text-emerald-400">
                  Provider Information
                </FieldLabel>
                <FieldDescription className="text-zinc-500">
                  Fill in your restaurant or business details.
                </FieldDescription>
              </Field>

              <Field data-invalid={!!errors.businessName}>
                <FieldLabel htmlFor="businessName" className="text-zinc-300">
                  Business Name <span className="text-red-400">*</span>
                </FieldLabel>
                <Input
                  id="businessName"
                  type="text"
                  placeholder="My Restaurant"
                  className={inputCls}
                  {...register("businessName")}
                />
                {errors.businessName && (
                  <FieldError errors={[errors.businessName]} />
                )}
              </Field>

              <Field data-invalid={!!errors.address}>
                <FieldLabel htmlFor="address" className="text-zinc-300">
                  Business Address <span className="text-red-400">*</span>
                </FieldLabel>
                <Input
                  id="address"
                  type="text"
                  placeholder="123 Main Street, City"
                  className={inputCls}
                  {...register("address")}
                />
                {errors.address && <FieldError errors={[errors.address]} />}
              </Field>

              <Field>
                <FieldLabel htmlFor="description" className="text-zinc-300">
                  Description <span className="text-zinc-600">(optional)</span>
                </FieldLabel>
                <Input
                  id="description"
                  type="text"
                  placeholder="Tell customers about your restaurant"
                  className={inputCls}
                  {...register("description")}
                />
                <FieldDescription className="text-zinc-600">
                  A short description of your food business.
                </FieldDescription>
              </Field>
            </FieldGroup>
          )}
        </FieldGroup>
      </form>

      <Button
        form="register-form"
        type="submit"
        className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold shadow-md shadow-emerald-500/20"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating account..." : "Create Account"}
      </Button>

      <FieldDescription className="text-center text-zinc-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 transition-colors"
        >
          Sign in
        </Link>
      </FieldDescription>
    </div>
  );
}
