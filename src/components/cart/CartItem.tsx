"use client";

import type { CartItem as CartItemType } from "@/types";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (mealId: string, quantity: number) => void;
  onRemove: (mealId: string) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
      {/* Image */}
      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-2xl">🍽️</span>
          </div>
        )}
      </div>

      {/* Name + Price */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 truncate">
          {item.name}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          ৳{item.price} each
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-full px-2 py-1 shrink-0">
        <button
          onClick={() => onUpdateQuantity(item.mealId, item.quantity - 1)}
          disabled={item.quantity === 1}
          className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="w-5 text-center text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {item.quantity}
        </span>
        <button
          onClick={() => onUpdateQuantity(item.mealId, item.quantity + 1)}
          disabled={item.quantity === 99}
          className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Subtotal */}
      <div className="text-right shrink-0 w-20">
        <p className="font-bold text-emerald-500 dark:text-emerald-400">
          ৳{item.price * item.quantity}
        </p>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(item.mealId)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
