"use client";

import { useSession } from "@/lib/auth-client";
import { motion } from "framer-motion";
import { ChefHat } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useSyncExternalStore } from "react";
import logo from "../../../public/images/logo.png";

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

// Floating food emoji particle
function Particle({
  emoji,
  style,
  duration,
  delay,
}: {
  emoji: string;
  style: React.CSSProperties;
  duration: number;
  delay: number;
}) {
  return (
    <motion.span
      className="absolute text-2xl select-none pointer-events-none"
      style={style}
      animate={{
        y: [0, -18, 0],
        rotate: [-5, 5, -5],
        opacity: [0.12, 0.22, 0.12],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {emoji}
    </motion.span>
  );
}

const PARTICLES = [
  { emoji: "🍕", style: { top: "8%", left: "4%" }, duration: 4.5, delay: 0 },
  { emoji: "🍜", style: { top: "72%", left: "3%" }, duration: 5.2, delay: 1.2 },
  {
    emoji: "🥗",
    style: { top: "15%", right: "4%" },
    duration: 4.1,
    delay: 0.6,
  },
  {
    emoji: "🍣",
    style: { top: "68%", right: "3%" },
    duration: 5.8,
    delay: 1.9,
  },
  { emoji: "🧆", style: { top: "40%", left: "2%" }, duration: 4.8, delay: 2.4 },
  {
    emoji: "🌮",
    style: { top: "38%", right: "2%" },
    duration: 5.1,
    delay: 0.9,
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const isMounted = useIsMounted();

  useEffect(() => {
    if (!isPending && session?.user) {
      const user = session.user as { role?: string; emailVerified?: boolean };
      if (!user.emailVerified) return;
      const role = user.role;
      if (role === "ADMIN") router.replace("/admin/dashboard");
      else if (role === "PROVIDER") router.replace("/provider/dashboard");
      else router.replace("/");
    }
  }, [session, isPending, router]);

  const user = session?.user as
    | { role?: string; emailVerified?: boolean }
    | undefined;
  const isVerifiedUser = !!user && user.emailVerified === true;

  if (!isMounted || isPending || isVerifiedUser) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white relative overflow-hidden">
      {/* ── Background effects ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08)_0%,transparent_55%)] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating food particles */}
      {PARTICLES.map((p, i) => (
        <Particle key={i} {...p} />
      ))}

      {/* ── Navbar ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-zinc-800/60">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden ring-1 ring-zinc-700 group-hover:ring-emerald-500/50 transition-all duration-300">
            <Image src={logo} alt="FoodHub" fill className="object-cover" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            <span className="text-emerald-400">Food</span>
            <span className="text-white">Hub</span>
          </span>
        </Link>
        <Link
          href="/"
          className="text-xs font-medium text-zinc-400 border border-zinc-700 hover:border-emerald-500/50 hover:text-emerald-400 px-4 py-2 rounded-xl transition-all duration-200 hover:bg-emerald-500/5"
        >
          ← Back to home
        </Link>
      </nav>

      {/* ── Main content — grows to fill screen, centers form ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2 mb-6"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
            <ChefHat className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-sm font-medium text-zinc-400">
            FoodHub — Fresh food, local providers
          </span>
        </motion.div>

        {/* Form card wrapper */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Glow behind card */}
          <div className="absolute -inset-1 bg-emerald-500/10 rounded-3xl blur-xl pointer-events-none" />
          <div className="relative bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-700/60 shadow-2xl shadow-black/40 overflow-hidden">
            {/* Top accent line */}
            <div className="h-px bg-linear-to-r from-transparent via-emerald-500/50 to-transparent" />
            <div className="p-6 md:p-8">{children}</div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
