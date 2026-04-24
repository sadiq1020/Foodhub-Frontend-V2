import { MapPin, MessageSquare, Phone } from "lucide-react";

interface OrderDeliveryInfoProps {
  deliveryAddress: string;
  phone: string;
  notes?: string | null;
}

export function OrderDeliveryInfo({
  deliveryAddress,
  phone,
  notes,
}: OrderDeliveryInfoProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
      <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
        Delivery Info
      </h3>

      <div className="space-y-3">
        <div className="flex gap-3">
          <MapPin className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">
              Address
            </p>
            <p className="text-sm text-zinc-900 dark:text-zinc-50">
              {deliveryAddress}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Phone className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">
              Phone
            </p>
            <p className="text-sm text-zinc-900 dark:text-zinc-50">{phone}</p>
          </div>
        </div>

        {notes && (
          <div className="flex gap-3">
            <MessageSquare className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">
                Notes
              </p>
              <p className="text-sm text-zinc-900 dark:text-zinc-50">{notes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
