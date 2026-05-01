"use client";

import { motion, useInView, type Variants } from "framer-motion";
import {
  ArrowRight,
  ChefHat,
  Heart,
  Leaf,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

// ─── Animation ────────────────────────────────────────────────────────────────
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE, delay: i * 0.08 },
  }),
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.7, ease: EASE } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const STATS = [
  { value: "2024", label: "Founded" },
  { value: "50K+", label: "Happy customers" },
  { value: "200+", label: "Food providers" },
  { value: "4.9★", label: "Average rating" },
];

const VALUES = [
  {
    icon: Heart,
    title: "Made with love",
    desc: "Every meal on FoodHub comes from a real kitchen — home cooks, family restaurants, and local chefs who care deeply about what they serve.",
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
  },
  {
    icon: ShieldCheck,
    title: "Trust first",
    desc: "Every provider is manually reviewed and approved before going live. We verify quality and authenticity so you never have to worry.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: Zap,
    title: "Speed matters",
    desc: "From order placement to your door, we obsess over every step of the delivery experience. Real-time tracking keeps you in the loop.",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: Leaf,
    title: "Community rooted",
    desc: "We exist to support local food businesses. Every order on FoodHub puts money directly into the hands of local entrepreneurs.",
    color: "text-sky-400",
    bg: "bg-sky-500/10 border-sky-500/20",
  },
];

const TEAM = [
  {
    name: "Sadiq Ibn Masud",
    role: "Founder & CEO",
    bio: "Full-stack developer and food enthusiast. Built FoodHub to connect hungry people with the best local kitchens in Bangladesh.",
    initials: "SI",
    color: "bg-emerald-500",
  },
  {
    name: "Anika Rahman",
    role: "Head of Operations",
    bio: "Oversees provider onboarding and quality control. Ensures every kitchen on FoodHub meets our standards before going live.",
    initials: "AR",
    color: "bg-violet-500",
  },
  {
    name: "Tariq Hassan",
    role: "Lead Engineer",
    bio: "Builds the infrastructure that keeps FoodHub fast, reliable, and scalable — from real-time order tracking to payment processing.",
    initials: "TH",
    color: "bg-amber-500",
  },
];

const TIMELINE = [
  {
    year: "2024",
    title: "FoodHub is born",
    desc: "Started as a course project, FoodHub launched with 3 providers and a handful of meals in Dhaka.",
  },
  {
    year: "2024",
    title: "First 100 orders",
    desc: "Within weeks of launch, FoodHub processed its first 100 orders — validating the idea that local food delivery could work differently.",
  },
  {
    year: "2025",
    title: "Provider network grows",
    desc: "Expanded to 200+ approved providers across Dhaka, Chittagong, and Sylhet. Stripe payments integrated for seamless checkout.",
  },
  {
    year: "2025",
    title: "50K customers milestone",
    desc: "FoodHub crossed 50,000 registered customers — a community of food lovers supporting local kitchens every day.",
  },
];

