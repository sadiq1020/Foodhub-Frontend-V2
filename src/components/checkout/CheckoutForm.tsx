"use client";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldErrors, UseFormRegister } from "react-hook-form";

type CheckoutFormData = {
  deliveryAddress: string;
  phone: string;
  notes?: string;
};

interface CheckoutFormProps {
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
}

export function CheckoutForm({ register, errors }: CheckoutFormProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-5">
        Delivery Information
      </h2>

      <FieldGroup>
        {/* Delivery Address */}
        <Field data-invalid={!!errors.deliveryAddress}>
          <FieldLabel htmlFor="deliveryAddress">Delivery Address *</FieldLabel>
          <Textarea
            id="deliveryAddress"
            placeholder="Enter your full delivery address"
            rows={3}
            {...register("deliveryAddress")}
          />
          <FieldDescription>
            Include street, house number, and any landmarks
          </FieldDescription>
          {errors.deliveryAddress && (
            <FieldError errors={[errors.deliveryAddress]} />
          )}
        </Field>

        {/* Phone Number */}
        <Field data-invalid={!!errors.phone}>
          <FieldLabel htmlFor="phone">Phone Number *</FieldLabel>
          <Input
            id="phone"
            type="tel"
            placeholder="01700000000"
            {...register("phone")}
          />
          <FieldDescription>
            We&apos;ll call you if we need directions
          </FieldDescription>
          {errors.phone && <FieldError errors={[errors.phone]} />}
        </Field>

        {/* Notes */}
        <Field>
          <FieldLabel htmlFor="notes">Delivery Notes (Optional)</FieldLabel>
          <Textarea
            id="notes"
            placeholder="Any special instructions for delivery?"
            rows={2}
            {...register("notes")}
          />
          <FieldDescription>
            E.g., &quot;Ring the doorbell twice&quot;
          </FieldDescription>
        </Field>

        {/* Payment Method */}
        {/* Payment Method */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-5 mt-2">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
            Payment Method
          </h3>
          <div className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center">
              <span className="text-xl">💳</span>
            </div>
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-50 text-sm">
                Stripe — Card Payment
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Secured by Stripe. You will be redirected to complete payment.
              </p>
            </div>
          </div>
        </div>
      </FieldGroup>
    </div>
  );
}
