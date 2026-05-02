"use client";

import { useSession } from "@/lib/auth-client";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  ChefHat,
  Loader2,
  MessageSquare,
  RefreshCw,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = "user" | "model";

interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
}

// ─── System prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are FoodBot, a friendly and knowledgeable food assistant for FoodHub — a food delivery platform connecting customers with local food providers in Bangladesh.

Your personality: warm, enthusiastic about food, concise, and helpful. You use occasional food emojis to keep things lively but don't overdo it.

You can help with:
- Recommending meals based on preferences, dietary needs, or mood
- Answering questions about food types (Bangladeshi cuisine, Chinese, Italian, etc.)
- Helping users decide what to order (ask about their preferences: spicy/mild, vegetarian/non-veg, budget)
- Explaining how FoodHub works (browse meals → add to cart → checkout → track delivery)
- Answering FAQs about orders, payments, delivery, and providers
- Suggesting popular dishes like Kacchi Biryani, Chicken Chow Mein, Beef Pizza, etc.

Important rules:
- Keep responses SHORT — max 3-4 sentences unless a list is clearly needed
- Never make up specific prices or provider names you don't know
- If asked about a specific order status, tell them to check My Orders in their account
- If asked something completely unrelated to food or FoodHub, politely redirect
- Always end food recommendations with a follow-up like "Want me to suggest something else?"

FoodHub context:
- Delivery fee is ৳50
- Payment is via Stripe (card)
- Order statuses: Placed → Preparing → Ready → Delivered
- Providers are manually approved before listing meals`;

// ─── Quick prompts ────────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  "Suggest something spicy 🌶️",
  "I'm vegetarian, what can I eat?",
  "How does delivery work?",
  "What's popular right now?",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
          isUser
            ? "bg-emerald-500 text-white"
            : "bg-zinc-800 border border-zinc-700"
        }`}
      >
        {isUser ? (
          <span className="text-[10px] font-bold">You</span>
        ) : (
          <Bot className="w-3.5 h-3.5 text-emerald-400" />
        )}
      </div>
      <div
        className={`max-w-[78%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}
      >
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-emerald-500 text-white rounded-tr-sm"
              : "bg-zinc-800 text-zinc-100 border border-zinc-700/60 rounded-tl-sm"
          }`}
        >
          {msg.content}
        </div>
        <span className="text-[10px] text-zinc-600 px-1">
          {formatTime(msg.timestamp)}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className="flex gap-2.5"
    >
      <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
        <Bot className="w-3.5 h-3.5 text-emerald-400" />
      </div>
      <div className="bg-zinc-800 border border-zinc-700/60 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-emerald-400"
              animate={{ y: [0, -5, 0] }}
              transition={{
                duration: 0.7,
                delay: i * 0.15,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();
  const userName = session?.user?.name?.split(" ")[0] ?? "there";
  const lastRequestRef = useRef<number>(0);
  const COOLDOWN_MS = 2000;

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "model",
          content: `Hey ${userName}! 👋 I'm FoodBot, your FoodHub assistant. I can help you find the perfect meal, answer questions about orders, or explain how FoodHub works. What can I help you with today?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setHasUnread(false);
    }
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const now = Date.now();
    if (now - lastRequestRef.current < COOLDOWN_MS) return;
    lastRequestRef.current = now;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Build conversation history (exclude welcome messages)
      const history = messages
        .filter((m) => m.id !== "welcome" && m.id !== "welcome-reset")
        .map((m) => ({
          role: m.role,
          parts: [{ text: m.content }],
        }));

      const contents = [
        ...history,
        { role: "user", parts: [{ text: trimmed }] },
      ];

      // ✅ Call our own API route instead of Gemini directly
      // This avoids CORS issues and keeps the API key server-side
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents,
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.7,
          },
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          `${response.status}:${errData?.error?.message ?? response.statusText}`,
        );
      }

      const data = await response.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

      const assistantMsg: Message = {
        id: `model-${Date.now()}`,
        role: "model",
        content:
          reply || "Sorry, I couldn't generate a response. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (!isOpen) setHasUnread(true);
    } catch (err) {
      const errStr = String(err);
      const isRateLimit =
        errStr.includes("429") ||
        errStr.toLowerCase().includes("quota") ||
        errStr.toLowerCase().includes("too many");

      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "model",
          content: isRateLimit
            ? "I'm getting too many requests — please wait a few seconds and try again! ⏳"
            : "Sorry, I'm having trouble connecting right now. Please try again in a moment! 🙏",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setTimeout(() => {
      setMessages([
        {
          id: "welcome-reset",
          role: "model",
          content: `Fresh start! 🍽️ What are you craving today, ${userName}?`,
          timestamp: new Date(),
        },
      ]);
    }, 80);
  };

  return (
    <>
      {/* ── Chat panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="
              fixed bottom-24 right-4 sm:right-6 z-50
              w-[calc(100vw-2rem)] sm:w-96
              flex flex-col
              bg-zinc-950 border border-zinc-800
              rounded-2xl shadow-2xl shadow-black/50
              overflow-hidden
            "
            style={{ height: "min(520px, calc(100vh - 140px))" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                  <ChefHat className="w-4 h-4 text-emerald-400" />
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-zinc-950">
                    <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-none">
                    FoodBot
                  </p>
                  <p className="text-[10px] text-emerald-400 mt-0.5">
                    AI Food Assistant · Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={resetChat}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors duration-200"
                  title="Reset chat"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
              <AnimatePresence>
                {isLoading && <TypingIndicator />}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Quick prompts — only after welcome */}
            {messages.length === 1 && !isLoading && (
              <div className="px-4 pb-3 flex flex-wrap gap-2 shrink-0">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="text-xs px-3 py-1.5 rounded-full border border-zinc-700 text-zinc-400 hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all duration-200"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-3 pb-3 pt-2 border-t border-zinc-800 shrink-0 bg-zinc-950">
              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 focus-within:border-emerald-500/50 transition-colors duration-200">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about food, orders, delivery…"
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 outline-none disabled:opacity-50"
                />
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => sendMessage(input)}
                  disabled={isLoading || !input.trim()}
                  className="w-7 h-7 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200 shrink-0 cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5 text-white" />
                  )}
                </motion.button>
              </div>
              <p className="text-[10px] text-zinc-700 text-center mt-2">
                Powered by Google Gemini · FoodHub Assistant
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB toggle button ── */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setIsOpen((v) => !v)}
        className="
          fixed bottom-6 right-4 sm:right-6 z-50
          w-14 h-14 rounded-2xl
          bg-emerald-500 hover:bg-emerald-400
          shadow-xl shadow-emerald-900/50
          flex items-center justify-center
          transition-colors duration-200
          cursor-pointer
        "
        aria-label="Open FoodBot"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageSquare className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        <AnimatePresence>
          {hasUnread && !isOpen && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white dark:border-zinc-950 flex items-center justify-center"
            >
              <span className="text-[9px] text-white font-bold">1</span>
            </motion.span>
          )}
        </AnimatePresence>

        {/* Idle sparkle */}
        {!isOpen && (
          <motion.div
            className="absolute -top-1 -right-1"
            animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
          </motion.div>
        )}
      </motion.button>
    </>
  );
}
