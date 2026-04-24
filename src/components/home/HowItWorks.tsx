"use client";

import {
  MapPin,
  ShoppingBag,
  ShoppingCart,
  UtensilsCrossed,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const steps = [
  {
    icon: ShoppingBag,
    title: "Browse Meals",
    description:
      "Explore hundreds of homemade dishes from local cooks and restaurants around you.",
  },
  {
    icon: ShoppingCart,
    title: "Add & Checkout",
    description:
      "Pick your favorites, add to cart, and pay securely in a few quick taps.",
  },
  {
    icon: MapPin,
    title: "Track Live",
    description:
      "Follow your order in real-time from the kitchen straight to your doorstep.",
  },
  {
    icon: UtensilsCrossed,
    title: "Enjoy!",
    description:
      "Sit back and enjoy fresh, hot food made with love — right at your door.",
  },
];

function useVisible(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
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
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

export function HowItWorks() {
  const { ref: headerRef, visible: headerVisible } = useVisible(0.3);

  return (
    <section className="py-24 bg-zinc-950 relative overflow-hidden">
      {/* Subtle top border line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-linear-to-b from-transparent to-emerald-500/40" />

      <div className="container mx-auto px-4">
        {/* Header */}
        <div
          ref={headerRef}
          className="text-center mb-16"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <p className="text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-3">
            Simple process
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How it works
          </h2>
          <p className="text-zinc-500 max-w-sm mx-auto">
            From craving to delivery in four effortless steps.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Connector line — desktop only */}
          <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-linear-to-r from-transparent via-emerald-500/20 to-transparent" />

          {steps.map((step, i) => (
            <StepCard key={step.title} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepCard({ step, index }: { step: (typeof steps)[0]; index: number }) {
  const { ref, visible } = useVisible(0.15);
  const Icon = step.icon;

  return (
    <div
      ref={ref}
      className="relative flex flex-col items-center text-center group"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.65s ease ${index * 120}ms, transform 0.65s ease ${index * 120}ms`,
      }}
    >
      {/* Step number — top left corner accent */}
      <span
        className="text-[11px] font-bold tracking-widest text-emerald-500/50 uppercase mb-4"
        style={{
          opacity: visible ? 1 : 0,
          transition: `opacity 0.5s ease ${index * 120 + 300}ms`,
        }}
      >
        Step {String(index + 1).padStart(2, "0")}
      </span>

      {/* Icon */}
      <div className="relative w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 group-hover:border-emerald-500/40 flex items-center justify-center mb-5 transition-all duration-300 group-hover:bg-emerald-500/5 group-hover:shadow-lg group-hover:shadow-emerald-500/10">
        <Icon className="w-8 h-8 text-zinc-400 group-hover:text-emerald-400 transition-colors duration-300" />
      </div>

      <h3 className="text-base font-semibold text-white mb-2">{step.title}</h3>
      <p className="text-sm text-zinc-500 leading-relaxed max-w-45">
        {step.description}
      </p>
    </div>
  );
}
