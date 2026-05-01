"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion, useInView, type Variants } from "framer-motion";
import { HelpCircle, MessageCircle, Plus } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

// ─── FAQ Data ─────────────────────────────────────────────────────────────────
const FAQ_CATEGORIES = [
  {
    label: "Ordering",
    faqs: [
      {
        q: "How do I place an order on FoodHub?",
        a: "Browse meals from our providers, add your favourite items to the cart, fill in your delivery address, and complete payment via Stripe. You'll receive a confirmation email with your order details and a payment link.",
      },
      {
        q: "Can I order from multiple providers at the same time?",
        a: "Currently each order is fulfilled by a single provider. If you'd like food from different kitchens, simply place separate orders — there's no minimum order limit.",
      },
      {
        q: "How do I track my order after placing it?",
        a: "Head to My Orders in your account. Each order shows a live status: Placed → Preparing → Ready → Delivered. You'll also receive an email whenever the status changes.",
      },
      {
        q: "Can I cancel an order after placing it?",
        a: "Yes — but only while the order is still in the Placed status and unpaid. Once a provider starts preparing your food or payment is confirmed, cancellation is no longer available. Contact support if you need help.",
      },
    ],
  },
  {
    label: "Payments",
    faqs: [
      {
        q: "What payment methods does FoodHub accept?",
        a: "We accept all major debit and credit cards via Stripe (Visa, Mastercard, Amex). Payment is processed securely — FoodHub never stores your card details.",
      },
      {
        q: "Is my payment information secure?",
        a: "Absolutely. All payments are handled by Stripe, which is PCI-DSS Level 1 certified — the highest level of payment security. Your card data never touches our servers.",
      },
      {
        q: "What happens if my payment fails?",
        a: "Your order will remain in an unpaid state. You can retry payment from the order detail page. If the issue persists, try a different card or contact your bank.",
      },
    ],
  },
  {
    label: "Providers",
    faqs: [
      {
        q: "How do I become a food provider on FoodHub?",
        a: "Register an account, then apply for a Provider profile from your dashboard. Fill in your business name, address, and description. An admin will review and approve your application — you'll get an email notification once approved.",
      },
      {
        q: "How long does provider approval take?",
        a: "Most applications are reviewed within 24–48 hours. You'll receive an email as soon as a decision is made. If approved, you can immediately start adding meals to your menu.",
      },
      {
        q: "Can I update my menu after going live?",
        a: "Yes — from your Provider Dashboard you can add, edit, or mark meals as unavailable at any time. Changes go live immediately.",
      },
    ],
  },
  {
    label: "Reviews",
    faqs: [
      {
        q: "Who can leave a review?",
        a: "Only customers who have received a delivered order containing that specific meal can leave a review. This ensures all reviews on FoodHub are from genuine purchases.",
      },
      {
        q: "Can I edit or delete my review?",
        a: "Yes — go to your order history, find the relevant order, and you can edit or remove your review at any time from the order detail page.",
      },
    ],
  },
];

// Flatten all FAQs for the \"All\" view
const ALL_FAQS = FAQ_CATEGORIES.flatMap((c) => c.faqs);

// ─── Animation ────────────────────────────────────────────────────────────────
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

// ─── Category pill ────────────────────────────────────────────────────────────
function CategoryPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`
        relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer
        ${
          active
            ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
            : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-300 dark:hover:border-emerald-800 hover:text-emerald-600 dark:hover:text-emerald-400"
        }
      `}
    >
      {label}
    </motion.button>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export function FAQSection() {
  const [activeCategory, setActiveCategory] = useState("All");

  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const categories = ["All", ...FAQ_CATEGORIES.map((c) => c.label)];

  const visibleFaqs =
    activeCategory === "All"
      ? ALL_FAQS
      : (FAQ_CATEGORIES.find((c) => c.label === activeCategory)?.faqs ?? []);

  return (
    <section
      ref={ref}
      className="relative py-20 bg-white dark:bg-zinc-950 overflow-hidden"
    >
      {/* ── Dot grid (same pattern as StatsSection) ── */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* ── Subtle emerald glow top-right ── */}
      <motion.div
        className="absolute top-0 right-0 w-80 h-80 rounded-full bg-emerald-400/6 blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container mx-auto px-4 relative">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: EASE }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              Got questions?
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
            Frequently asked <span className="text-emerald-500">questions</span>
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto text-sm md:text-base">
            Everything you need to know about ordering, payments, and becoming a
            provider on FoodHub.
          </p>
        </motion.div>

        {/* ── Category filter pills ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
          className="flex flex-wrap items-center justify-center gap-2 mb-10"
        >
          {categories.map((cat) => (
            <CategoryPill
              key={cat}
              label={cat}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            />
          ))}
        </motion.div>

        {/* ── Two-column accordion layout ── */}
        <div className="max-w-4xl mx-auto">
          <motion.div
            key={activeCategory} // re-triggers stagger on category change
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            variants={containerVariants}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          >
            {visibleFaqs.map((faq, i) => (
              <motion.div
                key={`${activeCategory}-${i}`}
                variants={itemVariants}
                className="
                  rounded-2xl overflow-hidden
                  bg-zinc-50 dark:bg-zinc-900
                  border border-zinc-100 dark:border-zinc-800
                  hover:border-emerald-200 dark:hover:border-emerald-900
                  transition-colors duration-200
                "
              >
                <Accordion type="single" collapsible>
                  <AccordionItem
                    value={`faq-${i}`}
                    className="border-none px-5"
                  >
                    <AccordionTrigger
                      className="
                        text-sm font-semibold text-zinc-800 dark:text-zinc-100
                        hover:no-underline hover:text-emerald-500 dark:hover:text-emerald-400
                        py-5 gap-3 transition-colors duration-200
                        data-[state=open]:text-emerald-500
                        dark:data-[state=open]:text-emerald-400
                        [&>svg]:text-zinc-400
                        [&[data-state=open]>svg]:text-emerald-500
                      "
                    >
                      <span className="flex items-start gap-3 text-left">
                        <Plus className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500 data-[state=open]:rotate-45 transition-transform duration-200" />
                        {faq.q}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed pb-5 pl-7">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </motion.div>
            ))}
          </motion.div>

          {/* ── Still have questions CTA ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.55, ease: EASE }}
            className="
              mt-12 flex flex-col sm:flex-row items-center justify-between gap-4
              p-6 rounded-2xl
              bg-emerald-50 dark:bg-emerald-950/30
              border border-emerald-100 dark:border-emerald-900/50
            "
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                  Still have questions?
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Our support team is here to help.
                </p>
              </div>
            </div>
            <Link
              href="/contact"
              className="
                shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold
                bg-emerald-500 hover:bg-emerald-400 text-white
                shadow-md shadow-emerald-500/20
                hover:shadow-lg hover:shadow-emerald-500/30
                transition-all duration-200 hover:scale-[1.03]
              "
            >
              Contact support
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
