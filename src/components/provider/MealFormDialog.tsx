"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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

const mealSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  price: z.number().min(1, "Price must be at least 1"),
  categoryId: z.string().min(1, "Category is required"),
  dietary: z.string().optional(),
});

type MealFormData = z.infer<typeof mealSchema>;

const DIETARY_OPTIONS = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "non-vegetarian", label: "Non-Vegetarian" },
  { value: "halal", label: "Halal" },
  { value: "gluten-free", label: "Gluten-Free" },
];

interface MealFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meal: Meal | null;
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      dietary: "",
    },
  });

  const categoryId = watch("categoryId");
  const dietary = watch("dietary");

  // Fetch categories when dialog opens
  useEffect(() => {
    if (!open) return;
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const data = await api.get("/categories");
        setCategories(data.data || data);
      } catch {
        // ignore
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [open]);

  // Pre-fill form when editing
  useEffect(() => {
    if (meal) {
      reset({
        name: meal.name,
        description: meal.description || "",
        price: meal.price,
        categoryId: meal.category.id,
        dietary: Array.isArray(meal.dietary)
          ? meal.dietary[0] || ""
          : meal.dietary || "",
      });
      // Show existing image as preview
      setImagePreview(meal.image || null);
      setImageFile(null);
    } else {
      reset({
        name: "",
        description: "",
        price: 0,
        categoryId: "",
        dietary: "",
      });
      setImagePreview(null);
      setImageFile(null);
    }
  }, [meal, reset]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowed.includes(file.type)) {
      toast.error("Only JPG, PNG and WebP images are allowed");
      return;
    }

    // Validate file size — 5MB max
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: MealFormData) => {
    const toastId = toast.loading(
      meal ? "Updating meal..." : "Creating meal...",
    );

    try {
      // Get provider ID
      let providerId = meal?.provider?.id;
      if (!providerId) {
        const profileResponse = await api.get("/provider/profile");
        providerId = profileResponse.data?.id || profileResponse.id;
        if (!providerId) {
          toast.error("Failed to get provider profile.", { id: toastId });
          return;
        }
      }

      // Build FormData — backend expects multipart/form-data
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("price", String(data.price));
      formData.append("categoryId", data.categoryId);
      formData.append("providerId", providerId);
      if (data.description) formData.append("description", data.description);
      if (data.dietary) {
        // Backend expects JSON array string
        formData.append("dietary", JSON.stringify([data.dietary]));
      }
      // Only append image if a new file was selected
      if (imageFile) {
        formData.append("image", imageFile);
      }

      let savedMeal;
      if (meal) {
        const response = await api.putForm(`/meals/${meal.id}`, formData);
        savedMeal = response.data || response;
      } else {
        const response = await api.postForm("/meals", formData);
        savedMeal = response.data || response;
      }

      toast.success(
        meal ? "Meal updated successfully!" : "Meal created successfully!",
        { id: toastId },
      );

      onSuccess(savedMeal);
      reset();
      clearImage();
    } catch (error) {
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

            {/* Image Upload */}
            <Field>
              <FieldLabel>Meal Image</FieldLabel>

              {/* Preview */}
              {imagePreview ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 mb-2">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-orange-400 dark:hover:border-orange-500 transition-colors mb-2"
                >
                  <ImageIcon className="w-8 h-8 text-zinc-400" />
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Click to upload image
                  </p>
                  <p className="text-xs text-zinc-400">
                    JPG, PNG, WebP — max 5MB
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              {!imagePreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-xl"
                >
                  Choose Image
                </Button>
              )}

              <FieldDescription>
                Upload a photo of your meal (optional)
              </FieldDescription>
            </Field>

            {/* Dietary */}
            <Field>
              <FieldLabel>Dietary Type</FieldLabel>
              <Select
                value={dietary || "none"}
                onValueChange={(value) =>
                  setValue("dietary", value === "none" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select dietary type (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {DIETARY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
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
