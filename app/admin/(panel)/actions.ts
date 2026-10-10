"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderStatus } from "@/lib/types";
import { adminEmail } from "@/lib/admin-email";

export interface VariantInput {
  id?: string;
  label: string;
  sku: string | null;
  dimensions: string | null;
  price_cents: number | null;
  stock: number;
  sort_order: number;
}

export interface ProductInput {
  id?: string;
  slug: string;
  title: string;
  description: string | null;
  type: "apparel" | "accessory" | "music";
  price_cents: number;
  images: string[];
  active: boolean;
  sort_order: number;
  variants: VariantInput[];
}

function revalidateStorefront() {
  revalidatePath("/");
  revalidatePath("/product/[slug]", "page");
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.email !== adminEmail()) throw new Error("Unauthorized");
}

export async function saveProduct(input: ProductInput) {
  await requireAdmin();
  const admin = createAdminClient();
  const { variants, ...fields } = input;

  const row = {
    slug: fields.slug,
    title: fields.title,
    description: fields.description,
    type: fields.type,
    price_cents: fields.price_cents,
    images: fields.images,
    active: fields.active,
    sort_order: fields.sort_order,
  };

  let productId = fields.id;
  if (productId) {
    const { error } = await admin
      .from("products")
      .update(row)
      .eq("id", productId);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await admin
      .from("products")
      .insert(row)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    productId = data.id;
  }

  const { data: existing } = await admin
    .from("variants")
    .select("id")
    .eq("product_id", productId);
  const keepIds = new Set(variants.filter((v) => v.id).map((v) => v.id));
  const toDelete = (existing ?? []).filter((v) => !keepIds.has(v.id));
  if (toDelete.length > 0) {
    await admin
      .from("variants")
      .delete()
      .in(
        "id",
        toDelete.map((v) => v.id),
      );
  }

  for (const variant of variants) {
    const row = {
      product_id: productId,
      label: variant.label,
      sku: variant.sku,
      dimensions: variant.dimensions,
      price_cents: variant.price_cents,
      stock: variant.stock,
      sort_order: variant.sort_order,
    };
    if (variant.id) {
      const { error } = await admin
        .from("variants")
        .update(row)
        .eq("id", variant.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await admin.from("variants").insert(row);
      if (error) throw new Error(error.message);
    }
  }

  revalidateStorefront();
  redirect("/admin");
}

export async function setProductActive(id: string, active: boolean) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("products")
    .update({ active })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateStorefront();
  revalidatePath("/admin");
}

// Saves a drag-and-drop order: each product's sort_order becomes its index.
export async function reorderProducts(ids: string[]) {
  await requireAdmin();
  const admin = createAdminClient();
  const results = await Promise.all(
    ids.map((id, i) =>
      admin.from("products").update({ sort_order: i }).eq("id", id),
    ),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(failed.error.message);
  revalidateStorefront();
  revalidatePath("/admin");
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateStorefront();
  revalidatePath("/admin");
}

export async function setOrderStatus(id: string, status: OrderStatus) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("orders").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${id}`);
}

// Permanently deletes orders (their items cascade) and their uploaded
// payment screenshots. Stock is not returned.
export async function deleteOrders(ids: string[]) {
  await requireAdmin();
  if (ids.length === 0) return;
  const admin = createAdminClient();
  const { data: proofs } = await admin
    .from("orders")
    .select("proof_of_payment")
    .in("id", ids);
  const { error } = await admin.from("orders").delete().in("id", ids);
  if (error) throw new Error(error.message);
  const paths = (proofs ?? [])
    .map((o) => o.proof_of_payment as string | null)
    .filter((p): p is string => !!p);
  if (paths.length) await admin.storage.from("payment-proofs").remove(paths);
  revalidatePath("/admin/orders");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
