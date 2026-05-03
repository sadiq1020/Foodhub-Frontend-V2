"use client";

import { motion, useInView, type Variants } from "framer-motion";
import {
    ArrowRight,
    BookOpen,
    ChefHat,
    Clock,
    Flame,
    Leaf,
    Search,
    Sparkles,
    Star,
    TrendingUp,
    Utensils,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

// ─── Animation ────────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE, delay: i * 0.08 },
  }),
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { label: "All", value: "all", icon: BookOpen },
  { label: "Food Tips", value: "tips", icon: ChefHat },
  { label: "Recipes", value: "recipes", icon: Utensils },
  { label: "Nutrition", value: "nutrition", icon: Leaf },
  { label: "Trending", value: "trending", icon: TrendingUp },
];

type Post = {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  tag: string;
  readTime: string;
  date: string;
  author: string;
  authorInitials: string;
  authorColor: string;
  accent: string;
  accentText: string;
  accentBorder: string;
  featured?: boolean;
  emoji: string;
};

const POSTS: Post[] = [
  {
    id: 1,
    title: "Why Supporting Local Food Providers Changes Everything",
    excerpt:
      "When you order from a local kitchen on FoodHub, you're not just getting a meal — you're keeping a family business alive. Here's the real economic and human impact of choosing local over chains.",
    category: "trending",
    tag: "Community",
    readTime: "5 min read",
    date: "May 1, 2025",
    author: "Sadiq Ibn Masud",
    authorInitials: "SI",
    authorColor: "bg-emerald-500",
    accent: "bg-emerald-500/10",
    accentText: "text-emerald-400",
    accentBorder: "border-emerald-500/20",
    featured: true,
    emoji: "🏪",
  },
  {
    id: 2,
    title: "The Art of the Perfect Biryani: A Provider's Guide",
    excerpt:
      "We sat down with three of FoodHub's top-rated biryani providers to understand what separates a 4-star biryani from a legendary one. Spoiler: it starts the night before.",
    category: "recipes",
    tag: "Recipes",
    readTime: "7 min read",
    date: "Apr 24, 2025",
    author: "Anika Rahman",
    authorInitials: "AR",
    authorColor: "bg-violet-500",
    accent: "bg-amber-500/10",
    accentText: "text-amber-400",
    accentBorder: "border-amber-500/20",
    emoji: "🍛",
  },
  {
    id: 3,
    title: "How to Eat Well on a Budget Without Compromising Taste",
    excerpt:
      "Street food culture in Bangladesh proves that incredible flavour doesn't require a restaurant price tag. We break down the smartest ways to order on FoodHub under ৳200 a meal.",
    category: "tips",
    tag: "Food Tips",
    readTime: "4 min read",
    date: "Apr 18, 2025",
    author: "Tariq Hassan",
    authorInitials: "TH",
    authorColor: "bg-amber-500",
    accent: "bg-sky-500/10",
    accentText: "text-sky-400",
    accentBorder: "border-sky-500/20",
    emoji: "💰",
  },
  {
    id: 4,
    title: "5 Bangladeshi Dishes That Deserve Global Recognition",
    excerpt:
      "From the smoky depth of shutki bhuna to the delicate complexity of panta bhat with ilish, Bangladesh's cuisine is quietly one of the most underrated in the world.",
    category: "trending",
    tag: "Trending",
    readTime: "6 min read",
    date: "Apr 12, 2025",
    author: "Sadiq Ibn Masud",
    authorInitials: "SI",
    authorColor: "bg-emerald-500",
    accent: "bg-rose-500/10",
    accentText: "text-rose-400",
    accentBorder: "border-rose-500/20",
    emoji: "🌍",
  },
  {
    id: 5,
    title: "Understanding Halal: What It Really Means for Your Food",
    excerpt:
      "The halal label means more than a dietary restriction — it's about sourcing, handling, and care. We explain what FoodHub verifies and how providers meet the standard.",
    category: "nutrition",
    tag: "Nutrition",
    readTime: "5 min read",
    date: "Apr 6, 2025",
    author: "Anika Rahman",
    authorInitials: "AR",
    authorColor: "bg-violet-500",
    accent: "bg-emerald-500/10",
    accentText: "text-emerald-400",
    accentBorder: "border-emerald-500/20",
    emoji: "☪️",
  },
  {
    id: 6,
    title: "From Home Kitchen to 500 Orders: A Provider Success Story",
    excerpt:
      "Mita Begum started cooking from her apartment in Mirpur with zero marketing budget. Eighteen months later, her channel on FoodHub is one of our highest-rated. This is her story.",
    category: "trending",
    tag: "Success Story",
    readTime: "8 min read",
    date: "Mar 29, 2025",
    author: "Tariq Hassan",
    authorInitials: "TH",
    authorColor: "bg-amber-500",
    accent: "bg-violet-500/10",
    accentText: "text-violet-400",
    accentBorder: "border-violet-500/20",
    emoji: "🚀",
  },
  {
    id: 7,
    title: "The Protein Math: Are You Eating Enough?",
    excerpt:
      "Most people in Bangladesh significantly underestimate their daily protein needs. We break down the numbers for common FoodHub meals and show you how to hit your targets without meal prep.",
    category: "nutrition",
    tag: "Nutrition",
    readTime: "5 min read",
    date: "Mar 22, 2025",
    author: "Anika Rahman",
    authorInitials: "AR",
    authorColor: "bg-violet-500",
    accent: "bg-teal-500/10",
    accentText: "text-teal-400",
    accentBorder: "border-teal-500/20",
    emoji: "💪",
  },
  {
    id: 8,
    title: "Ramadan Iftar Guide: The Best Providers on FoodHub",
    excerpt:
      "A curated list of the best iftar specials from FoodHub providers — from classic jilapi and halim to modern takes on traditional Ramadan fare worth ordering for the whole family.",
    category: "tips",
    tag: "Food Tips",
    readTime: "4 min read",
    date: "Mar 15, 2025",
    author: "Sadiq Ibn Masud",
    authorInitials: "SI",
    authorColor: "bg-emerald-500",
    accent: "bg-amber-500/10",
    accentText: "text-amber-400",
    accentBorder: "border-amber-500/20",
    emoji: "🌙",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function AnimatedSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Featured card ────────────────────────────────────────────────────────────

function FeaturedCard({ post }: { post: Post }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={0}
      className="relative group rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10 cursor-pointer"
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Glow */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start">
        {/* Emoji visual */}
        <div className="shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-5xl md:text-6xl group-hover:scale-105 transition-transform duration-500">
          {post.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${post.accent} ${post.accentText} ${post.accentBorder}`}
            >
              <Flame className="w-3 h-3" />
              Featured
            </span>
            <span className="text-xs text-zinc-600 font-medium">{post.tag}</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight group-hover:text-emerald-400 transition-colors duration-300">
            {post.title}
          </h2>

          <p className="text-zinc-400 text-sm md:text-base leading-relaxed mb-6 line-clamp-2">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full ${post.authorColor} flex items-center justify-center text-white text-xs font-bold`}
              >
                {post.authorInitials}
              </div>
              <span className="text-xs text-zinc-400">{post.author}</span>
            </div>
            <span className="text-zinc-700">·</span>
            <span className="flex items-center gap-1 text-xs text-zinc-500">
              <Clock className="w-3 h-3" />
              {post.readTime}
            </span>
            <span className="text-zinc-700">·</span>
            <span className="text-xs text-zinc-500">{post.date}</span>

            <span className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-emerald-400 group-hover:gap-2.5 transition-all duration-200">
              Read article <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Regular card ─────────────────────────────────────────────────────────────

function PostCard({ post, index }: { post: Post; index: number }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      className="group flex flex-col rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-emerald-500/30 transition-all duration-400 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/8 cursor-pointer h-full"
    >
      {/* Top color bar + emoji */}
      <div
        className={`relative h-40 flex items-center justify-center ${post.accent} border-b border-zinc-800`}
      >
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <span className="relative text-6xl group-hover:scale-110 transition-transform duration-400">
          {post.emoji}
        </span>
        <span
          className={`absolute top-4 right-4 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${post.accent} ${post.accentText} ${post.accentBorder}`}
        >
          {post.tag}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-bold text-white text-base leading-snug mb-2.5 group-hover:text-emerald-400 transition-colors duration-300 line-clamp-2">
          {post.title}
        </h3>
        <p className="text-zinc-500 text-sm leading-relaxed flex-1 line-clamp-3 mb-4">
          {post.excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-3 pt-3 border-t border-zinc-800">
          <div
            className={`w-6 h-6 rounded-full ${post.authorColor} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}
          >
            {post.authorInitials}
          </div>
          <span className="text-xs text-zinc-500 truncate flex-1">
            {post.author}
          </span>
          <span className="flex items-center gap-1 text-xs text-zinc-600 shrink-0">
            <Clock className="w-3 h-3" />
            {post.readTime}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BlogPage() {
  const heroRef = useRef<HTMLElement>(null);
  const heroInView = useInView(heroRef, { once: true });
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const featured = POSTS.find((p) => p.featured)!;
  const filtered = POSTS.filter((p) => {
    const matchesCategory =
      activeCategory === "all" || p.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && !p.featured;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* ══════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative py-24 md:py-32 overflow-hidden"
      >
        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(16,185,129,0.12)_0%,transparent_70%)] pointer-events-none" />

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Floating food emojis — decorative */}
        {["🍛", "🥘", "🍜", "🫕", "🍱"].map((emoji, i) => (
          <motion.span
            key={i}
            className="absolute text-3xl select-none pointer-events-none opacity-20"
            style={{
              top: `${15 + i * 14}%`,
              left: i % 2 === 0 ? `${3 + i * 2}%` : `${88 - i * 2}%`,
            }}
            animate={{ y: [0, -12, 0], rotate: [0, 6, 0] }}
            transition={{
              duration: 3 + i * 0.7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          >
            {emoji}
          </motion.span>
        ))}

        <div className="container mx-auto px-4 relative">
          <motion.div
            initial="hidden"
            animate={heroInView ? "show" : "hidden"}
            variants={stagger}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div variants={fadeUp} custom={0} className="mb-5">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                Food stories, tips & recipes
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-5xl md:text-7xl font-bold mb-5 leading-[1.08] tracking-tight"
            >
              The FoodHub{" "}
              <span className="relative inline-block">
                <span className="text-emerald-400">Journal</span>
                <motion.span
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-linear-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0"
                  initial={{ scaleX: 0 }}
                  animate={heroInView ? { scaleX: 1 } : { scaleX: 0 }}
                  transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
                />
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-zinc-400 text-lg md:text-xl leading-relaxed mb-10 max-w-xl mx-auto"
            >
              Recipes, food culture, nutrition insights, and the stories behind
              Bangladesh&apos;s best local kitchens.
            </motion.p>

            {/* Search */}
            <motion.div
              variants={fadeUp}
              custom={3}
              className="relative max-w-md mx-auto"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/15 text-white placeholder:text-zinc-600 text-sm outline-none transition-all duration-200"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════════════ */}
      <section className="border-y border-zinc-800/60 bg-zinc-900/30">
        <div className="container mx-auto px-4 py-5">
          <AnimatedSection className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {[
              { icon: BookOpen, label: "Articles published", value: "48" },
              { icon: Star, label: "Avg. read rating", value: "4.8★" },
              { icon: ChefHat, label: "Provider spotlights", value: "12" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                custom={i}
                className="flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <stat.icon className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xl font-bold text-emerald-400 leading-none">
                    {stat.value}
                  </div>
                  <div className="text-xs text-zinc-600 mt-0.5">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FEATURED POST
      ══════════════════════════════════════════════════ */}
      {activeCategory === "all" && !searchQuery && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <AnimatedSection>
              <motion.p
                variants={fadeUp}
                custom={0}
                className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-5 flex items-center gap-1.5"
              >
                <Flame className="w-3.5 h-3.5" />
                Featured story
              </motion.p>
              <FeaturedCard post={featured} />
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════
          CATEGORY FILTER
      ══════════════════════════════════════════════════ */}
      <section className="py-4 sticky top-16 z-20 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/60">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0 ${
                    isActive
                      ? "bg-emerald-500 text-zinc-950"
                      : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-emerald-500/40 hover:text-emerald-400"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          POSTS GRID
      ══════════════════════════════════════════════════ */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Section heading */}
          <AnimatedSection className="mb-10">
            <motion.div
              variants={fadeUp}
              custom={0}
              className="flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-1">
                  {activeCategory === "all"
                    ? "All articles"
                    : CATEGORIES.find((c) => c.value === activeCategory)?.label}
                </p>
                <h2 className="text-2xl font-bold text-white">
                  {searchQuery
                    ? `Results for "${searchQuery}"`
                    : "Latest from the journal"}
                </h2>
              </div>
              <span className="text-sm text-zinc-600">
                {filtered.length} article{filtered.length !== 1 ? "s" : ""}
              </span>
            </motion.div>
          </AnimatedSection>

          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24"
            >
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-zinc-400 text-lg font-medium mb-2">
                No articles found
              </p>
              <p className="text-zinc-600 text-sm">
                Try a different search term or category.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="mt-6 px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/40 transition-all duration-200"
              >
                Clear filters
              </button>
            </motion.div>
          ) : (
            <AnimatedSection className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))}
            </AnimatedSection>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          NEWSLETTER CTA
      ══════════════════════════════════════════════════ */}
      <section className="py-20 border-t border-zinc-800">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <motion.div
              variants={fadeUp}
              custom={0}
              className="relative max-w-2xl mx-auto text-center rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 p-10 md:p-14"
            >
              {/* Inner glow */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.07)_0%,transparent_65%)] pointer-events-none" />

              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mx-auto mb-5">
                  <ChefHat className="w-7 h-7 text-emerald-400" />
                </div>

                <h2 className="text-3xl md:text-4xl font-bold mb-3">
                  Never miss a recipe
                </h2>
                <p className="text-zinc-400 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
                  Weekly food stories, nutrition tips, and exclusive provider
                  spotlights — straight to your inbox.
                </p>

                <div className="flex gap-2 max-w-sm mx-auto">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/15 text-white placeholder:text-zinc-600 text-sm outline-none transition-all duration-200"
                  />
                  <button className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm transition-all duration-200 hover:scale-[1.03] shrink-0">
                    Subscribe
                  </button>
                </div>

                <p className="text-xs text-zinc-700 mt-4">
                  No spam. Unsubscribe any time.
                </p>
              </div>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          BOTTOM CTA
      ══════════════════════════════════════════════════ */}
      <section className="py-16 bg-zinc-950">
        <div className="container mx-auto px-4 text-center">
          <AnimatedSection>
            <motion.p
              variants={fadeUp}
              custom={0}
              className="text-zinc-500 mb-3 text-sm"
            >
              Hungry after all that reading?
            </motion.p>
            <motion.div variants={fadeUp} custom={1}>
              <Link
                href="/meals"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold transition-all duration-200 hover:scale-[1.03] shadow-lg shadow-emerald-500/20 text-sm"
              >
                Browse meals on FoodHub
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}