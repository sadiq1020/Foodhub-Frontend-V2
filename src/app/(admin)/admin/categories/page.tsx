"use client";

import { Folder, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { CategoryCard } from "@/components/admin/CategoryCard";
import { CategoryFormDialog } from "@/components/admin/CategoryFormDialog";
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
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { handleApiError } from "@/lib/handle-error";

type Category = {
  id: string;
  name: string;
  image?: string | null;
  createdAt: string;
};

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  // Track whether we've already fetched so tab-switch doesn't re-fetch
  const hasFetched = useRef(false);

  // Protected route
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }

    if (!isPending && session?.user) {
      const userRole = (session.user as { role?: string }).role;
      if (userRole !== "ADMIN") {
        router.push("/");
      }
    }
  }, [session, isPending, router]);

  // Fetch categories — only once per mount, not every time session object re-renders
  useEffect(() => {
    if (!session?.user) return;
    // Already fetched — don't re-fetch on tab switch
    if (hasFetched.current) return;

    const fetchCategories = async () => {
      try {
        hasFetched.current = true;
        setIsLoading(true);
        const data = await api.get("/categories");
        setCategories(data.data || data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        // toast.error("Failed to load categories");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [session?.user?.id]); // ✅ Depend on user ID (stable string), not the whole session object

  // Delete category
  const handleDelete = async () => {
    if (!categoryToDelete) return;

    const toastId = toast.loading("Deleting category...");

    try {
      await api.delete(`/categories/${categoryToDelete}`);
      toast.success("Category deleted successfully", { id: toastId });

      setCategories(categories.filter((c) => c.id !== categoryToDelete));
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (error: unknown) {
      // const message =
      //   error instanceof Error ? error.message : "Failed to delete category";
      // toast.error(message, { id: toastId });
      handleApiError(error, toastId);
    }
  };

  // Open edit dialog
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  // Open add dialog
  const handleAdd = () => {
    setEditingCategory(null);
    setIsDialogOpen(true);
  };

  // After successful add/edit
  const handleCategorySaved = (savedCategory: Category) => {
    if (editingCategory) {
      setCategories(
        categories.map((c) => (c.id === savedCategory.id ? savedCategory : c)),
      );
    } else {
      setCategories([savedCategory, ...categories]);
    }
    setIsDialogOpen(false);
    setEditingCategory(null);
  };

  // Only block render while auth is being checked (isPending).
  // Do NOT include isLoading here — that would unmount the dialog and wipe form state on tab switch.
  if (isPending) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
          <div className="container mx-auto px-4 py-6">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="w-full aspect-video rounded-lg mb-3" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                Category Management
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">
                Add, edit, or remove meal categories
              </p>
            </div>
            <Button
              onClick={handleAdd}
              className="rounded-full bg-linear-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 border-0 text-white gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          // ✅ Inline skeleton — page stays mounted, dialog stays alive
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="w-full aspect-video rounded-lg mb-3" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </Card>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 rounded-full bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center mx-auto mb-6">
              <Folder className="w-12 h-12 text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              No categories yet
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8">
              Start by adding your first category
            </p>
            <Button
              onClick={handleAdd}
              className="rounded-full bg-linear-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 border-0 text-white px-8"
            >
              Add Your First Category
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={handleEdit}
                onDelete={(id) => {
                  setCategoryToDelete(id);
                  setDeleteDialogOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <CategoryFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        category={editingCategory}
        onSuccess={handleCategorySaved}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? This action cannot
              be undone and will affect all meals in this category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
