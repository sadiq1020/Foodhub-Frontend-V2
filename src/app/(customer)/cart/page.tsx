"use client";

import { CartItem } from "@/components/cart/CartItem";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useSession } from "@/lib/auth-client";
import { ArrowLeft, ArrowRight, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const DELIVERY_FEE = 50;

export default function CartPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { items, updateQuantity, removeFromCart, getCartTotal, clearCart } =
    useCart();

  //  Protected route - redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  // Show nothing while checking session
  if (isPending) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!session?.user) return null;

  const subtotal = getCartTotal();
  const total = subtotal + (items.length > 0 ? DELIVERY_FEE : 0);

  //  Empty cart state
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-emerald-950/20 dark:bg-emerald-950/30 flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Your cart is empty
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm">
            Looks like you haven&apos;t added anything yet. Browse our delicious
            meals!
          </p>
          <Button
            asChild
            className="rounded-full bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-0 text-zinc-950 px-8"
          >
            <Link href="/meals">Browse Meals</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Page Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                My Cart
              </h1>
              {/*  Suppress hydration warning for cart count */}
              <p
                className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5"
                suppressHydrationWarning
              >
                {items.length} item{items.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCart}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs"
            >
              Clear All
            </Button>
          </div>
        </div>
      </div>

      {/*  Suppress hydration warning for entire cart content */}
      <div className="container mx-auto px-4 py-8" suppressHydrationWarning>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Left: Cart Items ── */}
          <div className="flex-1 space-y-3">
            {/* Back to meals */}
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 -ml-2 mb-2"
            >
              <Link href="/meals">
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Link>
            </Button>

            {/* Cart Items List */}
            {items.map((item) => (
              <CartItem
                key={item.mealId}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sticky top-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-5">
                Order Summary
              </h2>

              {/* Summary Lines */}
              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    Subtotal ({items.length} items)
                  </span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">
                    ৳{subtotal}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    Delivery Fee
                  </span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">
                    ৳{DELIVERY_FEE}
                  </span>
                </div>

                {/* Divider */}
                <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-zinc-900 dark:text-zinc-50">
                      Total
                    </span>
                    <span className="font-bold text-xl text-emerald-500 dark:text-emerald-400">
                      ৳{total}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                asChild
                className="w-full rounded-full bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-0 text-zinc-950 h-11 gap-2"
              >
                <Link href="/checkout">
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>

              {/* Small note */}
              <p className="text-xs text-zinc-400 text-center mt-3">
                Delivery fee is fixed at ৳{DELIVERY_FEE}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
