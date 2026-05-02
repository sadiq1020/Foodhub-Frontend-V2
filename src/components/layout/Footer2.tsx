"use client";

import { motion, useInView, type Variants } from "framer-motion";
import {
  ChefHat,
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Send,
  Star,
  Twitter,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Data ───────────────────────────────────────────────────────────────────

const NAV_SECTIONS = [
  {
    title: "Explore",
    links: [
      { label: "Browse Meals", href: "/meals" },
      { label: "Food Providers", href: "/provider-profile" },
      { label: "Categories", href: "/meals" },
      { label: "Top Rated", href: "/meals?sortBy=rating&sortOrder=desc" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

const SOCIALS = [
  { icon: Facebook, href: "https://www.facebook.com/sadiqIbnmasud/", label: "Facebook" },
  { icon: Instagram, href: "https://www.instagram.com/sadiqibnmasud/", label: "Instagram" },
  { icon: Twitter, href: "https://x.com/sadiq_ibn_masud", label: "Twitter" },
  { icon: Youtube, href: "https://www.youtube.com/", label: "YouTube" },
];

const STATS = [
  { value: "50K+", label: "Happy Customers" },
  { value: "1,200+", label: "Menu Items" },
  { value: "200+", label: "Providers" },
  { value: "4.9", label: "Avg. Rating" },
];

// ─── Animation Variants ─────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE, delay: i * 0.07 },
  }),
};

// ─── Sub-components ─────────────────────────────────────────────────────────

function NewsletterInput() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("foodhub_newsletter_subscribed")) {
      setIsSubscribed(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    toast.success("Thanks for subscribing! We'll send the best food deals your way.", {
      icon: "🎉",
    });

    setIsSubscribed(true);
    setEmail("");
    localStorage.setItem("foodhub_newsletter_subscribed", "true");
  };

  if (isSubscribed) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-4 py-3 mt-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
      >
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
          <Send className="w-4 h-4" />
        </div>
        <p className="text-sm font-medium">You're already on our list! 🎉</p>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 mt-4 group"
    >
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="
            w-full pl-10 pr-4 py-2.5 rounded-xl text-sm
            bg-zinc-100 dark:bg-zinc-800
            border border-zinc-200 dark:border-zinc-700
            text-zinc-900 dark:text-zinc-100
            placeholder:text-zinc-400
            focus:outline-none focus:ring-2 focus:ring-emerald-500/50
            transition-all duration-200
          "
        />
      </div>
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        type="submit"
        className="
          flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium
          bg-emerald-500 hover:bg-emerald-400 text-white
          transition-colors duration-200 shrink-0 cursor-pointer
        "
      >
        <Send className="w-3.5 h-3.5" />
        Subscribe
      </motion.button>
    </form>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function Footer2() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <footer
      ref={ref}
      className="relative bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 overflow-hidden"
    >
      {/* Subtle decorative gradient top edge */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-500/40 to-transparent" />

      {/* ── Stats bar ─────────────────────────────────────────────────── */}
      <div className="border-b border-zinc-100 dark:border-zinc-800">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                initial="hidden"
                animate={isInView ? "show" : "hidden"}
                variants={fadeUp}
                className="flex flex-col items-center gap-0.5 py-2"
              >
                <span className="text-2xl font-bold text-emerald-500">
                  {stat.value}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main footer grid ──────────────────────────────────────────── */}
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand column */}
          <motion.div
            custom={0}
            initial="hidden"
            animate={isInView ? "show" : "hidden"}
            variants={fadeUp}
            className="lg:col-span-4 flex flex-col gap-5"
          >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 w-fit group">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700 group-hover:ring-emerald-400 transition-all duration-300">
                <Image
                  src="/images/logo.png"
                  alt="FoodHub"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-xl font-bold tracking-tight">
                <span className="text-emerald-500">Food</span>
                <span className="text-zinc-900 dark:text-zinc-50">Hub</span>
              </span>
            </Link>

            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs">
              Connecting hungry people with the finest local food providers.
              Fresh meals, reliable delivery, and an experience worth repeating.
            </p>

            {/* Contact info */}
            <div className="flex flex-col gap-2.5">
              {[
                {
                  icon: Mail,
                  text: "support@foodhub.com",
                  href: "mailto:support@foodhub.com",
                },
                {
                  icon: Phone,
                  text: "+880 1700 000 000",
                  href: "tel:+8801700000000",
                },
                { icon: MapPin, text: "Dhaka, Bangladesh", href: "#" },
                { icon: Clock, text: "Open daily · 8 AM – 11 PM", href: "#" },
              ].map(({ icon: Icon, text, href }) => (
                <a
                  key={text}
                  href={href}
                  className="flex items-center gap-2.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors duration-200 w-fit"
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {text}
                </a>
              ))}
            </div>

            {/* Socials */}
            <div className="flex items-center gap-2 mt-1">
              {SOCIALS.map(({ icon: Icon, href, label }, i) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="
                    w-9 h-9 rounded-xl flex items-center justify-center
                    bg-zinc-100 dark:bg-zinc-800
                    text-zinc-500 dark:text-zinc-400
                    hover:bg-emerald-50 dark:hover:bg-emerald-950/40
                    hover:text-emerald-500 dark:hover:text-emerald-400
                    border border-zinc-200 dark:border-zinc-700
                    hover:border-emerald-300 dark:hover:border-emerald-800
                    transition-colors duration-200
                  "
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Nav columns */}
          {NAV_SECTIONS.map((section, si) => (
            <motion.div
              key={section.title}
              custom={si + 1}
              initial="hidden"
              animate={isInView ? "show" : "hidden"}
              variants={fadeUp}
              className="lg:col-span-2 flex flex-col gap-4"
            >
              <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                {section.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {section.links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="
                        text-sm text-zinc-600 dark:text-zinc-400
                        hover:text-emerald-500 dark:hover:text-emerald-400
                        transition-colors duration-200
                        relative group w-fit flex items-center gap-1
                      "
                    >
                      <span className="absolute -left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-emerald-500">
                        ›
                      </span>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Newsletter column */}
          <motion.div
            custom={4}
            initial="hidden"
            animate={isInView ? "show" : "hidden"}
            variants={fadeUp}
            className="lg:col-span-2 flex flex-col gap-4"
          >
            <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Newsletter
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Get weekly deals, new restaurant alerts, and food inspiration
              straight to your inbox.
            </p>
            <NewsletterInput />

            {/* Trust badge */}
            <div className="flex items-center gap-2 mt-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
              <div className="flex shrink-0">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500"
                  />
                ))}
              </div>
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                4.9 rated by 50,000+ customers
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────────────────────── */}
      <div className="border-t border-zinc-100 dark:border-zinc-800">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
              <ChefHat className="w-3.5 h-3.5 text-emerald-500" />
              <span>
                © {new Date().getFullYear()} FoodHub. Made with love in
                Bangladesh.
              </span>
            </div>
            <div className="flex items-center gap-4">
              {[
                { label: "Privacy", href: "/privacy" },
                { label: "Terms", href: "/terms" },
                { label: "Cookies", href: "#" },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors duration-200"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Keep default export for backward compat
export default Footer2;
