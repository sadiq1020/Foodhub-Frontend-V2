import type { Order } from "@/types";

interface OrderTimelineProps {
  status: Order["status"];
}

export function OrderTimeline({ status }: OrderTimelineProps) {
  const steps = [
    { status: "PLACED", label: "Order Placed", icon: "📝" },
    { status: "PREPARING", label: "Preparing", icon: "👨‍🍳" },
    { status: "READY", label: "Ready", icon: "✅" },
    { status: "DELIVERED", label: "Delivered", icon: "🎉" },
  ];

  const statusOrder = ["PLACED", "PREPARING", "READY", "DELIVERED"];
  const currentIndex = statusOrder.indexOf(status);
  const isCancelled = status === "CANCELLED";

  if (isCancelled) {
    return (
      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 text-red-700 dark:text-red-300">
          <span className="text-3xl">❌</span>
          <div>
            <p className="font-semibold">Order Cancelled</p>
            <p className="text-sm text-red-600 dark:text-red-400">
              This order has been cancelled
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
      <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-6">
        Order Status
      </h3>

      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div
                key={step.status}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
                    isCompleted
                      ? "bg-emerald-500 text-zinc-950 scale-110"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                  } ${isCurrent && "ring-4 ring-emerald-500/30 dark:ring-emerald-500/20"}`}
                >
                  {step.icon}
                </div>
                <p
                  className={`text-xs font-medium text-center ${
                    isCompleted
                      ? "text-zinc-900 dark:text-zinc-50"
                      : "text-zinc-400"
                  }`}
                >
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
