"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ReviewForm } from "@/components/reviews/ReviewForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { handleApiError } from "@/lib/handle-error";
import type { Review } from "@/types";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${
            star <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700"
          }`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

interface ReviewsSectionProps {
  mealId: string;
  mealName: string;
  initialReviews: Review[];
}

export function ReviewsSection({
  mealId,
  mealName,
  initialReviews,
}: ReviewsSectionProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditClick = (review: Review) => {
    setEditingReview(review);
    setReviewFormOpen(true);
  };

  const handleDeleteClick = (reviewId: string) => {
    setReviewToDelete(reviewId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return;
    const toastId = toast.loading("Deleting review...");
    setIsDeleting(true);
    try {
      await api.delete(`/reviews/${reviewToDelete}`);
      toast.success("Review deleted", { id: toastId });
      // Remove from local state — no page reload needed
      setReviews((prev) => prev.filter((r) => r.id !== reviewToDelete));
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
    } catch (error) {
      handleApiError(error, toastId);
    } finally {
      setIsDeleting(false);
    }
  };

  // After edit success — refresh page to show updated review
  const handleReviewSuccess = () => {
    // Reload the page so the server component re-fetches fresh data
    window.location.reload();
  };

  return (
    <>
      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-10">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          Reviews
          {reviews.length > 0 && (
            <span className="ml-2 text-lg font-normal text-zinc-400">
              ({reviews.length})
            </span>
          )}
        </h2>

        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <p className="text-4xl mb-3">💬</p>
            <p className="text-zinc-500 font-medium">No reviews yet</p>
            <p className="text-zinc-400 text-sm mt-1">
              Be the first to review this meal!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => {
              const isOwner = currentUserId === review.customerId;
              return (
                <div
                  key={review.id}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                          {review.customer.name
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-50 text-sm">
                          {review.customer.name}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {new Date(review.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} />

                      {/* Edit/Delete — only shown to review author */}
                      {isOwner && (
                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(review)}
                            className="h-7 w-7 p-0 text-zinc-400 hover:text-orange-500"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(review.id)}
                            className="h-7 w-7 p-0 text-zinc-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {review.comment && (
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Review Dialog */}
      <ReviewForm
        open={reviewFormOpen}
        onOpenChange={(open) => {
          setReviewFormOpen(open);
          if (!open) setEditingReview(null);
        }}
        mealId={mealId}
        mealName={mealName}
        onSuccess={handleReviewSuccess}
        review={editingReview}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your review? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
