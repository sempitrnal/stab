"use client";

import { useTransition } from "react";
import { setOrderStatus } from "@/app/admin/(panel)/actions";
import type { OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = [
  "pending",
  "half_paid",
  "paid",
  "fulfilled",
  "cancelled",
  "refunded",
];

export default function OrderStatusControl({
  id,
  status,
}: {
  id: string;
  status: OrderStatus;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-px bg-paper border border-ink/15">
      {STATUSES.map((s) => (
        <button
          key={s}
          disabled={pending || s === status}
          onClick={() => startTransition(() => setOrderStatus(id, s))}
          className={`px-2 py-1.5 sm:px-3 font-mono text-[10px] uppercase tracking-widest transition-colors ${
            s === status
              ? "bg-ink text-paper"
              : "bg-paper hover:bg-bone disabled:opacity-40"
          }`}
        >
          {s.replace("_", " ")}
        </button>
      ))}
    </div>
  );
}
