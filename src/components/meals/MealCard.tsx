"use client";

import { FavouriteButton } from "@/components/meals/FavouriteButton"; // ← add
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { useSession } from "@/lib/auth-client";
import type { Meal } from "@/types";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function MealCard({ meal }: { meal: Meal }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { data: session } = useSession();

  const getDietaryColor = (dietary: string | null | undefined) => {
    if (!dietary || typeof dietary !== "string")
      return "bg-zinc-100 text-zinc-700";
    if (dietary === "VEGAN")
      return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";
    if (dietary === "VEGETARIAN")
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
    if (dietary === "NON_VEG")
      return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";
    return "bg-zinc-100 text-zinc-700";
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!session?.user) {
      toast.error("Please login to add items to cart", {
        action: {
          label: "Login",
          onClick: () => router.push("/login"),
        },
      });
      return;
    }

    addToCart(
      {
        mealId: meal.id,
        name: meal.name,
        price: meal.price,
        image: meal.image,
      },
      1,
    );

    toast.success(`${meal.name} added to cart!`);
  };

  const isOutOfStock = meal.isAvailable === false;

  return (
    <Card
      onClick={() => !isOutOfStock && router.push(`/meals/${meal.id}`)}
      className={`group overflow-hidden border border-zinc-200 dark:border-zinc-800 transition-all duration-300 p-0
        ${
          isOutOfStock
            ? "opacity-70 cursor-not-allowed"
            : "cursor-pointer hover:border-emerald-500/40 dark:hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10 dark:hover:shadow-emerald-500/10"
        }`}
    >
      <div className="relative w-full aspect-video overflow-hidden">
        {meal.image ? (
          <Image
            src={meal.image}
            alt={meal.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={`object-cover transition-transform duration-300 ${
              !isOutOfStock && "group-hover:scale-105"
            }`}
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-emerald-950/30 to-teal-950/30 dark:from-emerald-950/30 dark:to-teal-950/30 flex items-center justify-center">
            <span className="text-4xl">🍽️</span>
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-semibold text-sm bg-red-500 px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}

        {meal.dietary && typeof meal.dietary === "string" && (
          <div className="absolute top-2 left-2">
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${getDietaryColor(
                meal.dietary,
              )}`}
            >
              {meal.dietary.replace("_", " ")}
            </span>
          </div>
        )}

        {/* ← Bookmark button — top right of image */}
        <div className="absolute top-2 right-2">
          <FavouriteButton mealId={meal.id} size="sm" />
        </div>
      </div>

      <div className="p-4 space-y-2">
        <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
          {meal.category.name}
        </p>

        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
          {meal.name}
        </h3>

        <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1">
          🏪 {meal.provider.businessName}
        </p>

        <div className="flex items-center justify-between pt-1">
          <span className="text-lg font-bold text-emerald-500 dark:text-emerald-400">
            ৳{meal.price}
          </span>

          {isOutOfStock ? (
            <span className="text-xs text-red-500 font-medium">
              Unavailable
            </span>
          ) : (
            <Button
              size="sm"
              onClick={handleAddToCart}
              className="h-8 rounded-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 border-0 gap-1.5 text-xs px-3"
            >
              <ShoppingCart className="w-3 h-3" />
              <span suppressHydrationWarning>Add to Cart</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
