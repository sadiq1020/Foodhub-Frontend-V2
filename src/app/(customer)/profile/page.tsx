"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail, Phone, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { handleApiError } from "@/lib/handle-error";
import type { User as UserType } from "@/types";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .regex(/^[0-9]{10,15}$/, "Phone must be 10-15 digits")
    .optional()
    .or(z.literal("")),
  email: z.string().email(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  // const [displayName, setDisplayName] = useState(""); //  Local state for display

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
    },
  });

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      const user = session.user as unknown as UserType;
      reset({
        name: user.name || "",
        phone: user.phone || "",
        email: user.email || "",
      });
      // setDisplayName(user.name || ""); // Set display name
    }
  }, [session, reset]);

  // if (isPending) {
  //   return (
  //     <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
  //       <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
  //     </div>
  //   );
  // }

  if (isPending || !session?.user) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 suppressHydrationWarning">
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // if (!session?.user) return null;

  const user = session.user as unknown as UserType;

  const onSubmit = async (data: ProfileFormData) => {
    const toastId = toast.loading("Updating profile...");

    try {
      await api.put("/users/profile", {
        name: data.name,
        phone: data.phone || null,
      });

      // Update local display name instantly
      // setDisplayName(data.name);

      toast.success("Profile updated successfully!", { id: toastId });

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: unknown) {
      // const message =
      //   error instanceof Error ? error.message : "Failed to update profile";
      // toast.error(message, { id: toastId });
      handleApiError(error, toastId);
    }
  };

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recently";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 suppressHydrationWarning">
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 py-6">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 -ml-2 mb-3"
          >
            <Link href="/">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            My Profile
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">
            Manage your account information
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center">
              <User className="w-10 h-10 text-orange-500" />
            </div>
            <div>
              {/*  Use displayName state */}
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                {user.name}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {user.email}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup>
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="name">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name *
                </FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  {...register("name")}
                />
                <FieldDescription>
                  This is how your name will appear on orders
                </FieldDescription>
                {errors.name && <FieldError errors={[errors.name]} />}
              </Field>

              <Field>
                <FieldLabel htmlFor="email">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  disabled
                  {...register("email")}
                  className="bg-zinc-50 dark:bg-zinc-800 cursor-not-allowed opacity-60"
                />
                <FieldDescription>Email cannot be changed</FieldDescription>
              </Field>

              <Field data-invalid={!!errors.phone}>
                <FieldLabel htmlFor="phone">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
                </FieldLabel>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="01700000000"
                  {...register("phone")}
                />
                <FieldDescription>
                  Optional - for delivery contact
                </FieldDescription>
                {errors.phone && <FieldError errors={[errors.phone]} />}
              </Field>
            </FieldGroup>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                disabled={isSubmitting}
                className="rounded-full"
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-linear-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 border-0 text-white px-8"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Account Information
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">
                Account Type
              </span>
              <span className="font-medium text-zinc-900 dark:text-zinc-50">
                {user.role || "Customer"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">
                Member Since
              </span>
              <span className="font-medium text-zinc-900 dark:text-zinc-50">
                {memberSince}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
