"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { api } from "@/lib/api";
import { handleApiError } from "@/lib/handle-error";

type Category = {
  id: string;
  name: string;
  image?: string | null;
  createdAt: string;
};

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onSuccess: (category: Category) => void;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: CategoryFormDialogProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "" },
  });

  // Reset form on open
  const prevOpenRef = useRef(false);
  useEffect(() => {
    const justOpened = open && !prevOpenRef.current;
    prevOpenRef.current = open;
    if (!justOpened) return;

    if (category) {
      reset({ name: category.name });
    } else {
      reset({ name: "" });
    }

    // Batch image state into a single update after the dialog opens
    const newPreview = category?.image || null;
    setImagePreview(newPreview);
    setImageFile(null);
  }, [open, category, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowed.includes(file.type)) {
      toast.error("Only JPG, PNG and WebP images are allowed");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2MB");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const onSubmit = useCallback(
    async (data: CategoryFormData) => {
      const toastId = toast.loading(
        category ? "Updating category..." : "Creating category...",
      );

      try {
        const formData = new FormData();
        formData.append("name", data.name);
        if (imageFile) {
          formData.append("image", imageFile);
        }

        let savedCategory;
        if (category) {
          const response = await api.putForm(
            `/categories/${category.id}`,
            formData,
          );
          savedCategory = response.data || response;
        } else {
          const response = await api.postForm("/categories", formData);
          savedCategory = response.data || response;
        }

        toast.success(
          category
            ? "Category updated successfully!"
            : "Category created successfully!",
          { id: toastId },
        );

        onSuccess(savedCategory);
        reset();
        clearImage();
      } catch (error) {
        handleApiError(error, toastId);
      }
    },
    [category, imageFile, onSuccess, reset],
  );
  // const submitHandler = useCallback(handleSubmit(onSubmit), [
  //   handleSubmit,
  //   onSubmit,
  // ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit Category" : "Add New Category"}
          </DialogTitle>
          <DialogDescription>
            {category
              ? "Update category details"
              : "Fill in the details to add a new category"}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(onSubmit)(e);
          }}
          className="space-y-6"
        >
          <FieldGroup>
            {/* Name */}
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Category Name *</FieldLabel>
              <Input
                id="name"
                placeholder="e.g., Desserts"
                autoComplete="off"
                {...register("name")}
              />
              {errors.name && <FieldError errors={[errors.name]} />}
            </Field>

            {/* Image Upload */}
            <Field>
              <FieldLabel>Category Image</FieldLabel>

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
                    JPG, PNG, WebP — max 2MB
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
                Upload a category image (optional)
              </FieldDescription>
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
              className="rounded-full bg-linear-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 border-0 text-white px-8"
            >
              {isSubmitting
                ? "Saving..."
                : category
                  ? "Update Category"
                  : "Add Category"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
