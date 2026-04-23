"use client";

import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useSyncExternalStore } from "react";

// useSyncExternalStore is the correct pattern for client-only rendering
// It returns false on server, true on client — no setState needed
function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true, // client snapshot
    () => false, // server snapshot
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const isMounted = useIsMounted();

  // useEffect(() => {
  //   if (!isPending && session?.user) {
  //     const user = session.user as { role?: string; emailVerified?: boolean };

  //     // Only redirect verified users away from auth pages
  //     if (!user.emailVerified) return;

  //     const role = user.role;
  //     if (role === "ADMIN") {
  //       router.replace("/admin/dashboard");
  //     } else if (role === "PROVIDER") {
  //       router.replace("/provider/dashboard");
  //     } else {
  //       router.replace("/");
  //     }
  //   }
  // }, [session, isPending, router]);

  useEffect(() => {
    if (!isPending && session?.user) {
      const user = session.user as { role?: string; emailVerified?: boolean };
      if (!user.emailVerified) return;

      // Don't redirect if an OAuth flow is in progress
      const hasOAuthState = document.cookie.includes("better-auth.state");
      if (hasOAuthState) return;

      const role = user.role;
      if (role === "ADMIN") {
        router.replace("/admin/dashboard");
      } else if (role === "PROVIDER") {
        router.replace("/provider/dashboard");
      } else {
        router.replace("/");
      }
    }
  }, [session, isPending, router]);
  const user = session?.user as
    | { role?: string; emailVerified?: boolean }
    | undefined;
  const isVerifiedUser = !!user && user.emailVerified === true;

  const hasOAuthState =
    typeof document !== "undefined" &&
    document.cookie.includes("better-auth.state");

  if (!isMounted || (isPending && !hasOAuthState) || isVerifiedUser) {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0c10] text-gray-100">
      <nav className="flex items-center justify-between px-6 md:px-12 py-6">
        <Link href="/" className="text-2xl font-black text-orange-500">
          FOOD<span className="text-white">HUB</span>
        </Link>
        <Link
          href="/"
          className="text-xs uppercase font-bold text-gray-400 border border-white/10 px-5 py-2 rounded-full"
        >
          Back to Home
        </Link>
      </nav>

      <main className="grow flex flex-col items-center justify-start pt-8 px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white uppercase tracking-tighter mb-3">
            Welcome to <span className="text-orange-500">FOOD</span>HUB
          </h1>
          <p className="text-gray-400 font-medium">
            Please enter your details below to continue
          </p>
        </div>

        <div className="w-full max-w-2xl bg-zinc-900/40 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-white/10 shadow-2xl">
          {children}
        </div>
      </main>
    </div>
  );
}
