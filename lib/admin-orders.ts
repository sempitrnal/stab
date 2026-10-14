import { PAYMENT, SHIPPING, STATUS_ORDER } from "@/components/admin/order-badges";
import type { OrderStatus, PaymentMethod, ShippingMethod } from "@/lib/types";

// Orders list query state. It lives in the URL (?q=&status=&page=...) so the
// server can filter, sort and page in the database. Shared by the page, the
// data layer and the table.

export const PAGE_SIZE = 25;

export type SortKey = "date" | "status" | "payment" | "shipping" | "total";

export interface OrderQuery {
  q: string;
  status: OrderStatus | "all";
  payment: PaymentMethod | "all";
  shipping: ShippingMethod | "all";
  sort: SortKey;
  dir: "asc" | "desc";
  page: number;
}

export const DEFAULT_QUERY: OrderQuery = {
  q: "",
  status: "all",
  payment: "all",
  shipping: "all",
  sort: "date",
  dir: "desc",
  page: 1,
};

const SORT_KEYS: SortKey[] = ["date", "status", "payment", "shipping", "total"];

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

function oneOf<T extends string>(v: string | undefined, allowed: readonly T[], fallback: T): T {
  return allowed.includes(v as T) ? (v as T) : fallback;
}

export function parseOrderQuery(sp: Record<string, string | string[] | undefined>): OrderQuery {
  const page = parseInt(one(sp.page) ?? "", 10);
  return {
    q: (one(sp.q) ?? "").slice(0, 100),
    status: oneOf(one(sp.status), STATUS_ORDER, "all" as const),
    payment: oneOf(one(sp.payment), Object.keys(PAYMENT) as PaymentMethod[], "all" as const),
    shipping: oneOf(one(sp.shipping), Object.keys(SHIPPING) as ShippingMethod[], "all" as const),
    sort: oneOf(one(sp.sort), SORT_KEYS, DEFAULT_QUERY.sort),
    dir: one(sp.dir) === "asc" ? "asc" : "desc",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

// Only non-default values, so the default view has a clean URL.
export function orderQueryString(q: OrderQuery) {
  const p = new URLSearchParams();
  (Object.keys(DEFAULT_QUERY) as (keyof OrderQuery)[]).forEach((k) => {
    if (q[k] !== DEFAULT_QUERY[k]) p.set(k, String(q[k]));
  });
  const s = p.toString();
  return s ? `?${s}` : "";
}
