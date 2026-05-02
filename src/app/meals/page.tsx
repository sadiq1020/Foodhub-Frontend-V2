"use client";

import { MealCard } from "@/components/meals/MealCard";
import { FilterState, MealFilters } from "@/components/meals/MealFilters";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { Meal, PaginationMeta } from "@/types";
import { UtensilsCrossed } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

const LIMIT = 9; // 3x3 grid

function MealsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: LIMIT }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
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

function MealsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    search: searchParams.get("search") || "",
    categoryId: searchParams.get("category") || "",
    dietary: [],
    minPrice: "",
    maxPrice: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const fetchMeals = useCallback(
    async (filters: FilterState, currentPage: number) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.search) params.set("search", filters.search);
        if (filters.categoryId) params.set("categoryId", filters.categoryId);
        if (filters.minPrice) params.set("minPrice", filters.minPrice);
        if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
        if (filters.dietary.length > 0) {
          // Send first dietary value — backend supports one at a time
          params.set("dietary", filters.dietary[0]);
        }
        if (filters.sortBy) params.set("sortBy", filters.sortBy);
        if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
        params.set("page", String(currentPage));
        params.set("limit", String(LIMIT));

        const data = await api.get(`/meals?${params.toString()}`);
        setMeals(data.data || []);
        setMeta(data.meta || null);
      } catch {
        setMeals([]);
        setMeta(null);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Fetch on mount
  useEffect(() => {
    fetchMeals(activeFilters, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When filters change, reset to page 1
  const handleFilterChange = (filters: FilterState) => {
    setActiveFilters(filters);
    setPage(1);
    fetchMeals(filters, 1);
  };

  // When page changes, keep same filters
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchMeals(activeFilters, newPage);
    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Browse Meals
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            {isLoading
              ? "Finding meals..."
              : `${meta?.total ?? meals.length} meal${(meta?.total ?? meals.length) !== 1 ? "s" : ""} available`}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-72 shrink-0">
            <div className="sticky top-4">
              <MealFilters
                onFilterChange={handleFilterChange}
                initialFilters={activeFilters}
              />
            </div>
          </aside>

          <main className="flex-1">
            {isLoading ? (
              <MealsGridSkeleton />
            ) : meals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                  <UtensilsCrossed className="w-8 h-8 text-zinc-400" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                  No meals found
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-6">
                  Try adjusting your filters or search term.
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push("/meals")}
                  className="rounded-full"
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {meals.map((meal) => (
                    <MealCard key={meal.id} meal={meal} />
                  ))}
                </div>

                {/* Pagination */}
                {meta && (
                  <Pagination meta={meta} onPageChange={handlePageChange} />
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function AllMealsPage() {
  return (
    <Suspense fallback={<MealsGridSkeleton />}>
      <MealsContent />
    </Suspense>
  );
}
