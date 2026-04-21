"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { handleApiError } from "@/lib/handle-error";
import type { Review } from "@/types";

const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  comment: z.string().optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealId: string;
  mealName: string;
  onSuccess: (mealId: string) => void;
  // Optional — when provided, form is in edit mode
  review?: Review | null;
}

export function ReviewForm({
  open,
  onOpenChange,
  mealId,
  mealName,
  onSuccess,
  review,
}: ReviewFormProps) {
  const [hoveredStar, setHoveredStar] = useState(0);
  const isEditMode = !!review;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: "" },
  });

  const rating = watch("rating");

  // Pre-fill when editing
  useEffect(() => {
    if (open && review) {
      reset({ rating: review.rating, comment: review.comment || "" });
    } else if (open && !review) {
      reset({ rating: 0, comment: "" });
    }
  }, [open, review, reset]);

  const onSubmit = async (data: ReviewFormData) => {
    const toastId = toast.loading(
      isEditMode ? "Updating review..." : "Submitting review...",
    );

    try {
      if (isEditMode && review) {
        await api.put(`/reviews/${review.id}`, {
          rating: data.rating,
          comment: data.comment || undefined,
        });
      } else {
        await api.post("/reviews", {
          mealId,
          rating: data.rating,
          comment: data.comment || undefined,
        });
      }

      toast.success(
        isEditMode
          ? "Review updated successfully!"
          : "Review submitted successfully!",
        { id: toastId },
      );
      reset();
      onSuccess(mealId);
      onOpenChange(false);
    } catch (error) {
      handleApiError(error, toastId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Review" : "Write a Review"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? `Update your review for ${mealName}`
              : `Share your experience with ${mealName}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FieldGroup>
            <Field data-invalid={!!errors.rating}>
              <FieldLabel>Rating *</FieldLabel>
              <div className="flex gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setValue("rating", star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoveredStar || rating)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {errors.rating && <FieldError errors={[errors.rating]} />}
            </Field>

            <Field data-invalid={!!errors.comment}>
              <FieldLabel htmlFor="comment">Comment (Optional)</FieldLabel>
              <Textarea
                id="comment"
                placeholder="Tell us about your experience..."
                rows={4}
                {...register("comment")}
              />
              {errors.comment && <FieldError errors={[errors.comment]} />}
            </Field>
          </FieldGroup>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-orange-500 hover:bg-orange-600 text-white px-8"
            >
              {isSubmitting
                ? isEditMode
                  ? "Updating..."
                  : "Submitting..."
                : isEditMode
                  ? "Update Review"
                  : "Submit Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
