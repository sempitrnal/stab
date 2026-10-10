import type { OrderStatus, PaymentMethod, ShippingMethod } from "@/lib/types";

// Labels and macOS system tints for order metadata, shared by the orders
// list and the order page.

export const STATUS: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: "Pending", color: "#c93400" },
  half_paid: { label: "Half paid", color: "#0063d1" },
  paid: { label: "Paid", color: "#248a3d" },
  fulfilled: { label: "Fulfilled", color: "#3a3a3c" },
  cancelled: { label: "Cancelled", color: "#8e8e93" },
  refunded: { label: "Refunded", color: "#8944ab" },
};

export const STATUS_ORDER: OrderStatus[] = [
  "pending",
  "half_paid",
  "paid",
  "fulfilled",
  "cancelled",
  "refunded",
];

export const PAYMENT: Record<PaymentMethod, string> = {
  gcash: "GCash",
  bank_transfer: "Bank",
  paypal: "PayPal",
};

export const SHIPPING: Record<ShippingMethod, string> = {
  pickup: "Pickup",
  maxim_lalamove: "Maxim / Lalamove",
  jnt: "J&T",
  international: "International",
};

// Soft tinted capsule, like macOS tags.
export function Pill({
  color = "#6e6e73",
  dot,
  children,
}: {
  color?: string;
  dot?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className="inline-flex h-[20px] items-center gap-1.5 whitespace-nowrap rounded-full px-2 text-[11px] font-medium"
      style={{
        color,
        backgroundColor: `color-mix(in srgb, ${color} 13%, transparent)`,
      }}
    >
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      )}
      {children}
    </span>
  );
}

export function StatusPill({
  status,
  downPayment,
}: {
  status: OrderStatus;
  downPayment?: boolean;
}) {
  const s = STATUS[status];
  return (
    <Pill color={s.color} dot>
      {s.label}
      {downPayment && status === "half_paid" ? " · 50%" : ""}
    </Pill>
  );
}
