"use client";

import { api } from "@/lib/api";
import { Category } from "@/types";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function useVisible() {
  const ref = useRef<HTMLElement>(null);
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
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

const CATEGORY_PARTICLES = [
  { emoji: "🍔", style: { top: "15%", left: "5%" }, duration: 4.5, delay: 0 },
  { emoji: "🍹", style: { top: "65%", right: "8%" }, duration: 5.2, delay: 1 },
  { emoji: "🍰", style: { top: "25%", right: "12%" }, duration: 4.1, delay: 0.5 },
  { emoji: "🥑", style: { top: "75%", left: "10%" }, duration: 5.8, delay: 1.5 },
];

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
      className="absolute text-4xl select-none pointer-events-none z-0"
      style={style}
      animate={{
        y: [0, -25, 0],
        rotate: [-8, 8, -8],
        opacity: [0.15, 0.3, 0.15],
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

function CategoryCard({
  category,
  index,
}: {
  category: Category;
  index: number;
}) {
  const router = useRouter();
  const { ref, visible } = useVisible();

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      onClick={() => router.push(`/meals?category=${category.id}`)}
      className="group relative cursor-pointer rounded-2xl overflow-hidden border border-zinc-800 hover:border-emerald-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 aspect-[4/3]"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateY(0) scale(1)"
          : "translateY(20px) scale(0.97)",
        transition: `opacity 0.55s ease ${index * 80}ms, transform 0.55s ease ${index * 80}ms`,
      }}
    >
      {/* Image or fallback */}
      {category.image ? (
        <Image
          src={category.image}
          alt={category.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
          <span className="text-5xl opacity-40">🍽️</span>
        </div>
      )}

      {/* Gradient overlay — always present, deepens on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-transparent group-hover:from-zinc-950/95 group-hover:via-zinc-950/50 transition-all duration-300" />

      {/* Emerald accent line — slides in from left on hover */}
      <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 ease-out" />

      {/* Text */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="font-semibold text-white text-base leading-tight">
          {category.name}
        </h3>
        {category._count && (
          <p className="text-xs text-zinc-400 mt-0.5 group-hover:text-emerald-400 transition-colors duration-300">
            {category._count.meals} meals
          </p>
        )}
      </div>
    </div>
  );
}

export function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { ref: headerRef, visible: headerVisible } = useVisible();

  useEffect(() => {
    api
      .get("/categories")
      .then((data) => setCategories(data.data || data))
      .catch(() => setCategories([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Animated Glow Orbs */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)" }}
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(20,184,166,0.04) 0%, transparent 70%)" }}
      />

      {/* Floating moving emojis */}
      {CATEGORY_PARTICLES.map((p, i) => (
        <FloatingEmoji key={i} {...p} />
      ))}

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          <div>
            <p className="text-emerald-500 text-xs font-semibold tracking-widest uppercase mb-2">
              Explore
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white">
              Browse by category
            </h2>
          </div>
          <p className="text-zinc-500 text-sm max-w-xs leading-relaxed sm:text-right">
            Find exactly what you&apos;re craving from our wide selection of
            local cuisine.
          </p>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse"
              />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 text-zinc-400">
            <p className="text-5xl mb-4">🍽️</p>
            <p>No categories yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <CategoryCard key={cat.id} category={cat} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