// ─── Section wrapper with useInView ──────────────────────────────────────────
function AnimatedSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AboutPage() {
  const heroRef = useRef<HTMLElement>(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* ══════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative py-28 md:py-36 overflow-hidden bg-zinc-950"
      >
        {/* Background radial */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1)_0%,transparent_60%)] pointer-events-none" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="container mx-auto px-4 relative text-center">
          <motion.div
            initial="hidden"
            animate={heroInView ? "show" : "hidden"}
            variants={stagger}
            className="max-w-3xl mx-auto"
          >
            <motion.div variants={fadeUp} custom={0} className="mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
                Our story
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            >
              Food connects <span className="text-emerald-400">people</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-zinc-400 text-lg md:text-xl leading-relaxed mb-10"
            >
              FoodHub was built on a simple belief — the best food comes from
              real kitchens run by passionate people, and everyone deserves
              access to it. We&apos;re on a mission to make that happen.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Link
                href="/meals"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-semibold transition-all duration-200 hover:scale-[1.03] shadow-md shadow-emerald-500/25"
              >
                Explore meals
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-zinc-700 hover:border-emerald-500/50 text-zinc-300 hover:text-emerald-400 text-sm font-semibold transition-all duration-200 hover:bg-emerald-500/5"
              >
                Get in touch
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════════════ */}
      <section className="border-y border-zinc-800 bg-zinc-900/50">
        <div className="container mx-auto px-4 py-10">
          <AnimatedSection className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                variants={fadeUp}
                custom={i}
                className="text-center"
              >
                <div className="text-3xl font-bold text-emerald-400 mb-1">
                  {s.value}
                </div>
                <div className="text-sm text-zinc-500">{s.label}</div>
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          MISSION
      ══════════════════════════════════════════════════ */}
      <section className="py-24 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
            {/* Text */}
            <AnimatedSection>
              <motion.p
                variants={fadeUp}
                custom={0}
                className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-1.5"
              >
                <ChefHat className="w-3.5 h-3.5" />
                Our mission
              </motion.p>
              <motion.h2
                variants={fadeUp}
                custom={1}
                className="text-4xl font-bold mb-6 leading-tight"
              >
                Putting local kitchens{" "}
                <span className="text-emerald-400">on the map</span>
              </motion.h2>
              <motion.p
                variants={fadeUp}
                custom={2}
                className="text-zinc-400 leading-relaxed mb-4"
              >
                Bangladesh has an extraordinary food culture — home cooks who
                have perfected recipes over generations, small restaurants with
                flavours you won&apos;t find anywhere else. But reaching
                customers beyond their immediate neighbourhood has always been
                hard.
              </motion.p>
              <motion.p
                variants={fadeUp}
                custom={3}
                className="text-zinc-400 leading-relaxed"
              >
                FoodHub gives these kitchens a digital storefront, a reliable
                delivery network, and access to thousands of customers — all
                with zero upfront cost. We only succeed when our providers
                succeed.
              </motion.p>
            </AnimatedSection>

            {/* Visual card */}
            <AnimatedSection>
              <motion.div
                variants={fadeIn}
                className="relative rounded-3xl overflow-hidden bg-linear-to-br from-emerald-950/60 to-zinc-900 border border-emerald-900/40 p-8"
              >
                {/* Glowing orb inside */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />

                <div className="relative space-y-6">
                  {[
                    { icon: Users, label: "Providers supported", val: "200+" },
                    { icon: Star, label: "Five-star reviews", val: "1,200+" },
                    { icon: ChefHat, label: "Meals delivered", val: "50K+" },
                  ].map(({ icon: Icon, label, val }) => (
                    <div key={label} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-zinc-500 mb-0.5">
                          {label}
                        </div>
                        <div className="font-bold text-white">{val}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          VALUES
      ══════════════════════════════════════════════════ */}
      <section className="py-24 bg-zinc-900/40 border-y border-zinc-800">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-14">
            <motion.p
              variants={fadeUp}
              custom={0}
              className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3"
            >
              What we stand for
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-4xl font-bold"
            >
              Our <span className="text-emerald-400">values</span>
            </motion.h2>
          </AnimatedSection>

          <AnimatedSection className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {VALUES.map((v, i) => (
              <motion.div
                key={v.title}
                variants={fadeUp}
                custom={i}
                className={`flex flex-col gap-4 p-6 rounded-2xl border ${v.bg} transition-all duration-300 hover:-translate-y-1`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${v.bg}`}
                >
                  <v.icon className={`w-5 h-5 ${v.color}`} />
                </div>
                <h3 className="font-bold text-white">{v.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {v.desc}
                </p>
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TIMELINE
      ══════════════════════════════════════════════════ */}
      <section className="py-24 bg-zinc-950">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-14">
            <motion.p
              variants={fadeUp}
              custom={0}
              className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3"
            >
              How we got here
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-4xl font-bold"
            >
              Our <span className="text-emerald-400">journey</span>
            </motion.h2>
          </AnimatedSection>

          <div className="max-w-2xl mx-auto">
            {TIMELINE.map((item, i) => (
              <AnimatedSection key={i} className="flex gap-6 mb-8 last:mb-0">
                {/* Left: year + line */}
                <div className="flex flex-col items-center">
                  <motion.div
                    variants={fadeUp}
                    custom={0}
                    className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0"
                  >
                    <span className="text-[10px] font-bold text-emerald-400">
                      {item.year.slice(2)}
                    </span>
                  </motion.div>
                  {i < TIMELINE.length - 1 && (
                    <div className="w-px flex-1 bg-linear-to-b from-emerald-500/30 to-transparent mt-2" />
                  )}
                </div>
                {/* Right: content */}
                <motion.div variants={fadeUp} custom={1} className="pb-8">
                  <span className="text-xs text-zinc-600 font-medium">
                    {item.year}
                  </span>
                  <h3 className="font-bold text-white mt-1 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TEAM
      ══════════════════════════════════════════════════ */}
      <section className="py-24 bg-zinc-900/40 border-y border-zinc-800">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-14">
            <motion.p
              variants={fadeUp}
              custom={0}
              className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3"
            >
              The people behind FoodHub
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-4xl font-bold"
            >
              Meet the <span className="text-emerald-400">team</span>
            </motion.h2>
          </AnimatedSection>

          <AnimatedSection className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {TEAM.map((member, i) => (
              <motion.div
                key={member.name}
                variants={fadeUp}
                custom={i}
                className="flex flex-col items-center text-center gap-4 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`w-16 h-16 rounded-2xl ${member.color} flex items-center justify-center text-white text-xl font-bold shadow-lg`}
                >
                  {member.initials}
                </div>
                <div>
                  <h3 className="font-bold text-white">{member.name}</h3>
                  <p className="text-xs text-emerald-400 font-medium mt-0.5">
                    {member.role}
                  </p>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {member.bio}
                </p>
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          BOTTOM CTA
      ══════════════════════════════════════════════════ */}
      <section className="py-24 bg-zinc-950">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center max-w-xl mx-auto">
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-4xl font-bold mb-4"
            >
              Hungry? Let&apos;s <span className="text-emerald-400">eat</span>.
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-zinc-400 mb-8"
            >
              Explore hundreds of dishes from local providers — fresh, real, and
              delivered to your door.
            </motion.p>
            <motion.div
              variants={fadeUp}
              custom={2}
              className="flex flex-wrap gap-3 justify-center"
            >
              <Link
                href="/meals"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm transition-all duration-200 hover:scale-[1.03] shadow-md shadow-emerald-500/25"
              >
                Browse meals
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-zinc-700 hover:border-emerald-500/50 text-zinc-300 hover:text-emerald-400 font-semibold text-sm transition-all duration-200"
              >
                Contact us
              </Link>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
