import type { OrderStatus, PaymentMethod, ShippingMethod } from "@/lib/types";

// Labels and macOS system tints for order metadata, shared by the orders
// list and the order page.

// `color` is the pastel fill, `ink` a deeper tone of it for readable text.
export const STATUS: Record<OrderStatus, { label: string; color: string; ink: string }> = {
  pending: { label: "Pending", color: "#fff1a8", ink: "#8a6d00" },
  half_paid: { label: "Half paid", color: "#b5d4ff", ink: "#2b5fa8" },
  paid: { label: "Paid", color: "#b8e8c4", ink: "#2d7a45" },
  fulfilled: { label: "Fulfilled", color: "#d6d6e0", ink: "#4f4f5a" },
  cancelled: { label: "Cancelled", color: "#ffbfc0", ink: "#b02a37" },
  refunded: { label: "Refunded", color: "#e3cdf2", ink: "#7a4a99" },
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

// Brand colors: GCash blue, GoTyme cyan (the bank option), PayPal yellow.
export const PAYMENT_STYLE: Record<PaymentMethod, { bg: string; fg: string }> = {
  gcash: { bg: "#007cff", fg: "#ffffff" },
  bank_transfer: { bg: "#2fd6e6", fg: "#000000" },
  paypal: { bg: "#ffc439", fg: "#000000" },
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
  ink,
  dot,
  children,
}: {
  color?: string;
  // Text color; defaults to `color`. Set it when `color` is a pastel fill.
  ink?: string;
  dot?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className="inline-flex h-[20px] items-center gap-1.5 whitespace-nowrap rounded-full px-2 text-[0.6875rem] font-medium"
      style={{
        color: ink ?? color,
        backgroundColor: ink
          ? `color-mix(in srgb, ${color} 55%, transparent)`
          : `color-mix(in srgb, ${color} 13%, transparent)`,
      }}
    >
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ink ?? color }} />
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
    <Pill color={s.color} ink={s.ink} dot>
      {s.label}
      {downPayment && status === "half_paid" ? " · 50%" : ""}
    </Pill>
  );
}

export function PaymentPill({ method }: { method: PaymentMethod }) {
  const c = PAYMENT_STYLE[method];
  return (
    <span
      className="inline-flex h-[20px] items-center whitespace-nowrap rounded-full px-2 text-[0.6875rem] font-semibold"
      style={{ backgroundColor: c.bg, color: c.fg }}
    >
      {PAYMENT[method]}
    </span>
  );
}
