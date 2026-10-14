"use client";

import { useOptimistic, useTransition } from "react";
import { setOrderStatus } from "@/app/admin/(panel)/actions";
import Dropdown from "@/components/admin/dropdown";
import { STATUS, STATUS_ORDER } from "@/components/admin/order-badges";
import type { OrderStatus } from "@/lib/types";

const OPTIONS = STATUS_ORDER.map((s) => ({
  value: s,
  label: STATUS[s].label,
  color: STATUS[s].color,
  ink: STATUS[s].ink,
}));

// Order status dropdown, each status in its own color. Updates instantly,
// saves in the background.
export default function OrderStatusControl({
  id,
  status,
}: {
  id: string;
  status: OrderStatus;
}) {
  const [pending, startTransition] = useTransition();
  const [shown, setShown] = useOptimistic(status);

  return (
    <Dropdown
      label="Order status"
      value={shown}
      options={OPTIONS}
      disabled={pending}
      tinted
      onChange={(next) =>
        startTransition(async () => {
          setShown(next);
          await setOrderStatus(id, next);
        })
      }
    />
  );
}
