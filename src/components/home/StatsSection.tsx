"use client";

import { api } from "@/lib/api";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useTransform,
  type Variants,
} from "framer-motion";
import {
  CheckCircle2,
  ChefHat,
  ShoppingBag,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Stats = {
  totalOrders: number;
  deliveredOrders: number;
  activeProviders: number;
  totalMeals: number;
  totalCustomers: number;
};

// ─── Animation ────────────────────────────────────────────────────────────────
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

// ─── Animated number hook ─────────────────────────────────────────────────────
function useCountUp(target: number, inView: boolean, duration = 2) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView || target === 0) return;
    const controls = animate(motionVal, target, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    });
    const unsubscribe = rounded.on("change", setDisplay);
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [inView, target, duration, motionVal, rounded]);

  return display;
}

// ─── Format number ────────────────────────────────────────────────────────────
function formatNum(n: number): string {
  if (n >= 1_000_000)
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toString();
}

// ─── Stat card definition ─────────────────────────────────────────────────────
type StatDef = {
  key: keyof Stats;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  color: string; // icon + accent colour classes
  bgColor: string; // icon bg
  borderColor: string; // card ring on hover
  barColor: string; // animated fill bar colour
  suffix?: string;
};

const STAT_DEFS: StatDef[] = [
  {
    key: "totalOrders",
    label: "Orders Placed",
    sublabel: "Every order ever placed on FoodHub",
    icon: ShoppingBag,
    color: "text-violet-500",
    bgColor: "bg-violet-50 dark:bg-violet-950/40",
    borderColor: "hover:ring-violet-200 dark:hover:ring-violet-800/60",
    barColor: "bg-violet-400",
  },
  {
    key: "deliveredOrders",
    label: "Delivered",
    sublabel: "Orders successfully delivered",
    icon: CheckCircle2,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
    borderColor: "hover:ring-emerald-200 dark:hover:ring-emerald-800/60",
    barColor: "bg-emerald-400",
  },
  {
    key: "totalMeals",
    label: "Menu Items",
    sublabel: "Dishes available right now",
    icon: UtensilsCrossed,
    color: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/40",
    borderColor: "hover:ring-amber-200 dark:hover:ring-amber-800/60",
    barColor: "bg-amber-400",
  },
  {
    key: "activeProviders",
    label: "Providers",
    sublabel: "Approved kitchens & restaurants",
    icon: ChefHat,
    color: "text-sky-500",
    bgColor: "bg-sky-50 dark:bg-sky-950/40",
    borderColor: "hover:ring-sky-200 dark:hover:ring-sky-800/60",
    barColor: "bg-sky-400",
  },
  {
    key: "totalCustomers",
    label: "Happy Customers",
    sublabel: "Registered food lovers",
    icon: Users,
    color: "text-rose-500",
    bgColor: "bg-rose-50 dark:bg-rose-950/40",
    borderColor: "hover:ring-rose-200 dark:hover:ring-rose-800/60",
    barColor: "bg-rose-400",
  },
];

// ─── Delivery rate bar ────────────────────────────────────────────────────────
function DeliveryRateBar({
  total,
  delivered,
  inView,
}: {
  total: number;
  delivered: number;
  inView: boolean;
}) {
  const pct = total > 0 ? Math.round((delivered / total) * 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-emerald-400"
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : { width: 0 }}
          transition={{ duration: 1.8, delay: 0.6, ease: EASE }}
        />
      </div>
      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 tabular-nums shrink-0">
        {pct}% delivered
      </span>
    </div>
  );
}

