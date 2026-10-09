"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderStatus } from "@/lib/types";

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
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!user || (adminEmail && user.email !== adminEmail)) {
    throw new Error("Unauthorized");
  }
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

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
