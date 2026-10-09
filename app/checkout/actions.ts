"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { SHIPPING_METHODS } from "@/lib/checkout-config";
import type { PaymentMethod, PaymentType, ShippingMethod } from "@/lib/types";

export interface CheckoutItemInput {
  variantId: string;
  qty: number;
}

export interface CheckoutAddress {
  street?: string;
  barangay?: string;
  city?: string;
  province?: string;
  postal?: string;
  country?: string;
  pin?: string;
}

export interface CheckoutInput {
  name: string;
  email: string;
  phone: string;
  socialHandle?: string;
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;
  proofPath?: string;
  shippingMethod: ShippingMethod;
  address?: CheckoutAddress;
  items: CheckoutItemInput[];
}

export async function placeOrder(
  input: CheckoutInput,
): Promise<{ ref: string } | { error: string }> {
  const name = input.name.trim();
  const email = input.email.trim();
  const phone = input.phone.trim();
  const a = input.address;

  if (!name || !email || !phone)
    return { error: "Name, email, and phone are required" };

  let address = null;
  if (input.shippingMethod === "maxim_lalamove") {
    if (!a?.pin?.trim()) {
      return { error: "Tell us where to pin the location" };
    }
    address = { pin: a.pin.trim() };
  } else if (input.shippingMethod !== "pickup") {
    const intl = input.shippingMethod === "international";
    if (
      !a?.street?.trim() ||
      !a?.city?.trim() ||
      !a?.province?.trim() ||
      !a?.postal?.trim() ||
      (!intl && !a?.barangay?.trim()) ||
      (intl && !a?.country?.trim())
    ) {
      return { error: "Complete the delivery address" };
    }
    address = {
      street: a.street.trim(),
      ...(a.barangay?.trim() ? { barangay: a.barangay.trim() } : {}),
      city: a.city.trim(),
      province: a.province.trim(),
      postal: a.postal.trim(),
      country: intl ? a.country!.trim() : "Philippines",
    };
  }

  if (input.items.length === 0) return { error: "Cart is empty" };

  const admin = createAdminClient();
  const variantIds = input.items.map((i) => i.variantId);

  // Price and stock are always resolved server-side, never trust the client.
  const { data: variants, error: vErr } = await admin
    .from("variants")
    .select(
      "id, label, stock, price_cents, products(title, price_cents, active, images)",
    )
    .in("id", variantIds);
  if (vErr || !variants) return { error: "Could not verify items" };

  const byId = new Map(variants.map((v) => [v.id, v]));
  const lineItems = [];

  for (const item of input.items) {
    const v = byId.get(item.variantId);
    const joined = v?.products;
    const product = (Array.isArray(joined) ? joined[0] : joined) as
      | {
          title: string;
          price_cents: number;
          active: boolean;
          images: string[];
        }
      | null
      | undefined;
    if (!v || !product?.active)
      return { error: "An item in your cart is no longer available" };
    if (item.qty < 1) return { error: "Invalid quantity" };
    if (v.stock < item.qty)
      return { error: `Not enough stock for ${product.title} (${v.label})` };
    lineItems.push({
      variant_id: v.id,
      title: product.title,
      variant_label: v.label,
      image: product.images?.[0] ?? null,
      qty: item.qty,
      unit_price_cents: v.price_cents ?? product.price_cents,
    });
  }

  const merchCents = lineItems.reduce(
    (n, i) => n + i.qty * i.unit_price_cents,
    0,
  );
  const shippingFeeCents =
    SHIPPING_METHODS[input.shippingMethod]?.feeCents ?? 0;
  const totalCents = merchCents + shippingFeeCents;

  const { data: order, error: oErr } = await admin
    .from("orders")
    .insert({
      name,
      email,
      phone,
      social_handle: input.socialHandle?.trim() || null,
      payment_method: input.paymentMethod,
      payment_type: input.paymentType === "down" ? "down" : "full",
      proof_of_payment: input.proofPath ?? null,
      shipping_method: input.shippingMethod,
      address,
      total_cents: totalCents,
    })
    .select("id, ref")
    .single();
  if (oErr || !order) return { error: "Could not create order" };

  const { error: iErr } = await admin
    .from("order_items")
    .insert(lineItems.map((li) => ({ ...li, order_id: order.id })));
  if (iErr) {
    // Roll back the bare order so it doesn't linger item-less.
    await admin.from("orders").delete().eq("id", order.id);
    return { error: "Could not create order" };
  }

  for (const item of input.items) {
    await admin.rpc("decrement_stock", {
      variant: item.variantId,
      qty: item.qty,
    });
  }

  revalidatePath("/");
  return { ref: order.ref };
}