// ─── Single stat card ─────────────────────────────────────────────────────────
function StatCard({
  def,
  value,
  inView,
  maxValue,
}: {
  def: StatDef;
  value: number;
  inView: boolean;
  maxValue: number;
}) {
  const count = useCountUp(value, inView, 1.8);
  const fillPct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  const Icon = def.icon;

  return (
    <motion.div
      variants={itemVariants}
      className={`
        relative flex flex-col gap-4 p-6 rounded-2xl
        bg-white dark:bg-zinc-900
        border border-zinc-100 dark:border-zinc-800
        shadow-sm shadow-black/[0.04]
        ring-1 ring-transparent transition-all duration-300
        hover:shadow-md hover:-translate-y-0.5
        ${def.borderColor}
      `}
    >
      {/* Icon */}
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center ${def.bgColor}`}
      >
        <Icon className={`w-5 h-5 ${def.color}`} />
      </div>

      {/* Count */}
      <div>
        <div
          className={`text-4xl font-bold tabular-nums tracking-tight ${def.color}`}
        >
          {formatNum(count)}
          {def.suffix && <span className="text-2xl">{def.suffix}</span>}
        </div>
        <p className="text-base font-semibold text-zinc-800 dark:text-zinc-100 mt-1">
          {def.label}
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
          {def.sublabel}
        </p>
      </div>

      {/* Relative fill bar — shows how this stat ranks vs the max */}
      <div className="mt-auto">
        <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${def.barColor}`}
            initial={{ width: 0 }}
            animate={inView ? { width: `${fillPct}%` } : { width: 0 }}
            transition={{ duration: 1.6, delay: 0.3, ease: EASE }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function StatSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 animate-pulse">
      <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
      <div className="space-y-2">
        <div className="h-9 w-24 bg-zinc-100 dark:bg-zinc-800 rounded" />
        <div className="h-4 w-28 bg-zinc-100 dark:bg-zinc-800 rounded" />
        <div className="h-3 w-36 bg-zinc-100 dark:bg-zinc-800 rounded" />
      </div>
      <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800" />
    </div>
  );
}

// ─── Floating orb (decorative) ────────────────────────────────────────────────
function Orb({ className, delay }: { className: string; delay: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.7, 0.5] }}
      transition={{ duration: 6, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export function StatsSection() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    api
      .get("/orders/stats")
      .then((data) => {
        const s = data?.data ?? data;
        if (s && typeof s.totalOrders === "number") setStats(s);
      })
      .catch(() => setStats(null))
      .finally(() => setIsLoading(false));
  }, []);

  const maxValue = stats
    ? Math.max(
        stats.totalOrders,
        stats.totalMeals,
        stats.totalCustomers,
        stats.activeProviders,
      )
    : 1;

  return (
    <section
      ref={ref}
      className="relative py-20 bg-zinc-50 dark:bg-zinc-950 overflow-hidden"
    >
      {/* ── Decorative background orbs ── */}
      <Orb
        className="w-80 h-80 bg-emerald-300/20 dark:bg-emerald-500/[0.05] top-[-80px] left-[-60px]"
        delay={0}
      />
      <Orb
        className="w-72 h-72 bg-violet-300/20 dark:bg-violet-500/[0.05] bottom-[-60px] right-[-40px]"
        delay={2}
      />
      <Orb
        className="w-48 h-48 bg-amber-300/15 dark:bg-amber-500/[0.04] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        delay={4}
      />

      {/* ── Dot grid ── */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="container mx-auto px-4 relative">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: EASE }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 mb-4">
            {/* Pulsing live dot */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              Live platform stats
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
            FoodHub by the <span className="text-emerald-500">numbers</span>
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto text-sm md:text-base">
            Real-time data straight from our platform — every number updates as
            orders are placed and delivered.
          </p>
        </motion.div>

        {/* ── Cards ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {[...Array(5)].map((_, i) => (
              <StatSkeleton key={i} />
            ))}
          </div>
        ) : !stats ? null : (
          <>
            <motion.div
              initial="hidden"
              animate={inView ? "show" : "hidden"}
              variants={containerVariants}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5"
            >
              {STAT_DEFS.map((def) => (
                <StatCard
                  key={def.key}
                  def={def}
                  value={stats[def.key]}
                  inView={inView}
                  maxValue={maxValue}
                />
              ))}
            </motion.div>

            {/* ── Delivery rate highlight ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.7, duration: 0.55, ease: EASE }}
              className="mt-8 max-w-lg mx-auto p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                    Delivery success rate
                  </span>
                </div>
                <span className="text-xs text-zinc-400">
                  {stats.deliveredOrders} of {stats.totalOrders} orders
                </span>
              </div>
              <DeliveryRateBar
                total={stats.totalOrders}
                delivered={stats.deliveredOrders}
                inView={inView}
              />
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
