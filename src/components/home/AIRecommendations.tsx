"use client";

import { MealCard } from "@/components/meals/MealCard";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import type { Meal } from "@/types";
import { motion, useInView, type Variants } from "framer-motion";
import { Bot, RefreshCw, Sparkles, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type RecommendedMeal = Meal & { aiReason: string };

// ─── Animation ────────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE, delay: i * 0.08 },
  }),
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

// ─── Build context string for Gemini ─────────────────────────────────────────

function buildContext(userName?: string): string {
  const hour = new Date().getHours();
  const parts: string[] = [];

  if (hour >= 5 && hour < 11) parts.push("It's morning, breakfast time.");
  else if (hour >= 11 && hour < 15) parts.push("It's lunchtime.");
  else if (hour >= 15 && hour < 18) parts.push("It's afternoon snack time.");
  else if (hour >= 18 && hour < 22) parts.push("It's dinner time.");
  else parts.push("It's late night, someone's hungry.");

  parts.push("The platform is based in Bangladesh.");
  parts.push("Recommend diverse meals — mix categories when possible.");

  if (userName) {
    parts.push(`The user's name is ${userName}.`);
  }

  return parts.join(" ");
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 animate-pulse">
      <div className="aspect-video bg-zinc-100 dark:bg-zinc-800" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
        <div className="h-5 w-3/4 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
        <div className="h-4 w-1/2 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
        {/* AI reason skeleton */}
        <div className="h-6 w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl mt-2" />
        <div className="flex justify-between pt-1">
          <div className="h-6 w-14 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
          <div className="h-8 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ─── AI reason badge that sits below the MealCard ────────────────────────────

function ReasonBadge({ reason }: { reason: string }) {
  return (
    <div className="mt-2 flex items-start gap-2 px-3 py-2 rounded-xl bg-emerald-500/8 dark:bg-emerald-500/10 border border-emerald-500/15 dark:border-emerald-500/20">
      <Zap className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
      <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-snug">
        {reason}
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AIRecommendations() {
  const { data: session } = useSession();
  const [meals, setMeals] = useState<RecommendedMeal[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [fetchCount, setFetchCount] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });
  const hasFetched = useRef(false);

  const userName = session?.user?.name;

  const fetchRecommendations = async (isRefresh = false) => {
    if (!isRefresh && hasFetched.current) return;
    hasFetched.current = true;
    setStatus("loading");
    setMeals([]);

    try {
      // 1. Fetch real meals from our backend
      const mealsData = await api.get(
        "/meals?isAvailable=true&limit=40&sortBy=createdAt&sortOrder=desc",
      );
      const allMeals: Meal[] = mealsData.data || mealsData || [];

      if (allMeals.length === 0) {
        setStatus("error");
        return;
      }

      // 2. Ask Gemini to pick 4
      const context = buildContext(userName ?? undefined);
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meals: allMeals, context }),
      });

      if (!res.ok) throw new Error("Recommendations API failed");

      const { recommended } = await res.json();

      if (!recommended || recommended.length === 0) {
        setStatus("error");
        return;
      }

      setMeals(recommended);
      setStatus("done");
      setFetchCount((c) => c + 1);
    } catch {
      setStatus("error");
    }
  };

  // Trigger when section scrolls into view
  useEffect(() => {
    if (inView && status === "idle") {
      fetchRecommendations();
    }
  }, [inView]); // eslint-disable-line react-hooks/exhaustive-deps

  // Don't render the section at all if it errored on first load
  if (status === "error" && fetchCount === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-white dark:bg-zinc-900 relative overflow-hidden"
    >
      {/* Subtle background texture */}
      <div
        className="absolute inset-0 opacity-[0.018] dark:opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full pointer-events-none bg-[radial-gradient(ellipse,rgba(16,185,129,0.07)_0%,transparent_70%)]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* ── Header ──────────────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={stagger}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-12"
        >
          <div>
            {/* Label */}
            <motion.div
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-3"
            >
              <Bot className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tracking-wide">
                AI-powered picks
              </span>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white"
            >
              Recommended{" "}
              <span className="text-emerald-500">for you</span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-sm text-zinc-500 dark:text-zinc-400 mt-2"
            >
              {userName
                ? `Picked for you, ${userName.split(" ")[0]} — based on the time and what's popular.`
                : "Picked for right now — based on the time and what's popular."}
            </motion.p>
          </div>

          {/* Refresh button */}
          <motion.button
            variants={fadeUp}
            custom={3}
            onClick={() => fetchRecommendations(true)}
            disabled={status === "loading"}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${status === "loading" ? "animate-spin" : ""}`}
            />
            Refresh picks
          </motion.button>
        </motion.div>

        {/* ── Content ─────────────────────────────────────────────── */}
        {status === "loading" ? (
          <div>
            {/* Loading state label */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                    style={{
                      animation: `pulse 1.2s ${i * 0.2}s ease-in-out infinite`,
                    }}
                  />
                ))}
              </div>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                Gemini is choosing your meals…
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        ) : status === "error" ? (
          // Error state (only shown on refresh failure — first load hides section)
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🤖</div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">
              Couldn&apos;t load recommendations right now.
            </p>
            <button
              onClick={() => fetchRecommendations(true)}
              className="px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 hover:border-emerald-500/40 transition-all duration-200"
            >
              Try again
            </button>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {meals.map((meal, i) => (
              <motion.div key={meal.id} variants={fadeUp} custom={i}>
                {/* Reuse the existing MealCard — zero duplication */}
                <MealCard meal={meal} />
                {/* AI reason badge sits below the card */}
                <ReasonBadge reason={meal.aiReason} />
              </motion.div>
            ))}
          </motion.div>
        )}

      </div>
    </section>
  );
}