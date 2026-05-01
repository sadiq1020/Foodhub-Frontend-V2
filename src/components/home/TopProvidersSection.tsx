"use client";

import { api } from "@/lib/api";
import { motion, useInView, type Variants } from "framer-motion";
import {
  ArrowRight,
  ChefHat,
  MapPin,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// ─── Type ─────────────────────────────────────────────────────────────────────
type TopProvider = {
  id: string;
  businessName: string;
  description: string | null;
  address: string;
  logo: string | null;
  totalMeals: number;
  totalReviews: number;
  avgRating: number | null;
  mealPreviews: { id: string; name: string; image: string | null }[];
};

// ─── Animation ────────────────────────────────────────────────────────────────
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE },
  },
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

// ─── Rank badge colours ───────────────────────────────────────────────────────
const RANK_STYLES = [
  {
    badge: "bg-amber-400 text-amber-950",
    glow: "shadow-amber-400/20",
    ring: "ring-amber-300/30",
    label: "🥇 Top Provider",
  },
  {
    badge: "bg-zinc-300 text-zinc-800",
    glow: "shadow-zinc-400/10",
    ring: "ring-zinc-300/20",
    label: "🥈 Runner Up",
  },
  {
    badge: "bg-amber-600/80 text-amber-100",
    glow: "shadow-amber-600/10",
    ring: "ring-amber-600/20",
    label: "🥉 Rising Star",
  },
];

// ─── Floating food particle (decorative) ─────────────────────────────────────
function FloatingEmoji({
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
        rotate: [-4, 4, -4],
        opacity: [0.18, 0.32, 0.18],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {emoji}
    </motion.span>
  );
}

