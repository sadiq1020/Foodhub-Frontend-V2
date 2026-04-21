"use client";

import { FavouriteButton } from "@/components/meals/FavouriteButton";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { Bookmark, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type FavouriteMeal = {
  id: string;
  createdAt: string;
  meal: {
    id: string;
    name: string;
    image?: string | null;
    price: number;
    isAvailable: boolean;
    dietary: string[];
    averageRating: number;
    totalReviews: number;
    provider: { id: string; businessName: string };
    category: { id: string; name: string };
  };
};

function FavouritesSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
        >
          <Skeleton className="aspect-video w-full" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex justify-between pt-1">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FavouritesPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { addToCart } = useCart();
  const [favourites, setFavourites] = useState<FavouriteMeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (!session?.user) return;

    const fetchFavourites = async () => {
      try {
        setIsLoading(true);
        const data = await api.get("/favourites");
        setFavourites(data.data || []);
      } catch {
        setFavourites([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavourites();
  }, [session?.user]);

  // Remove from list when unbookmarked — listen via a custom approach
  // by re-fetching when navigating back, or handle optimistically
  const handleRemoved = (mealId: string) => {
    setFavourites((prev) => prev.filter((f) => f.meal.id !== mealId));
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            My Favourites
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            {isLoading
              ? "Loading..."
              : `${favourites.length} saved meal${favourites.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <FavouritesSkeleton />
        ) : favourites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center mb-6">
              <Bookmark className="w-8 h-8 text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              No favourites yet
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm">
              Browse meals and tap the bookmark icon to save your favourites
              here.
            </p>
            <Button
              asChild
              className="rounded-full bg-linear-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 border-0 text-white px-8"
            >
              <Link href="/meals">Browse Meals</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favourites.map((fav) => {
              const meal = fav.meal;
              const isOutOfStock = !meal.isAvailable;

              return (
                <div
                  key={fav.id}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden group hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-lg hover:shadow-orange-100 dark:hover:shadow-orange-950/20 transition-all duration-300"
                >
                  {/* Image */}
                  <div
                    className="relative aspect-video overflow-hidden cursor-pointer"
                    onClick={() => router.push(`/meals/${meal.id}`)}
                  >
                    {meal.image ? (
                      <Image
                        src={meal.image}
                        alt={meal.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-orange-100 to-rose-100 dark:from-orange-950/50 dark:to-rose-950/50 flex items-center justify-center">
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

                    {/* Bookmark button — clicking removes from list */}
                    <div
                      className="absolute top-2 right-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoved(meal.id);
                      }}
                    >
                      <FavouriteButton mealId={meal.id} size="sm" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-2">
                    <p className="text-xs text-zinc-400 uppercase tracking-wide">
                      {meal.category.name}
                    </p>
                    <h3
                      className="font-semibold text-zinc-900 dark:text-zinc-50 line-clamp-1 cursor-pointer group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors"
                      onClick={() => router.push(`/meals/${meal.id}`)}
                    >
                      {meal.name}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      🏪 {meal.provider.businessName}
                    </p>

                    {meal.averageRating > 0 && (
                      <p className="text-xs text-amber-500">
                        ★ {meal.averageRating} ({meal.totalReviews} review
                        {meal.totalReviews !== 1 ? "s" : ""})
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        ৳{meal.price}
                      </span>

                      {isOutOfStock ? (
                        <span className="text-xs text-red-500 font-medium">
                          Unavailable
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => {
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
                          }}
                          className="h-8 rounded-full bg-orange-500 hover:bg-orange-600 text-white border-0 gap-1.5 text-xs px-3"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          Add to Cart
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
