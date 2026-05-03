"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useSession } from "@/lib/auth-client";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type AddToCartMeal = {
  id: string;
  name: string;
  price: number;
  isAvailable?: boolean;
  image?: string | null;
};

export function AddToCart({ meal }: { meal: AddToCartMeal }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { data: session } = useSession();

  const decrease = () => setQuantity((q) => Math.max(1, q - 1));
  const increase = () => setQuantity((q) => Math.min(99, q + 1));

  const role = (session?.user as { role?: string })?.role;
  const isCustomer = role === "CUSTOMER";
  const isLoggedIn = !!session?.user;

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      toast.error("Please login to add items to cart");
      return;
    }

    if (!isCustomer) {
      toast.warning(
        `You're logged in as a ${role?.toLowerCase()}. Please use a customer account to order meals.`,
        { duration: 4000 }
      );
      return;
    }

    addToCart(
      {
        mealId: meal.id,
        name: meal.name,
        price: meal.price,
        image: meal.image,
      },
      quantity,
    );

    toast.success(`${meal.name} added to cart!`, {
      description: `${quantity} × ৳${meal.price} = ৳${quantity * meal.price}`,
    });
  };

  if (meal.isAvailable === false) {
    return (
      <div className="flex items-center justify-center h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
        <span className="text-zinc-500 font-medium">Currently Unavailable</span>
      </div>
    );
  }

  const buttonLabel = () => {
    if (!isLoggedIn) return "Login to Order";
    if (!isCustomer) return "Customer account required";
    return `Add to Cart · ৳${quantity * meal.price}`;
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-800 rounded-full px-2 py-1">
        <button
          onClick={decrease}
          disabled={quantity === 1}
          className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-6 text-center font-semibold text-zinc-900 dark:text-zinc-50 text-sm">
          {quantity}
        </span>
        <button
          onClick={increase}
          disabled={quantity === 99}
          className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <Button
        onClick={handleAddToCart}
        className="flex-1 rounded-full bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-0 text-zinc-950 h-11 gap-2"
      >
        <ShoppingCart className="w-4 h-4" />
        {buttonLabel()}
      </Button>
    </div>
  );
}