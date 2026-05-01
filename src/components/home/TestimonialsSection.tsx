"use client";

import { api } from "@/lib/api";
import { motion, useInView, type Variants } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ─── Type ─────────────────────────────────────────────────────────────────────
// Shape returned by GET /reviews/top
type Testimonial = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  customer: { id: string; name: string };
  meal: { id: string; name: string } | null;
};

// ─── Animation ────────────────────────────────────────────────────────────────
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE, delay: i * 0.09 },
  }),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const PALETTES = [
  {
    bg: "bg-emerald-100 dark:bg-emerald-950/60",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  {
    bg: "bg-amber-100 dark:bg-amber-950/60",
    text: "text-amber-700 dark:text-amber-300",
  },
  {
    bg: "bg-sky-100 dark:bg-sky-950/60",
    text: "text-sky-700 dark:text-sky-300",
  },
  {
    bg: "bg-violet-100 dark:bg-violet-950/60",
    text: "text-violet-700 dark:text-violet-300",
  },
  {
    bg: "bg-rose-100 dark:bg-rose-950/60",
    text: "text-rose-700 dark:text-rose-300",
  },
  {
    bg: "bg-teal-100 dark:bg-teal-950/60",
    text: "text-teal-700 dark:text-teal-300",
  },
];

function palette(name: string) {
  const idx =
    name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTES.length;
  return PALETTES[idx];
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

// ─── Stars ────────────────────────────────────────────────────────────────────
function FiveStars() {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function TestimonialCard({
  t,
  index,
  inView,
}: {
  t: Testimonial;
  index: number;
  inView: boolean;
}) {
  const { bg, text } = palette(t.customer.name);
  const comment = (t.comment ?? "").trim();
  const display = comment.length > 180 ? comment.slice(0, 177) + "…" : comment;

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={fadeUp}
      className="
        relative flex flex-col gap-4 p-6 rounded-2xl h-full
        bg-white dark:bg-zinc-900
        border border-zinc-100 dark:border-zinc-800
        shadow-sm shadow-black/4
        hover:shadow-md hover:shadow-black/[0.07]
        hover:-translate-y-0.5
        transition-all duration-300
      "
    >
      <div className="absolute top-5 right-5 opacity-[0.07]">
        <Quote className="w-12 h-12 fill-emerald-500 text-emerald-500" />
      </div>

      <FiveStars />

      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed flex-1">
        {display || (
          <span className="italic text-zinc-400">Great experience!</span>
        )}
      </p>

      <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${bg} ${text}`}
        >
          {initials(t.customer.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate">
            {t.customer.name}
          </p>
          {t.meal?.name && (
            <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">
              {t.meal.name}
            </p>
          )}
        </div>
        <span className="text-[11px] text-zinc-400 shrink-0">
          {shortDate(t.createdAt)}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 animate-pulse min-h-50">
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-3.5 h-3.5 rounded-full bg-zinc-200 dark:bg-zinc-800"
          />
        ))}
      </div>
      <div className="space-y-2 flex-1">
        {[100, 83, 67, 75].map((w, i) => (
          <div
            key={i}
            className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
      <div className="h-px bg-zinc-100 dark:bg-zinc-800" />
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-24" />
          <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    api
      .get("/reviews/top?limit=9")
      .then((data) => {
        const list: Testimonial[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : [];
        setTestimonials(list);
      })
      .catch(() => setTestimonials([]))
      .finally(() => setIsLoading(false));
  }, []);

  // Hide section entirely if no reviews yet
  if (!isLoading && testimonials.length === 0) return null;

  return (
    <section
      ref={ref}
      className="py-20 bg-zinc-50 dark:bg-zinc-950 overflow-hidden"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: EASE }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 mb-4">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-3 h-3 fill-emerald-500 text-emerald-500"
                />
              ))}
            </div>
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              Verified 5-star reviews
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
            People love ordering on{" "}
            <span className="text-emerald-500">FoodHub</span>
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto text-sm md:text-base">
            Real words from real customers — every review below is an authentic
            five-star experience.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {isLoading
            ? [...Array(6)].map((_, i) => <CardSkeleton key={i} />)
            : testimonials.map((t, i) => (
                <TestimonialCard key={t.id} t={t} index={i} inView={inView} />
              ))}
        </div>

        {/* Trust note */}
        {!isLoading && testimonials.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-zinc-400 dark:text-zinc-500"
          >
            <span className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              All reviews are from verified customers
            </span>
            <span className="hidden sm:block">·</span>
            <span>No paid or fake testimonials</span>
          </motion.div>
        )}
      </div>
    </section>
  );
}
