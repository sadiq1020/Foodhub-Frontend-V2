"use client";

import { motion, useInView, type Variants } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Sparkles,
} from "lucide-react";
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

// ─── Contact info data ────────────────────────────────────────────────────────
const CONTACT_CARDS = [
  {
    icon: Mail,
    label: "Email us",
    value: "support@foodhub.com",
    sub: "We reply within 24 hours",
    href: "mailto:support@foodhub.com",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: Phone,
    label: "Call us",
    value: "+880 1700 000 000",
    sub: "Sun – Thu, 9 AM – 6 PM",
    href: "tel:+8801700000000",
    color: "text-sky-400",
    bg: "bg-sky-500/10 border-sky-500/20",
  },
  {
    icon: MapPin,
    label: "Visit us",
    value: "Zero Point, Dhaka",
    sub: "Dhaka 1000, Bangladesh",
    href: "https://maps.google.com/?q=Zero+Point+Dhaka",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: Clock,
    label: "Office hours",
    value: "Sun – Thu",
    sub: "9:00 AM – 6:00 PM (BST)",
    href: null,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
  },
];

const SOCIALS = [
  {
    icon: Facebook,
    label: "Facebook",
    handle: "@sadiqIbnmasud",
    href: "https://www.facebook.com/sadiqIbnmasud/",
    color: "hover:text-blue-400 hover:border-blue-400/40 hover:bg-blue-500/5",
  },
  {
    icon: Instagram,
    label: "Instagram",
    handle: "@sadiqibnmasud",
    href: "https://www.instagram.com/sadiqibnmasud/",
    color: "hover:text-pink-400 hover:border-pink-400/40 hover:bg-pink-500/5",
  },
  {
    icon: Mail,
    label: "Email",
    handle: "support@foodhub.com",
    href: "mailto:support@foodhub.com",
    color:
      "hover:text-emerald-400 hover:border-emerald-400/40 hover:bg-emerald-500/5",
  },
];

const SUBJECTS = [
  "General enquiry",
  "Order issue",
  "Become a provider",
  "Partnership",
  "Feedback",
  "Other",
];

