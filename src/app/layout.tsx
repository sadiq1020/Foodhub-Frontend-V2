import { AIChatbot } from "@/components/chat/AIChatbot";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { SessionRefresher } from "@/components/SessionRefresher";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/providers/ThemeProvider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FoodHub — Delicious food, delivered",
  description: "Best Platform to find your next meal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionRefresher />
          <Navbar />
          <main className="pt-16">{children}</main>
          <Toaster />
          <Footer />
          {/* AI Chatbot — floats above everything, visible on all pages */}
          <AIChatbot />
        </ThemeProvider>
      </body>
    </html>
  );
}
