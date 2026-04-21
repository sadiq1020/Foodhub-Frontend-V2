"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
import { useState } from "react";
import { Button } from "../ui/button";

// Zod Schema for validation
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
    role: z.enum(["CUSTOMER", "PROVIDER"], {
      error: "Please select a role",
    }),
    businessName: z.string().optional(),
    address: z.string().optional(),
    description: z.string().optional(),
  })
  .refine(
    // Passwords must match
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    },
  )
  .refine(
    // businessName required if PROVIDER
    (data) => {
      if (data.role === "PROVIDER") {
        return !!data.businessName && data.businessName.length >= 1;
      }
      return true;
    },
    {
      message: "This field is required",
      path: ["businessName"],
    },
  )
  .refine(
    // address required if PROVIDER
    (data) => {
      if (data.role === "PROVIDER") {
        return !!data.address && data.address.length >= 1;
      }
      return true;
    },
    {
      message: "This field is required",
      path: ["address"],
    },
  );

type RegisterFormData = z.infer<typeof formSchema>;

export function RegisterForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter();

  const [verificationStep, setVerificationStep] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
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

  //  Watch role to show/hide provider fields
  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterFormData) => {
    const toastId = toast.loading("Creating account...");
    try {
      // Step 1: Create user with Better Auth
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

      // Step 2: If Provider, create provider profile
      if (data.role === "PROVIDER" && authData?.user) {
        await api.post("/provider/profile", {
          businessName: data.businessName,
          address: data.address,
          description: data.description || "",
          userId: authData.user.id,
        });
      }

      // Step 3: Success!
      toast.dismiss(toastId);
      setRegisteredEmail(data.email);
      setVerificationStep(true);
      toast.success("Check your email for a 6-digit verification code.");
    } catch (err) {
      // toast.error("Something went wrong, please try again", { id: toastId });
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

      toast.success("Email verified! You can now log in.", { id: toastId });
      router.push("/login");
    } catch {
      toast.error("Verification failed. Please try again.", { id: toastId });
    } finally {
      setIsVerifying(false);
    }
  };

  // Show OTP verification screen after registration
  if (verificationStep) {
    return (
      <Card {...props}>
        <CardHeader>
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>
            We sent a 6-digit code to{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-50">
              {registeredEmail}
            </span>
            . Enter it below to activate your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="otp">Verification Code</FieldLabel>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="text-center text-2xl tracking-widest font-bold"
              />
              <FieldDescription>
                Check your inbox — the code expires in 10 minutes
              </FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            onClick={handleVerifyOtp}
            disabled={isVerifying || otp.length !== 6}
            className="w-full rounded-full bg-linear-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 border-0 text-white"
          >
            {isVerifying ? "Verifying..." : "Verify Email"}
          </Button>

          <button
            type="button"
            onClick={() => setVerificationStep(false)}
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
          >
            ← Use a different email
          </button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form id="register-form" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Name */}
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                {...register("name")}
              />
              {errors.name && <FieldError errors={[errors.name]} />}
            </Field>

            {/* Email */}
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register("email")}
              />
              {errors.email && <FieldError errors={[errors.email]} />}
            </Field>

            {/* Phone */}
            <Field data-invalid={!!errors.phone}>
              <FieldLabel htmlFor="phone">Phone (optional)</FieldLabel>
              <Input
                id="phone"
                type="tel"
                placeholder="01700000000"
                {...register("phone")}
              />
              <FieldDescription>10-15 digit phone number</FieldDescription>
              {errors.phone && <FieldError errors={[errors.phone]} />}
            </Field>

            {/* Password */}
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="Min 8 characters"
                {...register("password")}
              />
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
              {errors.password && <FieldError errors={[errors.password]} />}
            </Field>

            {/* Confirm Password */}
            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel htmlFor="confirmPassword">
                Confirm Password
              </FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <FieldError errors={[errors.confirmPassword]} />
              )}
            </Field>

            {/* Role - Dropdown */}
            <Field data-invalid={!!errors.role}>
              <FieldLabel htmlFor="role">I want to register as</FieldLabel>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CUSTOMER">
                        🛒 Customer - Order food
                      </SelectItem>
                      <SelectItem value="PROVIDER">
                        🍽️ Provider - Sell food
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldDescription>
                Select whether you want to order or sell food.
              </FieldDescription>
              {errors.role && <FieldError errors={[errors.role]} />}
            </Field>

            {/* Provider Fields - Only shown when PROVIDER selected */}
            {selectedRole === "PROVIDER" && (
              <FieldGroup className="border rounded-lg p-4 bg-muted/30">
                <Field>
                  <FieldLabel>Provider Information</FieldLabel>
                  <FieldDescription>
                    Fill in your restaurant or business details.
                  </FieldDescription>
                </Field>

                {/* Business Name */}
                <Field data-invalid={!!errors.businessName}>
                  <FieldLabel htmlFor="businessName">
                    Business Name *
                  </FieldLabel>
                  <Input
                    id="businessName"
                    type="text"
                    placeholder="My Restaurant"
                    {...register("businessName")}
                  />
                  {errors.businessName && (
                    <FieldError errors={[errors.businessName]} />
                  )}
                </Field>

                {/* Address */}
                <Field data-invalid={!!errors.address}>
                  <FieldLabel htmlFor="address">Business Address *</FieldLabel>
                  <Input
                    id="address"
                    type="text"
                    placeholder="123 Main Street, City"
                    {...register("address")}
                  />
                  {errors.address && <FieldError errors={[errors.address]} />}
                </Field>

                {/* Description */}
                <Field>
                  <FieldLabel htmlFor="description">
                    Description (optional)
                  </FieldLabel>
                  <Input
                    id="description"
                    type="text"
                    placeholder="Tell customers about your restaurant"
                    {...register("description")}
                  />
                  <FieldDescription>
                    A short description of your food business.
                  </FieldDescription>
                </Field>
              </FieldGroup>
            )}
          </FieldGroup>
        </form>
      </CardContent>

      {/* Footer */}

      <CardFooter className="flex flex-col gap-5 justify-end">
        <Button
          form="register-form"
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account..." : "Create Account"}
        </Button>
        <FieldDescription className="text-center">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-primary underline underline-offset-4"
          >
            Sign in
          </a>
        </FieldDescription>
      </CardFooter>
    </Card>
  );
}
