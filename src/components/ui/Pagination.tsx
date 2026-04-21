"use client";

import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  const { page, totalPages, total, limit } = meta;

  if (totalPages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  // Build page number array — show max 5 page buttons
  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (page <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (page >= totalPages - 2)
      return [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];

    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
      {/* Result count */}
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Showing{" "}
        <span className="font-medium text-zinc-900 dark:text-zinc-50">
          {from}–{to}
        </span>{" "}
        of{" "}
        <span className="font-medium text-zinc-900 dark:text-zinc-50">
          {total}
        </span>{" "}
        results
      </p>

      {/* Page controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="rounded-full w-8 h-8 p-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {getPageNumbers().map((p, i) =>
          p === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className="w-8 h-8 flex items-center justify-center text-sm text-zinc-400"
            >
              …
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(p as number)}
              className={`rounded-full w-8 h-8 p-0 text-xs ${
                p === page
                  ? "bg-orange-500 hover:bg-orange-600 border-orange-500 text-white"
                  : ""
              }`}
            >
              {p}
            </Button>
          ),
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="rounded-full w-8 h-8 p-0"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
