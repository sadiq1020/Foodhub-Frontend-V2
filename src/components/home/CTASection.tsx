"use client";

import { motion, useInView, type Variants } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ChefHat,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

// ─── Animation ────────────────────────────────────────────────────────────────
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE, delay: i * 0.1 },
  }),
};

// ─── Floating particle ────────────────────────────────────────────────────────
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
      className="absolute text-3xl select-none pointer-events-none"
      style={style}
      animate={{
        y: [0, -22, 0],
        rotate: [-6, 6, -6],
        opacity: [0.15, 0.3, 0.15],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {emoji}
    </motion.span>
  );
}

const PARTICLES = [
  { emoji: "🍕", style: { top: "12%", left: "3%" }, duration: 4.5, delay: 0 },
  { emoji: "🍜", style: { top: "65%", left: "6%" }, duration: 5.2, delay: 1.1 },
  {
    emoji: "🥗",
    style: { top: "20%", right: "4%" },
    duration: 4.1,
    delay: 0.6,
  },
  {
    emoji: "🍣",
    style: { top: "70%", right: "5%" },
    duration: 5.8,
    delay: 1.8,
  },
  { emoji: "🧆", style: { top: "42%", left: "1%" }, duration: 4.8, delay: 2.3 },
  {
    emoji: "🌮",
    style: { top: "38%", right: "2%" },
    duration: 5.1,
    delay: 0.9,
  },
];

// ─── Perks list ───────────────────────────────────────────────────────────────
const CUSTOMER_PERKS = [
  "No subscription fee — pay only for what you order",
  "Fresh meals from verified local providers",
  "Real-time order tracking from kitchen to door",
];

const PROVIDER_PERKS = [
  "Free to apply — no upfront cost to join",
  "Full control over your menu and pricing",
  "Reach thousands of hungry customers instantly",
];

// ─── CTA Card ─────────────────────────────────────────────────────────────────
function CTACard({
  variant,
  icon: Icon,
  eyebrow,
  heading,
  sub,
  perks,
  href,
  btnLabel,
  index,
  inView,
}: {
  variant: "customer" | "provider";
  icon: React.ElementType;
  eyebrow: string;
  heading: string;
  sub: string;
  perks: string[];
  href: string;
  btnLabel: string;
  index: number;
  inView: boolean;
}) {
  const isCustomer = variant === "customer";

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={fadeUp}
      className={`
        relative flex flex-col gap-6 p-8 rounded-3xl overflow-hidden
        ${
          isCustomer
            ? // Customer card: solid emerald — the primary action
              "bg-emerald-500 text-white shadow-2xl shadow-emerald-900/40"
            : // Provider card: dark glass — secondary but distinguished
              "bg-white/80 dark:bg-zinc-900/80 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700/60 shadow-xl"
        }
      `}
    >
      {/* ── Card-level background detail ── */}
      {isCustomer ? (
        // Radial glow inside the emerald card
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15)_0%,transparent_60%)] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-emerald-400/30 blur-2xl pointer-events-none" />
        </>
      ) : (
        // Subtle emerald tint glow for the dark card
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
      )}

      {/* ── Icon badge ── */}
      <div
        className={`
          relative w-12 h-12 rounded-2xl flex items-center justify-center
          ${
            isCustomer
              ? "bg-white/20 backdrop-blur-sm"
              : "bg-emerald-500/15 border border-emerald-500/30"
          }
        `}
      >
        <Icon
          className={`w-6 h-6 ${isCustomer ? "text-white" : "text-emerald-400"}`}
        />
      </div>

      {/* ── Text ── */}
      <div className="relative flex flex-col gap-2">
        <span
          className={`text-xs font-semibold uppercase tracking-widest ${
            isCustomer ? "text-emerald-100" : "text-emerald-400"
          }`}
        >
          {eyebrow}
        </span>
        <h3 className="text-2xl font-bold leading-snug">{heading}</h3>
        <p
          className={`text-sm leading-relaxed ${isCustomer ? "text-emerald-50/80" : "text-zinc-600 dark:text-zinc-400"}`}
        >
          {sub}
        </p>
      </div>

      {/* ── Perks ── */}
      <ul className="relative flex flex-col gap-2.5">
        {perks.map((perk) => (
          <li key={perk} className="flex items-start gap-2.5 text-sm">
            <CheckCircle2
              className={`w-4 h-4 shrink-0 mt-0.5 ${
                isCustomer ? "text-white/80" : "text-emerald-400"
              }`}
            />
            <span
              className={isCustomer ? "text-emerald-50/90" : "text-zinc-700 dark:text-zinc-300"}
            >
              {perk}
            </span>
          </li>
        ))}
      </ul>

      {/* ── Button ── */}
      <div className="relative mt-auto">
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link
            href={href}
            className={`
              inline-flex items-center gap-2 px-6 py-3 rounded-xl
              text-sm font-semibold transition-all duration-200 group
              ${
                isCustomer
                  ? "bg-white text-emerald-700 hover:bg-emerald-50 shadow-md shadow-black/10"
                  : "bg-emerald-500 hover:bg-emerald-400 text-white shadow-md shadow-emerald-900/40"
              }
            `}
          >
            {btnLabel}
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export function CTASection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative py-24 overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* ── Background: deep gradient ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.12)_0%,transparent_65%)] pointer-events-none" />

      {/* ── Grid lines overlay ── */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── Animated food emojis ── */}
      {PARTICLES.map((p, i) => (
        <Particle key={i} {...p} />
      ))}

      <div className="container mx-auto px-4 relative">
        {/* ── Top eyebrow ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: EASE }}
          className="flex justify-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">
              Join thousands already on FoodHub
            </span>
          </div>
        </motion.div>

        {/* ── Section headline ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.08, ease: EASE }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white leading-tight mb-4">
            Ready to get <span className="text-emerald-500 dark:text-emerald-400">started?</span>
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto text-sm md:text-base">
            Whether you&apos;re craving a great meal or want to share your
            cooking with the world — FoodHub has a place for you.
          </p>
        </motion.div>

        {/* ── Two CTA cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <CTACard
            variant="customer"
            icon={UtensilsCrossed}
            eyebrow="For food lovers"
            heading="Order your next favourite meal"
            sub="Browse hundreds of dishes from local kitchens and get fresh food delivered right to your door."
            perks={CUSTOMER_PERKS}
            href="/meals"
            btnLabel="Browse meals"
            index={0}
            inView={inView}
          />
          <CTACard
            variant="provider"
            icon={ChefHat}
            eyebrow="For restaurants & home cooks"
            heading="Start selling your food today"
            sub="Apply as a provider, list your menu, and start receiving orders from customers in your area."
            perks={PROVIDER_PERKS}
            href="/register"
            btnLabel="Apply as a provider"
            index={1}
            inView={inView}
          />
        </div>

        {/* ── Bottom trust line ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="text-center text-xs text-zinc-600 mt-10"
        >
          No credit card required to browse · Providers reviewed within 48 hours
        </motion.p>
      </div>
    </section>
  );
}
