"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, Star } from "lucide-react";
import Image from "next/image";

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  meal: {
    id: string;
    name: string;
    image?: string | null;
  };
};

interface OrderItemsListProps {
  items: OrderItem[];
  canReview?: boolean;
  onReviewClick?: (mealId: string, mealName: string) => void;
  reviewedMealIds?: string[]; // ← meals already reviewed by this customer
}

export function OrderItemsList({
  items,
  canReview = false,
  onReviewClick,
  reviewedMealIds = [],
}: OrderItemsListProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
        Order Items
      </h2>

      <div className="space-y-3">
        {items.map((item) => {
          const alreadyReviewed = reviewedMealIds.includes(item.meal.id);

          return (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800"
            >
              {/* Image */}
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0">
                {item.meal.image ? (
                  <Image
                    src={item.meal.image}
                    alt={item.meal.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    🍽️
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1">
                <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
                  {item.meal.name}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Quantity: {item.quantity}
                </p>
              </div>

              {/* Price */}
              <div className="text-right">
                <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                  ৳{item.price * item.quantity}
                </p>
                <p className="text-xs text-zinc-400">৳{item.price} each</p>
              </div>

              {/* Review Button or Reviewed badge */}
              {canReview &&
                (alreadyReviewed ? (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400 shrink-0">
                    <CheckCircle className="w-4 h-4" />
                    Reviewed
                  </div>
                ) : (
                  onReviewClick && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        onReviewClick(item.meal.id, item.meal.name)
                      }
                      className="gap-2 shrink-0"
                    >
                      <Star className="w-4 h-4" />
                      Review
                    </Button>
                  )
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
