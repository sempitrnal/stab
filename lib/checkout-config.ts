import type { PaymentMethod, PaymentType, ShippingMethod } from "@/lib/types";

// EDIT THESE: shown to customers at checkout and on the confirmation screen.

export const PAYMENT_METHODS: Record<
  PaymentMethod,
  { label: string; instructions: string }
> = {
  gcash: {
    label: "GCash",
    instructions:
      "Send to 09XX XXX XXXX (STAB). Put your order ref in the notes.",
  },
  bank_transfer: {
    label: "Bank transfer",
    instructions: "BDO 0000 0000 0000 (STAB). Put your order ref in the notes.",
  },
  paypal: {
    label: "PayPal",
    instructions: "paypal.me/stabhc. Put your order ref in the notes.",
  },
};

export const PAYMENT_TYPES: Record<PaymentType, { label: string }> = {
  full: { label: "Full payment" },
  down: { label: "Down payment · 50%" },
};

export const SHIPPING_METHODS: Record<
  ShippingMethod,
  { label: string; note: string; feeCents: number }
> = {
  pickup: {
    label: "Pickup at a show",
    note: "Free, grab it at the merch table. Tell us which show in the notes.",
    feeCents: 0,
  },
  maxim_lalamove: {
    label: "Maxim / Lalamove",
    note: "Metro area same-day. Rider fee paid by you on delivery.",
    feeCents: 0,
  },
  jnt: {
    label: "J&T Express",
    note: "Nationwide, 2–5 days. ₱100 flat shipping fee.",
    feeCents: 10000,
  },
  international: {
    label: "International",
    note: "We'll email you a shipping quote before you pay.",
    feeCents: 0,
  },
};