// ─── Provider card ────────────────────────────────────────────────────────────
function ProviderCard({
  provider,
  rank,
}: {
  provider: TopProvider;
  rank: number;
}) {
  const style = RANK_STYLES[rank] ?? RANK_STYLES[2];
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      variants={cardVariants}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={`
        relative flex flex-col rounded-2xl overflow-hidden
        bg-white dark:bg-zinc-900
        border border-zinc-100 dark:border-zinc-800
        shadow-lg ${style.glow}
        ring-1 ${style.ring}
        transition-shadow duration-300
        ${hovered ? "shadow-xl" : ""}
      `}
    >
      {/* ── Rank badge ── */}
      <div className="absolute top-4 left-4 z-20">
        <span
          className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${style.badge}`}
        >
          {style.label}
        </span>
      </div>

      {/* ── Meal image strip (top 3 meal images as a mosaic) ── */}
      <div className="relative h-36 bg-zinc-100 dark:bg-zinc-800 flex overflow-hidden">
        {provider.mealPreviews.length > 0 ? (
          provider.mealPreviews.map((meal, i) => (
            <div
              key={meal.id}
              className="relative flex-1 overflow-hidden"
              style={{
                // Middle image slightly taller for a layered feel
                transform: i === 1 ? "scale(1.04)" : "scale(1)",
                zIndex: i === 1 ? 1 : 0,
              }}
            >
              <Image
                src={meal.image!}
                alt={meal.name}
                fill
                className={`object-cover transition-transform duration-500 ${
                  hovered ? "scale-110" : "scale-100"
                }`}
              />
            </div>
          ))
        ) : (
          // Fallback: elegant gradient placeholder
          <div className="flex-1 flex items-center justify-center bg-linear-to-br from-emerald-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900">
            <UtensilsCrossed className="w-10 h-10 text-zinc-300 dark:text-zinc-600" />
          </div>
        )}
        {/* Overlay gradient for readability */}
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent z-10" />
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Logo + Name */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shrink-0 flex items-center justify-center">
            {provider.logo ? (
              <Image
                src={provider.logo}
                alt={provider.businessName}
                width={48}
                height={48}
                className="object-cover w-full h-full"
              />
            ) : (
              <ChefHat className="w-5 h-5 text-emerald-500" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-base truncate">
              {provider.businessName}
            </h3>
            {provider.address && (
              <p className="flex items-center gap-1 text-xs text-zinc-400 truncate">
                <MapPin className="w-3 h-3 shrink-0" />
                {provider.address}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        {provider.description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
            {provider.description}
          </p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-3 mt-auto pt-1">
          {/* Rating */}
          {provider.avgRating !== null && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                {provider.avgRating}
              </span>
            </div>
          )}

          {/* Meals count */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
            <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              {provider.totalMeals} meals
            </span>
          </div>

          {/* Reviews count */}
          {provider.totalReviews > 0 && (
            <span className="text-xs text-zinc-400 dark:text-zinc-500 ml-auto">
              {provider.totalReviews} review
              {provider.totalReviews !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* CTA */}
        <Link
          href={`/provider-profile/${provider.id}`}
          className="
            mt-2 flex items-center justify-center gap-1.5
            w-full py-2.5 rounded-xl text-sm font-medium
            bg-zinc-900 dark:bg-zinc-50
            text-zinc-50 dark:text-zinc-900
            hover:bg-emerald-500 dark:hover:bg-emerald-500
            hover:text-white dark:hover:text-white
            transition-colors duration-200
          "
        >
          View Menu
          <motion.span
            animate={hovered ? { x: 4 } : { x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.span>
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function ProviderSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 animate-pulse">
      <div className="h-36 bg-zinc-100 dark:bg-zinc-800" />
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-32" />
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-24" />
          </div>
        </div>
        <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-full" />
        <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-3/4" />
        <div className="flex gap-2 pt-1">
          <div className="h-7 w-16 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-7 w-20 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        </div>
        <div className="h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 mt-1" />
      </div>
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
const FOOD_PARTICLES = [
  { emoji: "🍜", style: { top: "12%", left: "4%" }, duration: 4.2, delay: 0 },
  { emoji: "🍕", style: { top: "70%", left: "1%" }, duration: 5.1, delay: 0.8 },
  {
    emoji: "🥗",
    style: { top: "20%", right: "3%" },
    duration: 4.8,
    delay: 1.2,
  },
  {
    emoji: "🍣",
    style: { top: "65%", right: "2%" },
    duration: 3.9,
    delay: 0.4,
  },
  { emoji: "🌮", style: { top: "40%", left: "2%" }, duration: 5.5, delay: 1.8 },
  {
    emoji: "🧆",
    style: { top: "45%", right: "1.5%" },
    duration: 4.5,
    delay: 2.2,
  },
];

export function TopProvidersSection() {
  const [providers, setProviders] = useState<TopProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    api
      .get("/provider-profile/top?limit=3")
      .then((data) => {
        const list: TopProvider[] = Array.isArray(data)
          ? data
          : (data?.data ?? []);
        setProviders(list);
      })
      .catch(() => setProviders([]))
      .finally(() => setIsLoading(false));
  }, []);

  if (!isLoading && providers.length === 0) return null;

  return (
    <section
      ref={ref}
      className="relative py-20 bg-white dark:bg-zinc-900 overflow-hidden"
    >
      {/* ── Subtle background grid ── */}
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-zinc-400) 1px, transparent 1px), linear-gradient(90deg, var(--color-zinc-400) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── Ambient glow blobs ── */}
      <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-emerald-400/10 dark:bg-emerald-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-64 rounded-full bg-amber-400/10 dark:bg-amber-500/5 blur-3xl pointer-events-none" />

      {/* ── Floating food emojis ── */}
      {FOOD_PARTICLES.map((p, i) => (
        <FloatingEmoji key={i} {...p} />
      ))}

      <div className="container mx-auto px-4 relative">
        {/* ── Header ── */}
        <motion.div
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={headerVariants}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 mb-4">
            <ChefHat className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              Ranked by menu size & rating
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
            Meet our <span className="text-emerald-500">top providers</span>
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto text-sm md:text-base">
            The most popular kitchens on FoodHub, ranked by meals offered and
            customer ratings.
          </p>
        </motion.div>

        {/* ── Cards ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[...Array(3)].map((_, i) => (
              <ProviderSkeleton key={i} />
            ))}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {providers.map((p, i) => (
              <ProviderCard key={p.id} provider={p} rank={i} />
            ))}
          </motion.div>
        )}

        {/* ── Footer CTA ── */}
        {!isLoading && providers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.55, duration: 0.5, ease: EASE }}
            className="text-center mt-12"
          >
            <Link
              href="/provider-profile"
              className="
                inline-flex items-center gap-2 px-6 py-3 rounded-xl
                bg-emerald-500 hover:bg-emerald-400
                text-white text-sm font-semibold
                shadow-md shadow-emerald-500/20
                hover:shadow-lg hover:shadow-emerald-500/30
                transition-all duration-200 hover:scale-[1.03]
              "
            >
              Browse all providers
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
