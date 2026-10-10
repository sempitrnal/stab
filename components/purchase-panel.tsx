"use client";

import { useState } from "react";
import Link from "next/link";
import Drawer from "@/components/drawer";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import type { Product, Variant } from "@/lib/types";

export default function PurchasePanel({ product }: { product: Product }) {
  const variants = [...(product.variants ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    variants.find((v) => v.stock > 0)?.id ?? null,
  );
  const [added, setAdded] = useState(false);
  const { add } = useCart();

  const selected: Variant | undefined = variants.find(
    (v) => v.id === selectedId,
  );
  const unitPrice = selected?.price_cents ?? product.price_cents;
  const soldOut = variants.length > 0 && variants.every((v) => v.stock <= 0);
  const hasDims = variants.some((v) => v.dimensions);
  const sizeWord = product.type === "apparel" ? "Size" : "Variant";

  function handleAdd() {
    if (!selected) return;
    add({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      variantId: selected.id,
      variantLabel: selected.label,
      unitPriceCents: unitPrice,
      image: product.images[0] ?? null,
      maxStock: selected.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div>
      {selected && (
        <p className="text-[13px]">
          <span className="text-faded mr-2">{sizeWord}</span>
          {selected.label}
          {selected.dimensions && ` · ${selected.dimensions}`}
        </p>
      )}

      {variants.length > 0 && (
        <div
          className="mt-2.5 grid gap-0.5 rounded-[10px] bg-[var(--mac-fill)] p-[3px]"
          style={{
            gridTemplateColumns: `repeat(${Math.min(variants.length, 8)}, minmax(0, 1fr))`,
          }}
        >
          {variants.map((v) => {
            const out = v.stock <= 0;
            const active = v.id === selectedId;
            return (
              <button
                key={v.id}
                onClick={() => !out && setSelectedId(v.id)}
                disabled={out}
                aria-pressed={active}
                className={`h-9 rounded-[8px] text-[13px] font-medium transition-[background-color,box-shadow,color] duration-150 ${
                  active
                    ? "bg-white text-ink shadow-[0_1px_2px_rgb(0_0_0/0.12),0_0_0_0.5px_rgb(0_0_0/0.06)]"
                    : out
                      ? "text-ink/25 line-through cursor-not-allowed"
                      : "text-faded hover:text-ink"
                }`}
              >
                {v.label}
              </button>
            );
          })}
        </div>
      )}

      <button
        onClick={handleAdd}
        disabled={!selected || soldOut}
        className="mt-5 w-full sm:w-auto h-11 px-5 rounded-[10px] inline-flex items-center justify-center gap-3 bg-[var(--mac-accent)] text-white text-[14px] font-medium shadow-[inset_0_0.5px_0_rgb(255_255_255/0.2),0_1px_2px_rgb(0_0_0/0.15)] transition-[filter] hover:brightness-110 active:brightness-95 disabled:bg-bone disabled:text-faded disabled:shadow-none disabled:cursor-not-allowed"
      >
        <span>{soldOut ? "Sold out" : added ? "Added ✓" : "Add to cart"}</span>
        {!soldOut && (
          <span className="tabular-nums text-white/70">{formatPrice(unitPrice)}</span>
        )}
      </button>

      {selected && selected.stock > 0 && selected.stock <= 5 && (
        <p className="mt-3 text-[12px] font-medium text-[#c93400]">
          Only {selected.stock} left in {selected.label}
        </p>
      )}

      <div className="mt-3 flex justify-end">
        <Link href="/cart" className="text-[12px] text-faded hover:text-ink">
          View cart ›
        </Link>
      </div>

      {(product.description || hasDims) && (
        <div className="mt-6">
          {product.description && (
            <Drawer title="Details">
              <p className="text-[14px] leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </Drawer>
          )}
          {hasDims && (
            <Drawer title="Size guide">
              <table className="w-full">
                <tbody>
                  {variants.map(
                    (v) =>
                      v.dimensions && (
                        <tr
                          key={v.id}
                          className={v.id === selectedId ? "font-semibold" : "text-faded"}
                        >
                          <td className="py-1">{v.label}</td>
                          <td className="py-1 text-right">{v.dimensions}</td>
                        </tr>
                      ),
                  )}
                </tbody>
              </table>
            </Drawer>
          )}
        </div>
      )}
    </div>
  );
}
