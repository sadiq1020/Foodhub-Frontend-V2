"use client";

import { motion, type Variants } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-24 pb-16">
      <div className="container max-w-4xl mx-auto px-4">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={FADE_UP} className="space-y-4 text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Privacy Policy
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </motion.div>

          {/* Content Wrapper */}
          <motion.div variants={FADE_UP} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 md:p-12 shadow-sm space-y-10">
            
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">1. Information We Collect</h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                At FoodHub, we collect information that you provide directly to us when creating an account, updating your profile, placing an order, or contacting customer support. This may include your name, email address, delivery address, phone number, and payment information.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">2. How We Use Your Information</h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                We use the information we collect to provide, maintain, and improve our services. This includes processing transactions, sending you order updates, providing customer support, and personalizing your experience with tailored meal recommendations.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">3. Data Sharing and Security</h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                We do not sell your personal information. We may share necessary details with our food providers and delivery partners strictly for the purpose of fulfilling your order. We implement industry-standard security measures to protect your data from unauthorized access or disclosure.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">4. Cookies and Tracking</h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                FoodHub uses cookies and similar tracking technologies to analyze trends, administer the website, track users' movements around the site, and gather demographic information about our user base as a whole. You can control the use of cookies at the individual browser level.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">5. Contact Us</h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at <a href="mailto:support@foodhub.com" className="text-emerald-500 hover:underline">support@foodhub.com</a>.
              </p>
            </section>

          </motion.div>

          {/* Footer Back Link */}
          <motion.div variants={FADE_UP} className="text-center pt-8">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">
              &larr; Back to Home
            </Link>
          </motion.div>

        </motion.div>
      </div>
    </main>
  );
}
