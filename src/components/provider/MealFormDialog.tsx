"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { handleApiError } from "@/lib/handle-error";
import type { Category, Meal } from "@/types";

// ── Zod Schema ─────────────────────────────────────────
const mealSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  price: z.number().min(1, "Price must be at least 1"),
  categoryId: z.string().min(1, "Category is required"),
  image: z
    .string()
    .optional()
    .refine(
      (url) => {
        // Allow empty string
        if (!url || url === "") return true;

        // Check if valid URL
        try {
          const urlObj = new URL(url);
          const allowedDomains = ["images.unsplash.com"];
          return allowedDomains.includes(urlObj.hostname);
        } catch {
          return false;
        }
      },
      {
        message:
          "Image must be from images.unsplash.com or your CloudFront domain",
      },
    ),
  dietary: z.string().optional(),
});

type MealFormData = z.infer<typeof mealSchema>;

interface MealFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meal: Meal | null; // null = add mode, Meal = edit mode
  onSuccess: (meal: Meal) => void;
}

export function MealFormDialog({
  open,
  onOpenChange,
  meal,
  onSuccess,
}: MealFormDialogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<MealFormData>({
    resolver: zodResolver(mealSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      categoryId: "",
      image: "",
      dietary: "",
    },
  });

  const categoryId = watch("categoryId");
  const dietary = watch("dietary");

  //  Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const data = await api.get("/categories");
        setCategories(data.data || data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    if (open) {
      fetchCategories();
    }
  }, [open]);

  //  Pre-fill form when editing
  useEffect(() => {
    if (meal) {
      reset({
        name: meal.name,
        description: meal.description || "",
        price: meal.price,
        categoryId: meal.category.id,
        image: meal.image || "",
        dietary: Array.isArray(meal.dietary)
          ? meal.dietary[0] || ""
          : meal.dietary || "",
      });
    } else {
      reset({
        name: "",
        description: "",
        price: 0,
        categoryId: "",
        image: "",
        dietary: "",
      });
    }
  }, [meal, reset]);

  //  Submit handler - updated
  const onSubmit = async (data: MealFormData) => {
    const toastId = toast.loading(
      meal ? "Updating meal..." : "Creating meal...",
    );

    try {
      let providerId = meal?.provider?.id;

      if (!providerId) {
        try {
          const profileResponse = await api.get("/provider/profile");
          providerId = profileResponse.data?.id || profileResponse.id;
        } catch (error) {
          // toast.error("Failed to get provider profile. Please try again.", {
          //   id: toastId,
          // });
          handleApiError(error, toastId);
          return;
        }
      }

      const payload = {
        ...data,
        providerId,
        price: Number(data.price),
        image: data.image || null,
        dietary: data.dietary ? [data.dietary] : null,
        description: data.description || null,
      };

      let savedMeal;
      if (meal) {
        const response = await api.put(`/meals/${meal.id}`, payload);
        savedMeal = response.data || response;
      } else {
        const response = await api.post("/meals", payload);
        savedMeal = response.data || response;
      }

      toast.success(
        meal ? "Meal updated successfully!" : "Meal created successfully!",
        { id: toastId },
      );

      onSuccess(savedMeal);
      reset();
    } catch (error: unknown) {
      // const message =
      //   error instanceof Error ? error.message : "Failed to save meal";
      // toast.error(message, { id: toastId });
      handleApiError(error, toastId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{meal ? "Edit Meal" : "Add New Meal"}</DialogTitle>
          <DialogDescription>
            {meal
              ? "Update your meal details"
              : "Fill in the details to add a new meal"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FieldGroup>
            {/* Name */}
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Meal Name *</FieldLabel>
              <Input
                id="name"
                placeholder="e.g., Chicken Biryani"
                {...register("name")}
              />
              {errors.name && <FieldError errors={[errors.name]} />}
            </Field>

            {/* Description */}
            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                placeholder="Describe your meal..."
                rows={3}
                {...register("description")}
              />
              {errors.description && (
                <FieldError errors={[errors.description]} />
              )}
            </Field>

            {/* Price */}
            <Field data-invalid={!!errors.price}>
              <FieldLabel htmlFor="price">Price (৳) *</FieldLabel>
              <Input
                id="price"
                type="number"
                min="1"
                placeholder="200"
                {...register("price", { valueAsNumber: true })}
              />
              {errors.price && <FieldError errors={[errors.price]} />}
            </Field>

            {/* Category */}
            <Field data-invalid={!!errors.categoryId}>
              <FieldLabel>Category *</FieldLabel>
              <Select
                value={categoryId}
                onValueChange={(value) => setValue("categoryId", value)}
                disabled={isLoadingCategories}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && <FieldError errors={[errors.categoryId]} />}
            </Field>

            {/* Image URL */}
            <Field data-invalid={!!errors.image}>
              <FieldLabel htmlFor="image">Image URL</FieldLabel>
              <Input
                id="image"
                type="url"
                placeholder="https://example.com/image.jpg"
                {...register("image")}
              />
              <FieldDescription>
                Enter a valid image URL (optional)
              </FieldDescription>
              {errors.image && <FieldError errors={[errors.image]} />}
            </Field>

            {/* Dietary */}
            <Field>
              <FieldLabel>Dietary Type</FieldLabel>
              <Select
                value={dietary}
                onValueChange={(value) => setValue("dietary", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select dietary type (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VEGAN">Vegan</SelectItem>
                  <SelectItem value="VEGETARIAN">Vegetarian</SelectItem>
                  <SelectItem value="NON_VEG">Non-Veg</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>

          {/* Actions */}
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
              className="rounded-full bg-linear-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 border-0 text-white px-8"
            >
              {isSubmitting ? "Saving..." : meal ? "Update Meal" : "Add Meal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
