"use client";

import { Package, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { AdminOrderCard } from "@/components/admin/AdminOrderCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  meal: { id: string; name: string };
};

type Order = {
  id: string;
  orderNumber: string;
  status: "PLACED" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED";
  total: number;
  deliveryAddress: string;
  createdAt: string;
  customer: { id: string; name: string; email: string };
  items: OrderItem[];
};

type StatusFilter =
  | "ALL"
  | "PLACED"
  | "PREPARING"
  | "READY"
  | "DELIVERED"
  | "CANCELLED";

const LIMIT = 10;

export default function AdminOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();

  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Read state from URL
  const page = Number(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const statusFilter = (searchParams.get("status") || "ALL") as StatusFilter;

  // Debounced search input (local state, synced to URL after delay)
  const [searchInput, setSearchInput] = useState(search);

  // Auth guard
  useEffect(() => {
    if (!isPending && !session?.user) router.push("/login");
    if (!isPending && session?.user) {
      const role = (session.user as { role?: string }).role;
      if (role !== "ADMIN") router.push("/");
    }
  }, [session, isPending, router]);

  // Sync URL → input on mount
  useEffect(() => {
    setSearchInput(search);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounce search input → URL
  useEffect(() => {
    const timer = setTimeout(() => {
      setParam("search", searchInput, true); // reset to page 1 on new search
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const setParam = useCallback(
    (key: string, value: string, resetPage = false) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "ALL") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      if (resetPage) params.delete("page");
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router],
  );

  // Fetch from backend whenever URL params change
  useEffect(() => {
    if (!session?.user) return;

    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(LIMIT));
        if (search) params.set("search", search);
        if (statusFilter !== "ALL") params.set("status", statusFilter);

        const data = await api.get(`/orders/admin/all?${params.toString()}`);
        setOrders(data.data || []);
        setTotal(data.meta?.total || 0);
      } catch {
        toast.error("Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [session?.user, session?.user?.id, page, search, statusFilter]);

  if (isPending) return <LoadingSkeleton />;
  if (!session?.user) return null;

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Orders Overview
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">
            {total} total order{total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <Input
              placeholder="Search by order number..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(
            [
              "ALL",
              "PLACED",
              "PREPARING",
              "READY",
              "DELIVERED",
              "CANCELLED",
            ] as StatusFilter[]
          ).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setParam("status", status, true)}
              className={`rounded-full whitespace-nowrap ${
                statusFilter === status
                  ? "bg-emerald-500 hover:bg-emerald-600 text-zinc-950 border-0"
                  : ""
              }`}
            >
              {status === "ALL" ? "All Orders" : status}
            </Button>
          ))}
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-24 w-full" />
              </Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-zinc-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              No orders found
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              {search
                ? "Try adjusting your search"
                : "No orders match this filter"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <AdminOrderCard key={order.id} order={order} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Page {page} of {totalPages} · {total} orders
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setParam("page", String(page - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setParam("page", String(page + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 py-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-full mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-24 w-full" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
