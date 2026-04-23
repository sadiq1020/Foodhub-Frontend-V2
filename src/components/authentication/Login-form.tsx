"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { Button } from "../ui/button";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Minimum length is 8"),
});

type LoginFormData = z.infer<typeof formSchema>;

export function LoginForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  // Google login handler
  // const handleGoogleLogin = async () => {
  //   setIsGoogleLoading(true);
  //   try {
  //     await authClient.signIn.social({
  //       provider: "google",
  //       // After Google auth, Better Auth redirects here on the backend,
  //       // which then redirects to the frontend home
  //       callbackURL: `${window.location.origin}/`,
  //     });
  //     // Note: no code after this — the browser will redirect away
  //   } catch {
  //     toast.error("Google login failed. Please try again.");
  //     setIsGoogleLoading(false);
  //   }
  // };

  // bug fix attempt 1
  // const handleGoogleLogin = () => {
  //   const backendUrl =
  //     process.env.NEXT_PUBLIC_API_URL ||
  //     "https://foodhub-backend-v2.onrender.com";
  //   const frontendUrl =
  //     process.env.NEXT_PUBLIC_FRONTEND_URL || window.location.origin;

  //   // Redirect directly to backend OAuth — bypasses Next.js proxy
  //   // which causes state cookie mismatch on cross-domain setups
  //   window.location.href = `${backendUrl}/api/auth/sign-in/social?provider=google&callbackURL=${encodeURIComponent(frontendUrl + "/")}`;
  // };

  // bug fix attempt 2
  // const handleGoogleLogin = async () => {
  //   setIsGoogleLoading(true);
  //   try {
  //     // For Google OAuth, we must hit the backend directly — not through the
  //     // Next.js proxy — because the state cookie must be set and read on the
  //     // same domain (onrender.com). Going through the proxy breaks this.
  //     const { createAuthClient } = await import("better-auth/react");
  //     const directClient = createAuthClient({
  //       baseURL: "https://foodhub-backend-v2.onrender.com",
  //       fetchOptions: { credentials: "include" },
  //     });

  //     await directClient.signIn.social({
  //       provider: "google",
  //       callbackURL: `${process.env.NEXT_PUBLIC_FRONTEND_URL || window.location.origin}/`,
  //     });
  //   } catch {
  //     toast.error("Google login failed. Please try again.");
  //     setIsGoogleLoading(false);
  //   }
  // };

  // bug fix attempt 3
  // const handleGoogleLogin = async () => {
  //   setIsGoogleLoading(true);
  //   try {
  //     const result = await authClient.signIn.social({
  //       provider: "google",
  //       callbackURL: `${window.location.origin}/`,
  //       disableRedirect: true,
  //     });

  //     console.log("Google signIn result:", JSON.stringify(result));

  //     if (result?.data?.url) {
  //       window.location.href = result.data.url;
  //     } else {
  //       toast.error("No redirect URL returned");
  //       setIsGoogleLoading(false);
  //     }
  //   } catch (err) {
  //     console.error("Google signIn error:", err);
  //     toast.error("Google login failed. Please try again.");
  //     setIsGoogleLoading(false);
  //   }
  // };

  // bug fix attempt 4
  // const handleGoogleLogin = async () => {
  //   setIsGoogleLoading(true);
  //   try {
  //     const result = await authClient.signIn.social({
  //       provider: "google",
  //       callbackURL: `${window.location.origin}/`,
  //       disableRedirect: true,
  //     });

  //     if (result?.data?.url) {
  //       const googleUrl = result.data.url;
  //       setTimeout(() => {
  //         window.location.replace(googleUrl);
  //       }, 50);
  //     } else {
  //       toast.error("Could not get Google login URL. Please try again.");
  //       setIsGoogleLoading(false);
  //     }
  //   } catch (err) {
  //     console.error("Google signIn error:", err);
  //     toast.error("Google login failed. Please try again.");
  //     setIsGoogleLoading(false);
  //   }
  // };

  // bug fix attempt 5
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      // For OAuth, we MUST hit the backend directly — not via the Next.js proxy.
      // The state cookie needs to be set and read on the same domain (onrender.com).
      // Going through the Vercel proxy breaks this because the cookie lands on
      // vercel.app but the callback goes to onrender.com which can't read it.
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://foodhub-backend-v2.onrender.com";

      const frontendUrl =
        process.env.NEXT_PUBLIC_FRONTEND_URL || window.location.origin;

      const response = await fetch(`${backendUrl}/api/auth/sign-in/social`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "google",
          callbackURL: `${frontendUrl}/`,
        }),
        credentials: "include", // ← this tells browser to store the state cookie on onrender.com
      });

      const data = await response.json();

      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error("Could not get Google login URL. Please try again.");
        setIsGoogleLoading(false);
      }
    } catch (err) {
      console.error("Google signIn error:", err);
      toast.error("Google login failed. Please try again.");
      setIsGoogleLoading(false);
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
      if (role === "ADMIN") {
        router.replace("/admin/dashboard");
      } else if (role === "PROVIDER") {
        router.replace("/provider/dashboard");
      } else {
        router.replace("/");
      }
    } catch {
      toast.error("Something went wrong, please try again", { id: toastId });
    }
  };

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          Enter your credentials to sign in to your account
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form id="login-form" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
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

            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register("password")}
              />
              {errors.password && <FieldError errors={[errors.password]} />}
            </Field>

            <div className="flex justify-end -mt-2">
              <Link
                href="/forgot-password"
                className="text-sm text-orange-500 hover:text-orange-600 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </FieldGroup>
        </form>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google Login Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center gap-2"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
        >
          {/* Google SVG icon */}
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
          {isGoogleLoading
            ? "Redirecting to Google..."
            : "Continue with Google"}
        </Button>
      </CardContent>

      <CardFooter className="flex flex-col gap-5 justify-end">
        <Button
          form="login-form"
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </Button>
        <FieldDescription className="text-center">
          Don&apos;t have an account?{" "}
          <a
            href="/register"
            className="text-primary underline underline-offset-4"
          >
            Sign up
          </a>
        </FieldDescription>
      </CardFooter>
    </Card>
  );
}
