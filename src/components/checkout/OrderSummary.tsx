"use client";

import { Button } from "@/components/ui/button";
import type { CartItem } from "@/types";
import { ShoppingBag } from "lucide-react";

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  isSubmitting: boolean;
}

export function OrderSummary({
  items,
  subtotal,
  deliveryFee,
  total,
  isSubmitting,
}: OrderSummaryProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sticky top-4">
      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-5">
        Order Summary
      </h2>

      {/* Items List */}
      <div className="space-y-3 mb-5 max-h-64 overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.mealId}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex-1 min-w-0 pr-2">
              <p className="font-medium text-zinc-900 dark:text-zinc-50 truncate">
                {item.name}
              </p>
              <p className="text-xs text-zinc-400">
                {item.quantity} × ৳{item.price}
              </p>
            </div>
            <span className="font-medium text-zinc-900 dark:text-zinc-50">
              ৳{item.quantity * item.price}
            </span>
          </div>
        ))}
      </div>

      {/* Pricing Breakdown */}
      <div className="space-y-3 border-t border-zinc-200 dark:border-zinc-800 pt-4 mb-5">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">Subtotal</span>
          <span className="font-medium text-zinc-900 dark:text-zinc-50">
            ৳{subtotal}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">Delivery Fee</span>
          <span className="font-medium text-zinc-900 dark:text-zinc-50">
            ৳{deliveryFee}
          </span>
        </div>
        <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-800 pt-3">
          <span className="font-bold text-zinc-900 dark:text-zinc-50">
            Total
          </span>
          <span className="font-bold text-xl text-orange-600 dark:text-orange-400">
            ৳{total}
          </span>
        </div>
      </div>

      {/* Place Order Button */}
      <Button
        form="checkout-form"
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-linear-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 border-0 text-white h-11 gap-2"
      >
        <ShoppingBag className="w-4 h-4" />
        {isSubmitting ? "Redirecting to Payment..." : "Place Order & Pay"}
      </Button>

      <p className="text-xs text-zinc-400 text-center mt-3">
        You will be redirected to Stripe to complete payment securely
      </p>
    </div>
  );
}
