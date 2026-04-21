"use client";

import { Pagination } from "@/components/ui/Pagination";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { PaginationMeta } from "@/types";
import { Search, Store, UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Provider = {
  id: string;
  businessName: string;
  description?: string | null;
  address: string;
  logo?: string | null;
  _count: { meals: number };
};

function ProviderCardSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="w-14 h-14 rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3 mt-2" />
    </div>
  );
}

function ProviderCard({ provider }: { provider: Provider }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/provider-profile/${provider.id}`)}
      className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 cursor-pointer hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-lg hover:shadow-orange-100 dark:hover:shadow-orange-950/20 transition-all duration-300 group"
    >
      <div className="flex items-center gap-4 mb-3">
        {/* Logo or placeholder */}
        <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center">
          {provider.logo ? (
            <Image
              src={provider.logo}
              alt={provider.businessName}
              width={56}
              height={56}
              className="object-cover w-full h-full"
            />
          ) : (
            <Store className="w-6 h-6 text-orange-500" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors truncate">
            {provider.businessName}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
            📍 {provider.address}
          </p>
        </div>
      </div>

      {provider.description && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-3">
          {provider.description}
        </p>
      )}

      <div className="flex items-center gap-1 text-xs text-zinc-400">
        <UtensilsCrossed className="w-3 h-3" />
        <span>{provider._count.meals} meals available</span>
      </div>
    </div>
  );
}

const LIMIT = 12;

export default function ProvidersPublicPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const fetchProviders = useCallback(
    async (searchTerm: string, currentPage: number) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.set("search", searchTerm);
        params.set("page", String(currentPage));
        params.set("limit", String(LIMIT));

        const data = await api.get(`/provider-profile?${params.toString()}`);
        setProviders(data.data || []);
        setMeta(data.meta || null);
      } catch {
        setProviders([]);
        setMeta(null);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Initial fetch
  useEffect(() => {
    fetchProviders("", 1);
  }, [fetchProviders]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchProviders(search, 1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, fetchProviders]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchProviders(search, newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Our Providers
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            {isLoading
              ? "Loading providers..."
              : `${meta?.total ?? providers.length} restaurant${(meta?.total ?? providers.length) !== 1 ? "s" : ""} available`}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search bar */}
        <div className="relative max-w-md mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder="Search restaurants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProviderCardSkeleton key={i} />
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <Store className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
              No providers found
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400">
              Try a different search term.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>

            {meta && <Pagination meta={meta} onPageChange={handlePageChange} />}
          </>
        )}
      </div>
    </div>
  );
}
