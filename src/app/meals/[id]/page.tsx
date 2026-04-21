import { AddToCart } from "@/components/meals/AddToCart";
import { FavouriteButton } from "@/components/meals/FavouriteButton";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { Button } from "@/components/ui/button";
import { Meal } from "@/types";
import { ArrowLeft, Flame, Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

// // ── Types ────────────────────────────────────────────
// type Review = {
//   id: string;
//   rating: number;
//   comment?: string | null;
//   customer: {
//     name: string;
//   };
//   createdAt: string;
// };

// type Meal = {
//   id: string;
//   name: string;
//   description?: string | null;
//   price: number;
//   image?: string | null;
//   dietary?: string | null;
//   spiceLevel?: string | null;
//   isAvailable: boolean;
//   averageRating?: number | null;
//   provider: {
//     id: string;
//     businessName: string;
//     address?: string | null;
//   };
//   category: {
//     id: string;
//     name: string;
//   };
//   reviews: Review[];
// };

// ── Fetch ────────────────────────────────────────────
async function getMeal(id: string): Promise<Meal | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/meals/${id}`, {
      cache: "no-store", // ✅ Always fetch fresh — reviews must appear immediately after submission
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || data;
  } catch {
    return null;
  }
}

// ── Helpers ───────────────────────────────────────────
const getDietaryStyle = (dietary: string) => {
  if (dietary === "VEGAN")
    return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";
  if (dietary === "VEGETARIAN")
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
  if (dietary === "NON_VEG")
    return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";
  return "bg-zinc-100 text-zinc-600";
};

const getSpiceStyle = (level: string) => {
  if (level === "HOT" || level === "EXTRA_HOT")
    return "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300";
  if (level === "MEDIUM")
    return "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-300";
  return "bg-yellow-100 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-300";
};

// ── Star renderer ─────────────────────────────────────
// function StarRating({ rating }: { rating: number }) {
//   return (
//     <div className="flex items-center gap-0.5">
//       {[1, 2, 3, 4, 5].map((star) => (
//         <svg
//           key={star}
//           className={`w-4 h-4 ${
//             star <= Math.round(rating)
//               ? "fill-amber-400 text-amber-400"
//               : "fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700"
//           }`}
//           viewBox="0 0 20 20"
//         >
//           <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//         </svg>
//       ))}
//     </div>
//   );
// }

// ── Page ──────────────────────────────────────────────
export default async function MealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const meal = await getMeal(id);

  //  404 if meal not found
  if (!meal) {
    notFound();
  }

  const reviews = meal.reviews || [];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Button */}
        <Button
          asChild
          variant="ghost"
          className="mb-6 gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 -ml-2"
        >
          <Link href="/meals">
            <ArrowLeft className="w-4 h-4" />
            Back to Meals
          </Link>
        </Button>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* ── Left: Image ── */}
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            {meal.image ? (
              <Image
                src={meal.image}
                alt={meal.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority // LCP image, load eagerly
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-8xl">🍽️</span>
              </div>
            )}

            {/* Unavailable overlay */}
            {!meal.isAvailable && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-semibold bg-red-500 px-4 py-2 rounded-full">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* ─ Right: Details ─ */}
          <div className="flex flex-col gap-5">
            {/* Category */}
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest">
              {meal.category.name}
            </p>

            {/* Name */}
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
              {meal.name}
            </h1>

            {/* Tags row */}
            <div className="flex flex-wrap gap-2">
              {meal.dietary && typeof meal.dietary === "string" && (
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full ${getDietaryStyle(meal.dietary)}`}
                >
                  {meal.dietary.replace("_", " ")}
                </span>
              )}
              {meal.spiceLevel && typeof meal.spiceLevel === "string" && (
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1 ${getSpiceStyle(meal.spiceLevel)}`}
                >
                  <Flame className="w-3 h-3" />
                  {meal.spiceLevel.replace("_", " ")}
                </span>
              )}
            </div>

            {/* Rating */}
            {/* {meal.averageRating ? (
              <div className="flex items-center gap-2">
                <StarRating rating={meal.averageRating} />
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  {meal.averageRating.toFixed(1)}
                </span>
                <span className="text-sm text-zinc-400">
                  ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
                </span>
              </div>
            ) : (
              <p className="text-sm text-zinc-400">No reviews yet</p>
            )} */}

            {/* Description */}
            {meal.description && (
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm">
                {meal.description}
              </p>
            )}

            {/* Provider */}
            <Link
              href={`/provider-profile/${meal.provider.id}`}
              className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-orange-300 dark:hover:border-orange-700 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center shrink-0">
                <Store className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-zinc-900 dark:text-zinc-50 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors text-sm">
                  {meal.provider.businessName}
                </p>
                {meal.provider.address && (
                  <p className="text-xs text-zinc-400 truncate">
                    {meal.provider.address}
                  </p>
                )}
              </div>
              <ArrowLeft className="w-4 h-4 text-zinc-400 rotate-180 shrink-0" />
            </Link>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                ৳{meal.price}
              </span>
              <span className="text-zinc-400 text-sm">per item</span>
            </div>

            {/* Add to Cart + Favourite */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <AddToCart
                  meal={{
                    id: meal.id,
                    name: meal.name,
                    price: meal.price,
                    isAvailable: meal.isAvailable,
                    image: meal.image,
                  }}
                />
              </div>
              <FavouriteButton mealId={meal.id} />
            </div>
          </div>
        </div>

        {/* ── Reviews Section ── */}
        <ReviewsSection
          mealId={meal.id}
          mealName={meal.name}
          initialReviews={reviews}
        />
      </div>
    </div>
  );
}
