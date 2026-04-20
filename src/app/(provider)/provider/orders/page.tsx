"use client";

import { Package, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { OrderCard } from "@/components/provider/OrderCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { handleApiError } from "@/lib/handle-error";

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  meal: {
    id: string;
    name: string;
    image?: string | null;
  };
};

type Order = {
  id: string;
  orderNumber: string;
  status: "PLACED" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED";
  total: number;
  deliveryAddress: string;
  phone: string;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
};

export default function ProviderOrdersPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasFetched = useRef(false);

  // Protected route
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }

    if (!isPending && session?.user) {
      const userRole = (session.user as { role?: string }).role;
      if (userRole !== "PROVIDER") {
        router.push("/");
      }
    }
  }, [session, isPending, router]);

  // Fetch orders
  const fetchOrders = async (showToast = false) => {
    if (!session?.user) return;

    try {
      if (showToast) setIsRefreshing(true);
      else setIsLoading(true);

      const data = await api.get("/provider/orders");
      setOrders(data.data || data);

      if (showToast) {
        toast.success("Orders refreshed");
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!session?.user) return;
    if (hasFetched.current) return; // ✅ Don't re-fetch on tab switch
    hasFetched.current = true;
    fetchOrders();
  }, [session?.user?.id]); // ✅ Stable string, not the whole session object

  // Update order status
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const toastId = toast.loading("Updating status...");

    try {
      await api.put(`/orders/${orderId}/status`, {
        status: newStatus,
      });

      setOrders(
        orders.map((order) =>
          order.id === orderId
            ? { ...order, status: newStatus as Order["status"] }
            : order,
        ),
      );

      toast.success("Status updated successfully", { id: toastId });
    } catch (error: unknown) {
      // const message =
      //   error instanceof Error ? error.message : "Failed to update status";
      // toast.error(message, { id: toastId });
      handleApiError(error, toastId);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
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
                Orders
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">
                Manage incoming orders
              </p>
            </div>
            <Button
              onClick={() => fetchOrders(true)}
              variant="outline"
              size="sm"
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-16 w-full" />
              </Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 rounded-full bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              No orders yet
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              Orders will appear here once customers place them
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
