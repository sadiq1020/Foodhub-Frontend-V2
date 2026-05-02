"use client";

import { FavouriteButton } from "@/components/meals/FavouriteButton";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import type { Meal } from "@/types";
import { motion, useAnimation, useInView, type Variants } from "framer-motion";
import {
  ArrowRight,
  ChefHat,
  ShoppingCart,
  Sparkles,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Animation ────────────────────────────────────────────────────────────────
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const DIETARY_STYLES: Record<string, { label: string; cls: string }> = {
  VEGAN: {
    label: "Vegan",
    cls: "bg-green-500/15 text-green-400 border-green-500/25",
  },
  VEGETARIAN: {
    label: "Vegetarian",
    cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  },
  NON_VEG: {
    label: "Non-veg",
    cls: "bg-red-500/15 text-red-400 border-red-500/25",
  },
};

// ─── Single marquee card ──────────────────────────────────────────────────────
function MarqueeCard({ meal }: { meal: Meal }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { data: session } = useSession();
  const [imgHovered, setImgHovered] = useState(false);

  const dietary = meal.dietary ? DIETARY_STYLES[meal.dietary] : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session?.user) {
      toast.error("Please login to add items to cart", {
        action: { label: "Login", onClick: () => router.push("/login") },
      });
      return;
    }
    addToCart(
      {
        mealId: meal.id,
        name: meal.name,
        price: meal.price,
        image: meal.image,
      },
      1,
    );
    toast.success(`${meal.name} added to cart!`);
  };

  return (
    <Link
      href={`/meals/${meal.id}`}
      // w-72 = fixed card width so the marquee math works
      className="group relative flex flex-col w-72 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 shrink-0"
    >
      {/* ── Image ── */}
      <div
        className="relative h-44 overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0"
        onMouseEnter={() => setImgHovered(true)}
        onMouseLeave={() => setImgHovered(false)}
      >
        {meal.image ? (
          <Image
            src={meal.image}
            alt={meal.name}
            fill
            sizes="288px"
            className={`object-cover transition-transform duration-500 ${
              imgHovered ? "scale-110" : "scale-100"
            }`}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-emerald-100 to-zinc-100 dark:from-emerald-950/40 dark:to-zinc-900">
            <span className="text-4xl">🍽️</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-zinc-900/60 dark:from-zinc-900/80 via-transparent to-transparent" />

        {/* NEW badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-md">
            <Sparkles className="w-2.5 h-2.5" />
            NEW
          </span>
        </div>

        {/* Dietary badge */}
        {dietary && (
          <div className="absolute top-3 right-3 z-10">
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${dietary.cls}`}
            >
              {dietary.label}
            </span>
          </div>
        )}

        {/* Favourite — stop link propagation */}
        <div
          className="absolute bottom-3 right-3 z-10"
          onClick={(e) => e.preventDefault()}
        >
          <FavouriteButton mealId={meal.id} size="sm" />
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Category */}
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          {meal.category?.name}
        </p>

        {/* Name */}
        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200 line-clamp-1 text-sm">
          {meal.name}
        </h3>

        {/* Provider + rating */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-zinc-500 truncate flex-1">
            <ChefHat className="w-3 h-3 shrink-0 text-emerald-500/60" />
            {meal.provider?.businessName}
          </span>
          {meal.averageRating != null && meal.averageRating > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-amber-400 shrink-0">
              <Star className="w-3 h-3 fill-amber-400" />
              {meal.averageRating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Price + cart */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
            ৳{meal.price}
          </span>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.93 }}
            onClick={handleAddToCart}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold transition-colors duration-200 cursor-pointer"
          >
            <ShoppingCart className="w-3 h-3" />
            Add
          </motion.button>
        </div>
      </div>
    </Link>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
function MarqueeSkeleton() {
  return (
    <div className="w-72 shrink-0 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-pulse">
      <div className="h-44 bg-zinc-200 dark:bg-zinc-800" />
      <div className="p-4 space-y-3">
        <div className="h-2.5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="h-3 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="flex justify-between items-center pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <div className="h-5 w-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-7 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ─── Infinite marquee track ───────────────────────────────────────────────────
// CARD_WIDTH (288) + GAP (20) = 308px per slot
const CARD_W = 288;
const GAP = 20;
const SLOT = CARD_W + GAP;

function MarqueeTrack({
  meals,
  speed = 35,
}: {
  meals: Meal[];
  speed?: number;
}) {
  const controls = useAnimation();
  const [paused, setPaused] = useState(false);

  // Duplicate meals so the loop is seamless:
  // We need enough copies to fill the screen + one extra set to loop back.
  // Using 4 copies is safe for any viewport.
  const items = [...meals, ...meals, ...meals, ...meals];
  const trackWidth = meals.length * SLOT; // one set width in px

  const startMarquee = () => {
    controls.start({
      x: [-trackWidth, 0],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: trackWidth / speed, // px/s → seconds
          ease: "linear",
        },
      },
    });
  };

  useEffect(() => {
    if (meals.length === 0) return;
    startMarquee();
  }, [meals.length]);

  const handleMouseEnter = () => {
    setPaused(true);
    controls.stop();
  };

  const handleMouseLeave = () => {
    setPaused(false);
    startMarquee();
  };

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Left fade edge */}
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-linear-to-r from-zinc-50 dark:from-zinc-950 to-transparent" />
      {/* Right fade edge */}
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-linear-to-l from-zinc-50 dark:from-zinc-950 to-transparent" />

      {/* Pause indicator */}
      {paused && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="absolute top-3 right-28 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700 backdrop-blur-sm text-xs text-zinc-600 dark:text-zinc-400"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Paused
        </motion.div>
      )}

      {/* The moving track */}
      <motion.div
        animate={controls}
        className="flex"
        style={{ gap: GAP, paddingLeft: GAP }}
      >
        {items.map((meal, i) => (
          <MarqueeCard key={`${meal.id}-${i}`} meal={meal} />
        ))}
      </motion.div>
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export function NewMealsSection() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    api
      .get("/meals?isAvailable=true&sortBy=createdAt&sortOrder=desc&limit=8")
      .then((data) => {
        const all: Meal[] = Array.isArray(data) ? data : (data?.data ?? []);
        setMeals(all.slice(0, 8)); // up to 8 for a fuller marquee loop
      })
      .catch(() => setMeals([]))
      .finally(() => setIsLoading(false));
  }, []);

  if (!isLoading && meals.length === 0) return null;

  return (
    <section ref={ref} className="relative py-20 bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      {/* Same ambient glow as FeaturedMeals */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-75 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(0,214,143,0.04) 0%, transparent 70%)",
        }}
      />

      {/* Thin divider line at top */}
      <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={headerVariants}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10"
        >
          <div>
            <p className="text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Just added
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white">
              New on <span className="text-emerald-500 dark:text-emerald-400">FoodHub</span>
            </h2>
            <p className="text-zinc-500 text-sm mt-2">
              The freshest additions — hover to pause, click to explore.
            </p>
          </div>

          <Link
            href="/meals?sortBy=createdAt&sortOrder=desc"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/5 transition-all duration-200 text-sm font-medium shrink-0"
          >
            See all new meals
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      </div>

      {/* Marquee — full width, outside container so it bleeds edge-to-edge */}
      {isLoading ? (
        <div className="flex gap-5 px-5 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <MarqueeSkeleton key={i} />
          ))}
        </div>
      ) : (
        <MarqueeTrack meals={meals} speed={40} />
      )}
    </section>
  );
}