// ─── Contact form ─────────────────────────────────────────────────────────────
type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function ContactForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required.";
    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!form.subject) newErrors.subject = "Please select a subject.";
    if (form.message.trim().length < 10)
      newErrors.message = "Message must be at least 10 characters.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus("loading");
    // Simulate API call — replace with real endpoint if needed
    setTimeout(() => setStatus("success"), 1400);
  };

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex flex-col items-center justify-center gap-5 py-16 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Message sent!</h3>
          <p className="text-zinc-400 text-sm max-w-xs">
            Thanks for reaching out. We&apos;ll get back to you at{" "}
            <span className="text-emerald-400">{form.email}</span> within 24
            hours.
          </p>
        </div>
        <button
          onClick={() => {
            setForm({ name: "", email: "", subject: "", message: "" });
            setStatus("idle");
          }}
          className="text-sm text-zinc-500 hover:text-emerald-400 transition-colors duration-200 underline underline-offset-2"
        >
          Send another message
        </button>
      </motion.div>
    );
  }

  const inputCls = (field: keyof FormState) =>
    `w-full px-4 py-3 rounded-xl text-sm
    bg-zinc-900 border
    text-zinc-100 placeholder:text-zinc-600
    focus:outline-none focus:ring-2 focus:ring-emerald-500/40
    transition-all duration-200
    ${
      errors[field]
        ? "border-red-500/60 focus:ring-red-500/30"
        : "border-zinc-700 hover:border-zinc-600 focus:border-emerald-500/50"
    }`;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      {/* Name + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-zinc-400 mb-1.5 block">
            Full name <span className="text-red-400">*</span>
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Sadiq Ibn Masud"
            className={inputCls("name")}
          />
          {errors.name && (
            <p className="text-xs text-red-400 mt-1">{errors.name}</p>
          )}
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-400 mb-1.5 block">
            Email address <span className="text-red-400">*</span>
          </label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className={inputCls("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-400 mt-1">{errors.email}</p>
          )}
        </div>
      </div>

      {/* Subject */}
      <div>
        <label className="text-xs font-medium text-zinc-400 mb-1.5 block">
          Subject <span className="text-red-400">*</span>
        </label>
        <select
          name="subject"
          value={form.subject}
          onChange={handleChange}
          className={`${inputCls("subject")} cursor-pointer`}
        >
          <option value="" disabled>
            Select a subject…
          </option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s} className="bg-zinc-900">
              {s}
            </option>
          ))}
        </select>
        {errors.subject && (
          <p className="text-xs text-red-400 mt-1">{errors.subject}</p>
        )}
      </div>

      {/* Message */}
      <div>
        <label className="text-xs font-medium text-zinc-400 mb-1.5 block">
          Message <span className="text-red-400">*</span>
        </label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={5}
          placeholder="Tell us how we can help…"
          className={`${inputCls("message")} resize-none`}
        />
        <div className="flex items-center justify-between mt-1">
          {errors.message ? (
            <p className="text-xs text-red-400">{errors.message}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-zinc-600">
            {form.message.length}/500
          </span>
        </div>
      </div>

      {/* Submit */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={status === "loading"}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-zinc-950 font-semibold text-sm transition-all duration-200 shadow-md shadow-emerald-500/20 cursor-pointer"
      >
        {status === "loading" ? (
          <>
            <svg
              className="animate-spin w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            Sending…
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Send message
          </>
        )}
      </motion.button>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ContactPage() {
  const heroRef = useRef<HTMLElement>(null);
  const heroInView = useInView(heroRef, { once: true });

  const cardsRef = useRef<HTMLDivElement>(null);
  const cardsInView = useInView(cardsRef, { once: true, margin: "-60px" });

  const formRef = useRef<HTMLDivElement>(null);
  const formInView = useInView(formRef, { once: true, margin: "-60px" });

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* ══════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative py-28 md:py-32 overflow-hidden bg-zinc-950"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08)_0%,transparent_60%)] pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
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
            className="max-w-2xl mx-auto"
          >
            <motion.div variants={fadeUp} custom={0} className="mb-5">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
                <MessageSquare className="w-3.5 h-3.5" />
                We&apos;d love to hear from you
              </span>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-5xl md:text-6xl font-bold mb-5 leading-tight"
            >
              Get in <span className="text-emerald-400">touch</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-zinc-400 text-lg leading-relaxed"
            >
              Have a question, a partnership idea, or just want to say hello?
              Fill out the form below or reach us directly — we reply to
              everything.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CONTACT INFO CARDS
      ══════════════════════════════════════════════════ */}
      <section className="pb-8 bg-zinc-950">
        <div className="container mx-auto px-4">
          <motion.div
            ref={cardsRef}
            initial="hidden"
            animate={cardsInView ? "show" : "hidden"}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto"
          >
            {CONTACT_CARDS.map((card, i) => {
              const content = (
                <motion.div
                  key={card.label}
                  variants={fadeUp}
                  custom={i}
                  className={`
                    flex flex-col gap-3 p-5 rounded-2xl border transition-all duration-300
                    hover:-translate-y-0.5 hover:shadow-lg
                    ${card.bg}
                    ${card.href ? "cursor-pointer" : ""}
                  `}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.bg}`}
                  >
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 font-medium mb-0.5">
                      {card.label}
                    </p>
                    <p className="text-sm font-semibold text-white">
                      {card.value}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">{card.sub}</p>
                  </div>
                </motion.div>
              );

              return card.href ? (
                <a
                  key={card.label}
                  href={card.href}
                  target={card.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                >
                  {content}
                </a>
              ) : (
                <div key={card.label}>{content}</div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          MAIN: FORM + SIDEBAR
      ══════════════════════════════════════════════════ */}
      <section className="py-16 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div
            ref={formRef}
            className="grid grid-cols-1 lg:grid-cols-5 gap-10 max-w-5xl mx-auto"
          >
            {/* ── Contact form (3/5 width) ── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={formInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: EASE }}
              className="lg:col-span-3 p-8 rounded-3xl bg-zinc-900 border border-zinc-800"
            >
              <div className="mb-7">
                <h2 className="text-2xl font-bold text-white mb-1">
                  Send us a message
                </h2>
                <p className="text-sm text-zinc-500">
                  All fields marked <span className="text-red-400">*</span> are
                  required.
                </p>
              </div>
              <ContactForm />
            </motion.div>

            {/* ── Sidebar (2/5 width) ── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={formInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.12, ease: EASE }}
              className="lg:col-span-2 flex flex-col gap-6"
            >
              {/* Social links */}
              <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Follow us
                </h3>
                <div className="flex flex-col gap-3">
                  {SOCIALS.map(({ icon: Icon, label, handle, href, color }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className={`
                        flex items-center gap-3 p-3 rounded-xl
                        border border-zinc-700 text-zinc-400
                        transition-all duration-200
                        ${color}
                      `}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold">{label}</p>
                        <p className="text-[11px] text-zinc-600">{handle}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Office location */}
              <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  Office address
                </h3>
                <address className="not-italic text-sm text-zinc-400 leading-relaxed">
                  FoodHub Headquarters
                  <br />
                  Zero Point, Motijheel
                  <br />
                  Dhaka 1000
                  <br />
                  Bangladesh
                </address>
                <a
                  href="https://maps.google.com/?q=Zero+Point+Dhaka"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 mt-4 text-xs text-emerald-400 hover:text-emerald-300 transition-colors duration-200"
                >
                  Open in Google Maps
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>

              {/* Response time promise */}
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-white mb-1">
                      We reply within 24 hours
                    </p>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Our support team is available Sunday–Thursday, 9 AM–6 PM
                      BST. Urgent issues? Email us directly.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Need this import for ArrowRight in sidebar
function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
