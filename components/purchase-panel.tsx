"use client";

import { useState } from "react";
import Link from "next/link";
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
        <p>
          <span className="tag text-faded mr-3">{sizeWord}</span>
          {selected.label}
          {selected.dimensions && ` · ${selected.dimensions}`}
        </p>
      )}

      {variants.length > 0 && (
        <div
          className="mt-3 grid gap-1.5"
          style={{
            gridTemplateColumns: `repeat(${Math.min(variants.length, 6)}, minmax(0, 1fr))`,
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
                className={`h-10 rounded-md transition-colors ${
                  active
                    ? "bg-ink text-paper"
                    : out
                      ? "bg-bone/50 text-ink/25 line-through cursor-not-allowed"
                      : "bg-bone hover:bg-line"
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
        className="mt-2 w-full h-12 px-4 rounded-md flex items-center justify-between bg-ink text-paper tag hover:bg-accent transition-colors disabled:bg-bone disabled:text-faded disabled:cursor-not-allowed"
      >
        <span>{soldOut ? "Sold out" : added ? "Added ✓" : "Add to cart"}</span>
        {!soldOut && <span>{formatPrice(unitPrice)} →</span>}
      </button>

      {selected && selected.stock > 0 && selected.stock <= 5 && (
        <p className="mt-3 text-accent">
          ● Only {selected.stock} left in {selected.label}
        </p>
      )}

      <div className="mt-4 flex justify-between items-start gap-4">
        {hasDims ? (
          <details className="group flex-1">
            <summary className="tag text-faded hover:text-ink cursor-pointer list-none">
              <span className="group-open:hidden">+</span>
              <span className="hidden group-open:inline">−</span> Size guide
            </summary>
            <table className="mt-2 w-full">
              <tbody>
                {variants.map(
                  (v) =>
                    v.dimensions && (
                      <tr
                        key={v.id}
                        className={v.id === selectedId ? "text-accent" : ""}
                      >
                        <td className="py-1">{v.label}</td>
                        <td className="py-1 text-right">{v.dimensions}</td>
                      </tr>
                    ),
                )}
              </tbody>
            </table>
          </details>
        ) : (
          <span />
        )}
        <Link href="/cart" className="tag text-faded hover:text-ink shrink-0">
          View cart →
        </Link>
      </div>
    </div>
  );
}
