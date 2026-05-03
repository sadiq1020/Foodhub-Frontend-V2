"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
import { authClient } from "@/lib/auth-client";
import { motion } from "framer-motion";
import { ChefHat, ShieldCheck, User, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Minimum length is 8"),
});

type LoginFormData = z.infer<typeof formSchema>;

const DEMO_ACCOUNTS = [
  {
    role: "Customer",
    email: "sadiqibnmasud@gmail.com",
    password: "12345678",
    icon: User,
    color:
      "border-sky-500/30 bg-sky-500/5 text-sky-400 hover:bg-sky-500/10 hover:border-sky-500/50",
    dot: "bg-sky-400",
  },
  {
    role: "Provider",
    email: "muid@email.com",
    password: "12345678",
    icon: ChefHat,
    color:
      "border-amber-500/30 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50",
    dot: "bg-amber-400",
  },
  {
    role: "Admin",
    email: "admin@sadiq2.com",
    password: "admin1234",
    icon: ShieldCheck,
    color:
      "border-violet-500/30 bg-violet-500/5 text-violet-400 hover:bg-violet-500/10 hover:border-violet-500/50",
    dot: "bg-violet-400",
  },
] as const;

const inputCls =
  "bg-zinc-800/60 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/60 focus:ring-emerald-500/20";

export function LoginForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const fillDemo = (email: string, password: string) => {
    setValue("email", email, { shouldValidate: true, shouldDirty: true });
    setValue("password", password, { shouldValidate: true, shouldDirty: true });
    toast.info("Demo credentials filled — click Login to continue.");
  };

  const handleGoogleLogin = async () => {
    const toastId = toast.loading("Redirecting to Google...");
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: window.location.origin, // Redirect back to frontend home
      });
    } catch (error) {
      toast.error("Google login failed", { id: toastId });
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    const toastId = toast.loading("Logging in...");
    try {
      const { data: authData, error } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });
      if (error) {
        toast.error(error.message, { id: toastId });
        return;
      }
      toast.success("Logged in successfully!", { id: toastId });
      const role = (authData?.user as { role?: string })?.role ?? "";
      if (role === "ADMIN") router.replace("/admin/dashboard");
      else if (role === "PROVIDER") router.replace("/provider/dashboard");
      else router.replace("/");
    } catch {
      toast.error("Something went wrong, please try again", { id: toastId });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
        <p className="text-sm text-zinc-500">Sign in to your FoodHub account</p>
      </div>

      {/* Demo buttons */}
      <div className="rounded-xl border border-zinc-700/60 bg-zinc-800/30 p-3">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-3 px-0.5">
          <Zap className="w-3 h-3 text-emerald-400" />
          Quick demo login
        </p>
        <div className="grid grid-cols-3 gap-2">
          {DEMO_ACCOUNTS.map(
            ({ role, email, password, icon: Icon, color, dot }) => (
              <motion.button
                key={role}
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => fillDemo(email, password)}
                className={`flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-lg border text-xs font-medium transition-all duration-200 cursor-pointer ${color}`}
              >
                <div className="relative">
                  <Icon className="w-4 h-4" />
                  <span
                    className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${dot}`}
                  />
                </div>
                <span>{role}</span>
              </motion.button>
            ),
          )}
        </div>
        <p className="text-[10px] text-zinc-600 mt-2.5 text-center">
          Fills credentials · still click Login to proceed
        </p>
      </div>

      {/* Form */}
      <form id="login-form" onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
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
          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password" className="text-zinc-300">
              Password
            </FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              className={inputCls}
              {...register("password")}
            />
            {errors.password && <FieldError errors={[errors.password]} />}
          </Field>
          <div className="flex justify-end -mt-1">
            <Link
              href="/forgot-password"
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </FieldGroup>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-zinc-900/80 px-2 text-zinc-600">
            Or continue with
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800/50 text-zinc-300 text-sm hover:bg-zinc-800 hover:border-zinc-600 transition-all duration-200"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </button>

      {/* Submit */}
      <Button
        form="login-form"
        type="submit"
        className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold shadow-md shadow-emerald-500/20"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Logging in..." : "Login"}
      </Button>

      <FieldDescription className="text-center text-zinc-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 transition-colors"
        >
          Sign up
        </Link>
      </FieldDescription>
    </div>
  );
}
