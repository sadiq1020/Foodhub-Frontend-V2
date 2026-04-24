"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { Category } from "@/types";
import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";

export type FilterState = {
  search: string;
  categoryId: string;
  dietary: string[];
  minPrice: string;
  maxPrice: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
};

const DIETARY_OPTIONS = [
  {
    value: "vegan",
    label: "Vegan",
    color:
      "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 border-green-200 dark:border-green-800",
  },
  {
    value: "vegetarian",
    label: "Vegetarian",
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  },
  {
    value: "non-vegetarian",
    label: "Non-Veg",
    color:
      "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-800",
  },
  {
    value: "halal",
    label: "Halal",
    color:
      "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  },
];

const DEFAULT_FILTERS: FilterState = {
  search: "",
  categoryId: "",
  dietary: [],
  minPrice: "",
  maxPrice: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

interface MealFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
}

export function MealFilters({
  onFilterChange,
  initialFilters,
}: MealFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchInput, setSearchInput] = useState(initialFilters?.search || "");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.get("/categories");
        setCategories(data.data || data);
      } catch {
        // ignore
      }
    };
    fetchCategories();
  }, []);

  const handleFilterChange = (
    key: keyof FilterState,
    value: string | string[],
  ) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    onFilterChange(updated);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleFilterChange("search", searchInput);
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const toggleDietary = (value: string) => {
    const current = filters.dietary;
    const updated = current.includes(value)
      ? current.filter((d) => d !== value)
      : [...current, value];
    handleFilterChange("dietary", updated);
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchInput("");
    onFilterChange(DEFAULT_FILTERS);
  };

  const hasActiveFilters =
    filters.search ||
    filters.categoryId ||
    filters.dietary.length > 0 ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.sortBy !== "createdAt" ||
    filters.sortOrder !== "desc";

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50 font-semibold">
          <SlidersHorizontal className="w-4 h-4 text-emerald-500" />
          Filters
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1 h-7"
          >
            <X className="w-3 h-3" />
            Clear All
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
          Search
        </label>
        <Input
          placeholder="Search meals..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="rounded-xl border-zinc-200 dark:border-zinc-700"
        />
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
          Category
        </label>
        <Select
          value={filters.categoryId || "all"}
          onValueChange={(value) =>
            handleFilterChange("categoryId", value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="rounded-xl border-zinc-200 dark:border-zinc-700">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Dietary */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
          Dietary
        </label>
        <div className="flex flex-wrap gap-2">
          {DIETARY_OPTIONS.map((option) => {
            const isSelected = filters.dietary.includes(option.value);
            return (
              <button
                key={option.value}
                onClick={() => toggleDietary(option.value)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-200
                  ${
                    isSelected
                      ? option.color + " border-current scale-105"
                      : "bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                  }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
          Price Range (৳)
        </label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            className="rounded-xl border-zinc-200 dark:border-zinc-700"
            min={0}
          />
          <span className="text-zinc-400 text-sm shrink-0">to</span>
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            className="rounded-xl border-zinc-200 dark:border-zinc-700"
            min={0}
          />
        </div>
      </div>

      {/* Sort */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
          Sort By
        </label>
        <Select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onValueChange={(value) => {
            const [sortBy, sortOrder] = value.split("-");
            const updated = {
              ...filters,
              sortBy,
              sortOrder: sortOrder as "asc" | "desc",
            };
            setFilters(updated);
            onFilterChange(updated);
          }}
        >
          <SelectTrigger className="rounded-xl border-zinc-200 dark:border-zinc-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt-desc">Newest First</SelectItem>
            <SelectItem value="createdAt-asc">Oldest First</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="name-asc">Name: A to Z</SelectItem>
            <SelectItem value="name-desc">Name: Z to A</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
