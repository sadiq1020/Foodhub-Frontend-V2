"use client";

import { motion, type Variants } from "framer-motion";
import { FileText } from "lucide-react";
import Link from "next/link";

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function TermsOfService() {
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
              <FileText className="w-8 h-8 text-emerald-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Terms of Service
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </motion.div>

          {/* Content Wrapper */}
          <motion.div variants={FADE_UP} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 md:p-12 shadow-sm space-y-10">
            
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">1. Acceptance of Terms</h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                By accessing and using the FoodHub platform, you agree to be bound by these Terms of Service. If you do not agree to all of the terms and conditions, then you may not access the platform or use any of our services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">2. User Accounts</h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">3. Orders and Payments</h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                All orders are subject to acceptance by the respective food providers. Prices for meals are subject to change without notice. We reserve the right to refuse or cancel your order at any time for reasons including but not limited to: product or service availability, errors in the description or price, or suspected fraud.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">4. Intellectual Property</h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                The platform and its original content, features, and functionality are and will remain the exclusive property of FoodHub and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">5. Limitation of Liability</h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                In no event shall FoodHub, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the platform.
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
