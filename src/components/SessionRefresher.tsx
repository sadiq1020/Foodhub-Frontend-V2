"use client";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function SessionRefresher() {
  const router = useRouter();

  useEffect(() => {
    authClient.getSession().then((result) => {
      if (result?.data?.user) {
        // Session exists — force Next.js to re-render server components
        // so Navbar picks up the session
        router.refresh();
      }
    });
  }, [router]);

  return null;
}
