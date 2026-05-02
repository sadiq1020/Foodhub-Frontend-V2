"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { Meal } from "@/types";
import { motion } from "framer-motion";
import { Flame, Heart, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MealCard } from "../meals/MealCard";

function FloatingIcon({ Icon, style, duration, delay }: any) {
  return (
    <motion.div
      className="absolute text-emerald-500/20 dark:text-emerald-500/10 pointer-events-none select-none z-0"
      style={style}
      animate={{
        y: [0, -25, 0],
        rotate: [-15, 15, -15],
        scale: [1, 1.1, 1],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <Icon className="w-16 h-16" />
    </motion.div>
  );
}

function useVisible() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

export function FeaturedMeals() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { ref: headerRef, visible: headerVisible } = useVisible();

  useEffect(() => {
    api
      .get("/meals?isAvailable=true")
      .then((data) => {
        const all = data.data || data;
        setMeals(Array.isArray(all) ? all.slice(0, 8) : []);
      })
      .catch(() => setMeals([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="py-24 bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(0,214,143,0.04) 0%, transparent 70%)",
        }}
      />

      {/* Floating moving icons */}
      <FloatingIcon Icon={Star} style={{ top: "15%", left: "10%" }} duration={5} delay={0} />
      <FloatingIcon Icon={Flame} style={{ top: "60%", right: "8%" }} duration={6} delay={1} />
      <FloatingIcon Icon={Heart} style={{ top: "25%", right: "15%" }} duration={5.5} delay={0.5} />
      <FloatingIcon Icon={Star} style={{ bottom: "10%", left: "20%" }} duration={4.5} delay={2} />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div
          ref={headerRef}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <div>
            <p className="text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-2">
              Handpicked for you
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white">
              Featured meals
            </h2>
          </div>
          <Button
            asChild
            variant="outline"
            className="rounded-xl border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/5 transition-all duration-200 shrink-0"
          >
            <Link href="/meals">View all meals →</Link>
          </Button>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
              >
                <Skeleton className="aspect-video w-full bg-zinc-200 dark:bg-zinc-800" />
                <div className="p-4 space-y-2 bg-white dark:bg-zinc-900">
                  <Skeleton className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800" />
                  <Skeleton className="h-5 w-3/4 bg-zinc-200 dark:bg-zinc-800" />
                  <Skeleton className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-800" />
                  <div className="flex justify-between pt-2">
                    <Skeleton className="h-6 w-16 bg-zinc-200 dark:bg-zinc-800" />
                    <Skeleton className="h-9 w-24 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : meals.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            <p className="text-5xl mb-4">🍽️</p>
            <p>No meals available yet.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {meals.map((meal) => (
                <MealCard key={meal.id} meal={meal} />
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-14">
              <Button
                asChild
                size="lg"
                className="rounded-xl px-10 h-12 font-semibold text-zinc-950 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg hover:shadow-emerald-500/25"
                style={{
                  background:
                    "linear-gradient(135deg, #00d68f 0%, #14b8a6 100%)",
                }}
              >
                <Link href="/meals">Browse All Meals →</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
