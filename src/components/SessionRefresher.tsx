"use client";
import { authClient } from "@/lib/auth-client";
import { useEffect } from "react";

export function SessionRefresher() {
  useEffect(() => {
    authClient.getSession();
  }, []);
  return null;
}
