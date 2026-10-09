import { createAdminClient } from "@/lib/supabase/admin";
import type { Order, Product } from "@/lib/types";

export async function getAllProducts(): Promise<Product[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, variants(*)")
    .order("sort_order", { ascending: true })
    .order("sort_order", { referencedTable: "variants", ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getAllOrders(): Promise<Order[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export interface ProductTally {
  title: string;
  totalQty: number;
  variants: { label: string; qty: number }[];
}

// Units sold per product/variant, excluding cancelled orders.
export async function getProductTally(): Promise<ProductTally[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("order_items")
    .select("title, variant_label, qty, orders!inner(status)");
  if (error) throw error;

  const byProduct = new Map<string, Map<string, number>>();
  for (const row of data ?? []) {
    const joined = row.orders as { status: string }[] | { status: string };
    const status = Array.isArray(joined) ? joined[0]?.status : joined?.status;
    if (status === "cancelled") continue;
    const label = row.variant_label || "OS";
    const variants = byProduct.get(row.title) ?? new Map<string, number>();
    variants.set(label, (variants.get(label) ?? 0) + row.qty);
    byProduct.set(row.title, variants);
  }

  return [...byProduct.entries()]
    .map(([title, variants]) => ({
      title,
      variants: [...variants.entries()]
        .map(([label, qty]) => ({ label, qty }))
        .sort((a, b) => b.qty - a.qty),
      totalQty: [...variants.values()].reduce((n, q) => n + q, 0),
    }))
    .sort((a, b) => b.totalQty - a.totalQty);
}
