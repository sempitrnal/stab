import type { Product } from "@/lib/types";

// STAB.EXE: products are listed like files on a dial-up BBS.

const EXT: Record<Product["type"], string> = {
  apparel: "GFX",
  accessory: "GFX",
  music: "WAV",
};

/** "Logo Tee" → "LOGO_TEE.GFX" */
export function fileName(product: Pick<Product, "title" | "type">) {
  const base =
    product.title
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "UNTITLED";
  return `${base}.${EXT[product.type]}`;
}

export type StockStatus = "ok" | "low" | "preorder" | "sold_out";

/** Stock across all variants, as one status for listings. */
export function stockStatus(product: Product): StockStatus {
  if (product.preorder) return "preorder";
  const variants = product.variants ?? [];
  if (variants.length === 0) return "ok";
  const total = variants.reduce((n, v) => n + Math.max(v.stock, 0), 0);
  if (total <= 0) return "sold_out";
  return total <= 5 ? "low" : "ok";
}

export const STOCK_LABEL: Record<StockStatus, string> = {
  ok: "OK",
  low: "LOW",
  preorder: "PREORDER",
  sold_out: "SOLD OUT",
};
