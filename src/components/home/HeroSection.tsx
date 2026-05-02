"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Clock, Search, Shield, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const KEYFRAMES = `
@keyframes heroFadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes heroFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes heroBadgeSlide {
  from { opacity: 0; transform: translateX(-16px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes gridPan {
  0%   { transform: translate(0, 0); }
  100% { transform: translate(60px, 60px); }
}
@keyframes glowPulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50%       { opacity: 0.7; transform: scale(1.08); }
}
@keyframes counterUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes floatY {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-12px); }
}
@keyframes drawUnderline {
  from { stroke-dashoffset: 400; }
  to   { stroke-dashoffset: 0; }
}
@keyframes dotBlink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}
`;

function fu(delay: number): React.CSSProperties {
  return {
    opacity: 0,
    animation: `heroFadeUp 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
    animationDelay: `${delay}ms`,
  };
}

const TRUST_ITEMS = [
  { icon: Star, label: "4.9 rated", sub: "by customers" },
  { icon: Clock, label: "30 min", sub: "avg delivery" },
  { icon: Shield, label: "Safe & fresh", sub: "guaranteed" },
];

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (document.getElementById("hero-kf-v2")) return;
    const s = document.createElement("style");
    s.id = "hero-kf-v2";
    s.textContent = KEYFRAMES;
    document.head.appendChild(s);
    return () => s.remove();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      searchQuery.trim()
        ? `/meals?search=${encodeURIComponent(searchQuery.trim())}`
        : "/meals",
    );
  };

  return (
    <section className="relative min-h-svh flex items-center justify-center overflow-hidden bg-zinc-950">
      {/* Moving grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,214,143,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(0,214,143,0.8) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          animation: "gridPan 20s linear infinite",
          backgroundPosition: "0 0",
        }}
      />

      {/* Glow orbs */}
      <div
        className="absolute top-[-10%] left-[-5%] w-150 h-150 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(0,214,143,0.12) 0%, transparent 70%)",
          animation: "glowPulse 8s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-[-15%] right-[-5%] w-175 h-175 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(20,184,166,0.1) 0%, transparent 70%)",
          animation: "glowPulse 11s ease-in-out infinite reverse",
        }}
      />

      {/* Floating food cards — decorative, right side */}
      <div
        className="absolute right-[4%] top-[18%] hidden xl:flex flex-col gap-3 pointer-events-none"
        style={{ animation: "floatY 6s ease-in-out infinite" }}
      >
        {["🍜 Pad Thai", "🍕 Margherita", "🌮 Street Tacos"].map((item, i) => (
          <div
            key={item}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-200 border border-zinc-700/60 bg-zinc-900/80 backdrop-blur-sm"
            style={{
              opacity: 0,
              animation: `heroFadeUp 0.6s ease forwards`,
              animationDelay: `${1200 + i * 150}ms`,
            }}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
        {/* Live badge */}
        <div
          style={{
            opacity: 0,
            animation: "heroBadgeSlide 0.6s ease forwards",
            animationDelay: "100ms",
            display: "inline-flex",
            marginBottom: "2rem",
          }}
        >
          <div className="inline-flex items-center gap-2.5 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-4 py-2 rounded-full tracking-widest uppercase">
            <span
              className="w-1.5 h-1.5 rounded-full bg-emerald-400"
              style={{ animation: "dotBlink 1.5s ease-in-out infinite" }}
            />
            Now delivering near you
          </div>
        </div>

        {/* Headline */}
        <div style={fu(250)}>
          <h1 className="text-[clamp(2.6rem,7vw,5.5rem)] font-black leading-[0.95] tracking-tight mb-8 text-white">
            Food that feels
            <br />
            <span className="relative inline-block mt-2">
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #00d68f 0%, #14b8a6 50%, #06b6d4 100%)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "shimmer 4s linear infinite",
                  animationDelay: "1000ms",
                }}
              >
                like home.
              </span>
              {/* Animated underline */}
              <svg
                className="absolute -bottom-3 left-0 w-full"
                viewBox="0 0 400 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 10 Q100 3 200 9 Q300 15 396 8"
                  stroke="url(#teal-grad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="400"
                  strokeDashoffset="400"
                  style={{
                    animation: "drawUnderline 1.2s ease forwards",
                    animationDelay: "900ms",
                  }}
                />
                <defs>
                  <linearGradient id="teal-grad" x1="0" y1="0" x2="400" y2="0">
                    <stop stopColor="#00d68f" />
                    <stop offset="1" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>
        </div>

        {/* Subheadline */}
        <div style={fu(420)}>
          <p className="text-lg md:text-xl text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed font-light">
            Local cooks. Homemade recipes. Delivered fresh to your door — every
            single day.
          </p>
        </div>

        {/* Search */}
        <div style={fu(560)}>
          <form
            onSubmit={handleSearch}
            className="relative flex items-center max-w-lg mx-auto mb-8 group"
          >
            <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-emerald-500/20 to-cyan-500/20 blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="relative flex items-center w-full bg-zinc-900 border border-zinc-700 group-focus-within:border-emerald-500/60 rounded-2xl px-4 py-3 gap-3 transition-colors duration-300">
              <Search className="w-5 h-5 text-zinc-500 shrink-0" />
              <Input
                type="text"
                placeholder="Search biriyani, pizza, sushi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 bg-transparent shadow-none focus-visible:ring-0 placeholder:text-zinc-600 text-zinc-100 flex-1 p-0 text-base"
              />
              <Button
                type="submit"
                size="sm"
                className="rounded-xl shrink-0 font-semibold px-5 text-zinc-950"
                style={{
                  background:
                    "linear-gradient(135deg, #00d68f 0%, #14b8a6 100%)",
                }}
              >
                Search
              </Button>
            </div>
          </form>
        </div>

        {/* CTAs */}
        <div style={fu(700)}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
            <Button
              asChild
              size="lg"
              className="rounded-xl px-8 font-semibold text-zinc-950 h-12 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg hover:shadow-emerald-500/25"
              style={{
                background: "linear-gradient(135deg, #00d68f 0%, #14b8a6 100%)",
              }}
            >
              <Link href="/meals" className="flex items-center gap-2">
                Browse Meals
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-xl px-8 h-12 border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white hover:bg-zinc-800 transition-all duration-200"
            >
              <Link href="/providers">Meet Our Cooks</Link>
            </Button>
          </div>
        </div>

        {/* Trust bar */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {TRUST_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-2.5"
                style={{
                  opacity: 0,
                  animation: "counterUp 0.5s ease forwards",
                  animationDelay: `${900 + i * 120}ms`,
                }}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white leading-none">
                    {item.label}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">{item.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom fade to page bg */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
