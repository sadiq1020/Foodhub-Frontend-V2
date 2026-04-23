"use client";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export function SessionRefresher() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const hasRefreshed = useRef(false);

  useEffect(() => {
    // Only refresh once when session becomes available
    if (!isPending && session?.user && !hasRefreshed.current) {
      hasRefreshed.current = true;
      // Small delay to ensure cookie is fully set
      setTimeout(() => {
        router.refresh();
      }, 100);
    }

    // Reset flag if session disappears (logout)
    if (!isPending && !session?.user) {
      hasRefreshed.current = false;
    }
  }, [session, isPending, router]);

  return null;
}
