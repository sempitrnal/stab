import { createAdminClient } from "@/lib/supabase/admin";
import { PAGE_SIZE, type OrderQuery, type SortKey } from "@/lib/admin-orders";
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

const SORT_COLUMN: Record<SortKey, string> = {
  date: "created_at",
  status: "status", // enum columns sort in declared order
  payment: "payment_method",
  shipping: "shipping_method",
  total: "total_cents",
};

// One page of orders, filtered and sorted in the database. `total` is the
// match count across all pages.
export async function getOrdersPage(
  query: OrderQuery,
): Promise<{ orders: Order[]; total: number; page: number }> {
  const supabase = createAdminClient();

  const run = (page: number) => {
    let qb = supabase
      .from("orders")
      .select("*, order_items(image, title, qty)", { count: "exact" });
    if (query.status !== "all") qb = qb.eq("status", query.status);
    if (query.payment !== "all") qb = qb.eq("payment_method", query.payment);
    if (query.shipping !== "all") qb = qb.eq("shipping_method", query.shipping);
    // Strip characters that are special in PostgREST filters and LIKE.
    const term = query.q.replace(/[,()%*_\\"]/g, " ").trim();
    if (term) {
      qb = qb.or(
        ["ref", "name", "email", "phone"].map((c) => `${c}.ilike.%${term}%`).join(","),
      );
    }
    return qb
      .order(SORT_COLUMN[query.sort], { ascending: query.dir === "asc" })
      .order("created_at", { ascending: false })
      .order("id")
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  };

  let page = query.page;
  let res = await run(page);
  // Page past the end (e.g. after deleting the last rows): fall back to the last page.
  if (res.error?.code === "PGRST103" && page > 1) {
    page = 1;
    res = await run(page);
  }
  if (res.error) throw res.error;
  const total = res.count ?? 0;
  const last = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (page > last) {
    page = last;
    res = await run(page);
    if (res.error) throw res.error;
  }
  return { orders: res.data ?? [], total, page };
}

// Headline numbers for the orders page, independent of the list's filters.
export async function getOrderStats() {
  const supabase = createAdminClient();
  const count = async (statuses?: string[]) => {
    let qb = supabase.from("orders").select("id", { count: "exact", head: true });
    if (statuses) qb = qb.in("status", statuses);
    const { count, error } = await qb;
    if (error) throw error;
    return count ?? 0;
  };
  const revenue = async () => {
    let sum = 0;
    for (let from = 0; ; from += 1000) {
      const { data, error } = await supabase
        .from("orders")
        .select("total_cents")
        .in("status", ["paid", "fulfilled"])
        .order("id")
        .range(from, from + 999);
      if (error) throw error;
      sum += (data ?? []).reduce((n, o) => n + o.total_cents, 0);
      if ((data?.length ?? 0) < 1000) return sum;
    }
  };
  const [orders, toPay, revenueCents] = await Promise.all([
    count(),
    count(["pending", "half_paid"]),
    revenue(),
  ]);
  return { orders, toPay, revenueCents };
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
