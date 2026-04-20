"use client";

import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";

import { OrderDeliveryInfo } from "@/components/orders/OrderDeliveryInfo";
import { OrderItemsList } from "@/components/orders/OrderItemsList";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { OrderSummaryCard } from "@/components/orders/OrderSummaryCard";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { handleApiError } from "@/lib/handle-error";
import type { Order } from "@/types";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!session?.user) return;

      try {
        setIsLoading(true);
        const data = await api.get(`/orders/${id}`);
        setOrder(data.data || data);
      } catch (error) {
        // console.error("Failed to fetch order:", error);
        toast.error("Order not found");
        router.push("/orders");
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchOrder();
    }
  }, [session, id, router]);

  const handleCancelOrder = async () => {
    if (!order) return;

    const toastId = toast.loading("Cancelling order...");
    setIsCancelling(true);

    try {
      await api.put(`/orders/${order.id}/cancel`, {});
      toast.success("Order cancelled successfully", { id: toastId });
      setOrder({ ...order, status: "CANCELLED" });
    } catch (error: unknown) {
      // const message =
      //   error instanceof Error ? error.message : "Failed to cancel order";
      // toast.error(message, { id: toastId });
      handleApiError(error, toastId);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReviewSuccess = (mealId: string) => {
    toast.success("Thank you for your review!");
    // ✅ Navigate to the meal page so the customer can see their review immediately.
    // The meal detail page uses cache: 'no-store' so it will always show fresh data.
    router.push(`/meals/${mealId}`);
  };

  if (isPending || isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session?.user || !order) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canCancel = order.status === "PLACED";
  const canReview = order.status === "DELIVERED";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 py-6">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 -ml-2 mb-3"
          >
            <Link href="/orders">
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </Link>
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                Order #{order.orderNumber}
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">
                {formatDate(order.createdAt)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <OrderStatusBadge status={order.status} />

              {canCancel && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={isCancelling}
                      className="rounded-full"
                    >
                      Cancel Order
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        Cancel Order?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to cancel this order? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Order</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancelOrder}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Yes, Cancel Order
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <OrderTimeline status={order.status} />
            {order.items && (
              <OrderItemsList
                items={order.items}
                canReview={canReview}
                onReviewClick={(mealId: string, mealName: string) => {
                  setSelectedMeal({ id: mealId, name: mealName });
                  setReviewDialogOpen(true);
                }}
              />
            )}
          </div>

          <div className="space-y-6">
            <OrderDeliveryInfo
              deliveryAddress={order.deliveryAddress}
              phone={order.phone}
              notes={order.notes}
            />
            <OrderSummaryCard
              subtotal={order.subtotal}
              deliveryFee={order.deliveryFee}
              total={order.total}
            />
          </div>
        </div>
      </div>

      {/* Review Dialog */}
      {selectedMeal && (
        <ReviewForm
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          mealId={selectedMeal.id}
          mealName={selectedMeal.name}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}
