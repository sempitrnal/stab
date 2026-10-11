"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { parseDimensions } from "@/lib/dimensions";
import {
  CUSTOM_LIMITS,
  customLabel,
  customLineId,
  isValidCustomSize,
  roundHalf,
} from "@/lib/custom-size";
import type { Product, Variant } from "@/lib/types";

// Always-open section: same hairlines as the old collapsible drawer.
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line py-3">
      <h2 className="mb-2 text-[0.8125rem] font-medium">{title}</h2>
      {children}
    </section>
  );
}

export default function PurchasePanel({ product }: { product: Product }) {
  const variants = [...(product.variants ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    variants.find((v) => v.stock > 0)?.id ?? null,
  );
  const [added, setAdded] = useState(false);
  // Made-to-measure (apparel only): the buyer types width and length.
  const [customOn, setCustomOn] = useState(false);
  const [customW, setCustomW] = useState("");
  const [customL, setCustomL] = useState("");
  const { add } = useCart();

  const selected: Variant | undefined = variants.find(
    (v) => v.id === selectedId,
  );
  const unitPrice = selected?.price_cents ?? product.price_cents;
  const soldOut = variants.length > 0 && variants.every((v) => v.stock <= 0);
  const hasDims = variants.some((v) => v.dimensions);
  const sizeWord = product.type === "apparel" ? "Size" : "Variant";

  // Switched on per product in the admin (apparel only).
  const canCustom = product.type === "apparel" && !!product.allow_custom_size;
  const parsed = {
    width: roundHalf(parseFloat(customW)),
    length: roundHalf(parseFloat(customL)),
  };
  const customValid = customOn && isValidCustomSize(parsed);

  function handleAdd() {
    if (customOn) {
      if (!isValidCustomSize(parsed)) return;
      add({
        productId: product.id,
        slug: product.slug,
        title: product.title,
        variantId: customLineId(product.id, parsed),
        variantLabel: customLabel(parsed),
        unitPriceCents: product.price_cents,
        image: product.images[0] ?? null,
        maxStock: 99,
        custom: parsed,
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
      return;
    }
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
      {customOn ? (
        <p className="text-[0.8125rem]">
          <span className="text-faded mr-2">{sizeWord}</span>
          {customValid ? customLabel(parsed) : "Custom"}
        </p>
      ) : (
        selected && (
          <p className="text-[0.8125rem]">
            <span className="text-faded mr-2">{sizeWord}</span>
            {selected.label}
            {selected.dimensions && ` · ${selected.dimensions}`}
          </p>
        )
      )}

      {(variants.length > 0 || canCustom) && (
        <div
          className="mt-2.5 grid gap-0.5 rounded-[10px] bg-[var(--mac-fill)] p-[3px]"
          style={{
            gridTemplateColumns:
              `${variants.length > 0 ? `repeat(${Math.min(variants.length, 8)}, minmax(0, 1fr))` : ""}${canCustom ? " minmax(4.5rem, auto)" : ""}`.trim(),
          }}
        >
          {variants.map((v) => {
            const out = v.stock <= 0;
            const active = !customOn && v.id === selectedId;
            return (
              <button
                key={v.id}
                onClick={() => {
                  if (out) return;
                  setCustomOn(false);
                  setSelectedId(v.id);
                }}
                disabled={out}
                aria-pressed={active}
                className={`h-9 rounded-[8px] text-[0.8125rem] font-medium transition-[background-color,box-shadow,color] duration-150 ${
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
          {canCustom && (
            <button
              onClick={() => setCustomOn(true)}
              aria-pressed={customOn}
              className={`h-9 rounded-[8px] px-3 text-[0.8125rem] font-medium transition-[background-color,box-shadow,color] duration-150 ${
                customOn
                  ? "bg-white text-ink shadow-[0_1px_2px_rgb(0_0_0/0.12),0_0_0_0.5px_rgb(0_0_0/0.06)]"
                  : "text-faded hover:text-ink"
              }`}
            >
              Custom
            </button>
          )}
        </div>
      )}

      {canCustom && customOn && (
        <div className="mt-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-[0.75rem] text-faded">
                Width (in)
              </span>
              <input
                className="mac-input tabular-nums"
                inputMode="decimal"
                value={customW}
                onChange={(e) => setCustomW(e.target.value)}
                placeholder={`${CUSTOM_LIMITS.width.min}–${CUSTOM_LIMITS.width.max}`}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[0.75rem] text-faded">
                Length (in)
              </span>
              <input
                className="mac-input tabular-nums"
                inputMode="decimal"
                value={customL}
                onChange={(e) => setCustomL(e.target.value)}
                placeholder={`${CUSTOM_LIMITS.length.min}–${CUSTOM_LIMITS.length.max}`}
              />
            </label>
            {(customW || customL) && !customValid && (
              <p className="col-span-2 text-[0.75rem] text-[#c93400]">
                Width {CUSTOM_LIMITS.width.min}–{CUSTOM_LIMITS.width.max} in,
                length {CUSTOM_LIMITS.length.min}–{CUSTOM_LIMITS.length.max} in.
              </p>
            )}
          </div>
        </div>
      )}

      <button
        onClick={handleAdd}
        disabled={customOn ? !customValid : !selected || soldOut}
        className="mt-5 w-full sm:w-auto h-11 px-5 rounded-[10px] inline-flex items-center justify-center gap-3 bg-[var(--mac-accent)] text-white text-[0.875rem] font-medium shadow-[inset_0_0.5px_0_rgb(255_255_255/0.2),0_1px_2px_rgb(0_0_0/0.15)] transition-[filter] hover:brightness-110 active:brightness-95 disabled:bg-bone disabled:text-faded disabled:shadow-none disabled:cursor-not-allowed"
      >
        <span>
          {soldOut && !customOn
            ? "Sold out"
            : added
              ? "Added ✓"
              : "Add to cart"}
        </span>
        {(!soldOut || customOn) && (
          <span className="tabular-nums text-white/70">
            {formatPrice(customOn ? product.price_cents : unitPrice)}
          </span>
        )}
      </button>

      {!customOn && selected && selected.stock > 0 && selected.stock <= 5 && (
        <p className="mt-3 text-[0.75rem] font-medium text-[#c93400]">
          Only {selected.stock} left in {selected.label}
        </p>
      )}

      <div className="mt-3 flex justify-end">
        <Link href="/cart" className="text-[0.75rem] text-faded hover:text-ink">
          View cart ›
        </Link>
      </div>

      {hasDims && (
        <div className="mt-6">
          <Section title="Size guide">
            <div className="overflow-hidden rounded-lg border border-line">
              <table className="w-full table-fixed border-collapse text-[0.8125rem] tabular-nums [&_tr:first-child>*]:border-t-0 [&_tr>*:first-child]:border-l-0">
                <thead>
                  <tr className="text-left text-faded">
                    <th className="border-b border-l border-t border-line px-3 py-1.5 font-normal">
                      Size
                    </th>
                    <th className="border-b border-l border-t border-line px-3 py-1.5 font-normal">
                      Width (in)
                    </th>
                    <th className="border-b border-l border-t border-line px-3 py-1.5 font-normal">
                      Length (in)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v) => {
                    if (!v.dimensions) return null;
                    const dims = parseDimensions(v.dimensions);
                    return (
                      <tr
                        key={v.id}
                        className={
                          v.id === selectedId ? "font-semibold" : "text-faded"
                        }
                      >
                        <td className="border-l border-t border-line px-3 py-1.5">
                          {v.label}
                        </td>
                        {dims ? (
                          <>
                            <td className="border-l border-t border-line px-3 py-1.5">
                              {dims.width}
                            </td>
                            <td className="border-l border-t border-line px-3 py-1.5">
                              {dims.length}
                            </td>
                          </>
                        ) : (
                          // Not in W × L form: show it as typed.
                          <td
                            className="border-l border-t border-line px-3 py-1.5"
                            colSpan={2}
                          >
                            {v.dimensions}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}
