"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { handleApiError } from "@/lib/handle-error";

const DELIVERY_FEE = 50;

const checkoutSchema = z.object({
  deliveryAddress: z.string().min(10, "Address must be at least 10 characters"),
  phone: z.string().regex(/^[0-9]{10,15}$/, "Phone must be 10-15 digits"),
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { items, getCartTotal, clearCart } = useCart();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryAddress: "",
      phone: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session?.user || items.length === 0) return null;

  const subtotal = getCartTotal();
  const total = subtotal + DELIVERY_FEE;

  const onSubmit = async (data: CheckoutFormData) => {
    const toastId = toast.loading("Placing your order...");

    try {
      const response = await api.post("/orders", {
        deliveryAddress: data.deliveryAddress,
        phone: data.phone,
        notes: data.notes || "",
        items: items.map((item) => ({
          mealId: item.mealId,
          quantity: item.quantity,
        })),
      });

      // Backend returns { data: { order, payment, paymentUrl } }
      const paymentUrl = response?.data?.paymentUrl;

      if (!paymentUrl) {
        toast.error("Payment URL not received. Please try again.", {
          id: toastId,
        });
        return;
      }

      toast.success("Order placed! Redirecting to payment...", {
        id: toastId,
      });

      // Clear cart before leaving — order is created in DB
      clearCart();

      // Small timeout lets React finish the current render before
      // navigating away to the external Stripe URL
      setTimeout(() => {
        window.location.href = paymentUrl;
      }, 100);
    } catch (error) {
      handleApiError(error, toastId);
    }
  };

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
            <Link href="/cart">
              <ArrowLeft className="w-4 h-4" />
              Back to Cart
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Checkout
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">
            Complete your order
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <form
            id="checkout-form"
            onSubmit={handleSubmit(onSubmit)}
            className="flex-1"
          >
            <CheckoutForm register={register} errors={errors} />
          </form>

          <div className="w-full lg:w-96 shrink-0">
            <OrderSummary
              items={items}
              subtotal={subtotal}
              deliveryFee={DELIVERY_FEE}
              total={total}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
