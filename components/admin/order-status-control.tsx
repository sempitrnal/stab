"use client";

import { useOptimistic, useTransition } from "react";
import { setOrderStatus } from "@/app/admin/(panel)/actions";
import { STATUS, STATUS_ORDER } from "@/components/admin/order-badges";
import type { OrderStatus } from "@/lib/types";

// macOS pop-up button for the order status. Updates instantly, saves in the
// background.
export default function OrderStatusControl({
  id,
  status,
}: {
  id: string;
  status: OrderStatus;
}) {
  const [pending, startTransition] = useTransition();
  const [shown, setShown] = useOptimistic(status);
  const color = STATUS[shown].color;

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Order status</span>
      <span
        aria-hidden
        className="pointer-events-none absolute left-2.5 h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      <select
        value={shown}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as OrderStatus;
          startTransition(async () => {
            setShown(next);
            await setOrderStatus(id, next);
          });
        }}
        className="mac-input w-auto! appearance-none pl-7! pr-8! font-medium disabled:opacity-60"
        style={{ color }}
      >
        {STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {STATUS[s].label}
          </option>
        ))}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 10 14"
        className="pointer-events-none absolute right-2.5 h-3 w-2 text-[var(--mac-secondary)]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m2 5 3-3 3 3M2 9l3 3 3-3" />
      </svg>
    </label>
  );
}
