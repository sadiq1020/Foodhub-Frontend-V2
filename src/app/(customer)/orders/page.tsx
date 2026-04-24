"use client";

import { OrderCard } from "@/components/orders/OrderCard";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import type { Order, PaginationMeta } from "@/types";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const LIMIT = 10;

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "PLACED", label: "Placed" },
  { value: "PREPARING", label: "Preparing" },
  { value: "READY", label: "Ready" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

function OrdersListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5"
        >
          <div className="flex justify-between mb-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="flex justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [activeStatus, setActiveStatus] = useState("");

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const fetchOrders = useCallback(
    async (status: string, currentPage: number) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (status) params.set("status", status);
        params.set("page", String(currentPage));
        params.set("limit", String(LIMIT));

        const data = await api.get(`/orders?${params.toString()}`);
        setOrders(data.data || []);
        setMeta(data.meta || null);
      } catch {
        setOrders([]);
        setMeta(null);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!session?.user) return;
    fetchOrders(activeStatus, page);
  }, [session?.user, fetchOrders, activeStatus, page]);

  const handleStatusChange = (status: string) => {
    setActiveStatus(status);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            My Orders
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            {isLoading
              ? "Loading orders..."
              : `${meta?.total ?? orders.length} order${(meta?.total ?? orders.length) !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Status filter tabs */}
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto pb-0 scrollbar-none">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleStatusChange(tab.value)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeStatus === tab.value
                    ? "border-emerald-500 text-emerald-500 dark:text-emerald-400"
                    : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <OrdersListSkeleton />
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 dark:bg-emerald-950/20 flex items-center justify-center mb-6">
              <ShoppingBag className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              {activeStatus
                ? `No ${activeStatus.toLowerCase()} orders`
                : "No orders yet"}
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm">
              {activeStatus
                ? "Try selecting a different status filter."
                : "Browse our meals to get started!"}
            </p>
            {!activeStatus && (
              <Button
                asChild
                className="rounded-full bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-0 text-zinc-950 px-8"
              >
                <Link href="/meals">Browse Meals</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}

            {meta && <Pagination meta={meta} onPageChange={handlePageChange} />}
          </div>
        )}
      </div>
    </div>
  );
}
