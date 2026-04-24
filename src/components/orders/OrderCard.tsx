"use client";

import { ChevronRight, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { OrderStatusBadge } from "./OrderStatusBadge";

type Order = {
  id: string;
  orderNumber: string;
  status: "PLACED" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED";
  total: number;
  createdAt: string;
  _count?: {
    orderItems: number;
  };
};

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      onClick={() => router.push(`/orders/${order.id}`)}
      className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag className="w-4 h-4 text-emerald-500" />
            <p className="font-semibold text-zinc-900 dark:text-zinc-50">
              Order #{order.orderNumber}
            </p>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {formatDate(order.createdAt)}
          </p>
        </div>

        <OrderStatusBadge status={order.status} />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-zinc-400 uppercase tracking-wide">
              Total
            </p>
            <p className="text-lg font-bold text-emerald-500 dark:text-emerald-400">
              ৳{order.total}
            </p>
          </div>
          {order._count && (
            <div>
              <p className="text-xs text-zinc-400 uppercase tracking-wide">
                Items
              </p>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {order._count.orderItems}
              </p>
            </div>
          )}
        </div>

        <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
}
