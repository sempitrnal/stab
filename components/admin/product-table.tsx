"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Reorder, useDragControls } from "motion/react";
import { reorderProducts } from "@/app/admin/(panel)/actions";
import ActiveToggle from "@/components/admin/active-toggle";
import Segmented from "@/components/admin/segmented";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

type Filter = "all" | "visible" | "hidden";

const COLS =
  "grid-cols-[1.25rem_2.75rem_1fr_auto] sm:grid-cols-[1.25rem_2.75rem_1fr_7rem_6rem_4rem]";

// Finder-style product list: search, visibility filter, click a row to edit,
// drag the grip to reorder (saved as sort_order, which the shop follows).
export default function ProductTable({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [items, setItems] = useState(products);
  const [prevProducts, setPrevProducts] = useState(products);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [, startTransition] = useTransition();

  // Take fresh server data (e.g. after a visibility toggle).
  if (products !== prevProducts) {
    setPrevProducts(products);
    setItems(products);
  }

  const q = query.trim().toLowerCase();
  const canReorder = filter === "all" && !q;

  const rows = useMemo(
    () =>
      items.filter(
        (p) =>
          (filter === "all" || (filter === "visible") === p.active) &&
          (!q || p.title.toLowerCase().includes(q) || p.type.includes(q)),
      ),
    [items, q, filter],
  );

  const hiddenCount = items.filter((p) => !p.active).length;

  function saveOrder() {
    const ids = items.map((p) => p.id);
    if (ids.join() === products.map((p) => p.id).join()) return;
    setSaveState("saving");
    startTransition(async () => {
      try {
        await reorderProducts(ids);
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 1600);
      } catch {
        setSaveState("error");
        setItems(products);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative w-full sm:w-64">
          <span className="sr-only">Search products</span>
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--mac-secondary)]"
          >
            <circle cx="7" cy="7" r="4.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="mac-input pl-8! rounded-full! bg-[var(--mac-fill)]! border-transparent! focus:bg-white!"
          />
        </label>
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: `All ${items.length}` },
            { value: "visible", label: "Visible" },
            { value: "hidden", label: `Hidden ${hiddenCount}` },
          ]}
        />
        <span className="ml-auto text-[12px] text-[var(--mac-secondary)]" aria-live="polite">
          {saveState === "saving"
            ? "Saving order…"
            : saveState === "saved"
              ? "Order saved"
              : saveState === "error"
                ? "Couldn't save order"
                : canReorder
                  ? "Drag ⠿ to reorder"
                  : "Clear search and filters to reorder"}
        </span>
      </div>

      <div className="mac-card overflow-hidden">
        <div
          className={`hidden sm:grid ${COLS} items-center gap-4 border-b border-[var(--mac-sep)] px-4 py-2 mac-label`}
        >
          <span />
          <span />
          <span>Name</span>
          <span className="text-right">Stock</span>
          <span className="text-right">Price</span>
          <span className="text-right">Visible</span>
        </div>
        <Reorder.Group as="ul" axis="y" values={items} onReorder={setItems}>
          {rows.map((p) => (
            <ProductRow key={p.id} product={p} draggable={canReorder} onDrop={saveOrder} />
          ))}
        </Reorder.Group>
        {rows.length === 0 && (
          <p className="px-4 py-10 text-center text-[var(--mac-secondary)]">
            {items.length === 0
              ? "No products yet. Add one to get started."
              : "No products match."}
          </p>
        )}
      </div>
    </div>
  );
}

function ProductRow({
  product: p,
  draggable,
  onDrop,
}: {
  product: Product;
  draggable: boolean;
  onDrop: () => void;
}) {
  const router = useRouter();
  const controls = useDragControls();
  const variants = p.variants ?? [];
  const stock = variants.reduce((n, v) => n + v.stock, 0);
  const image = p.images?.[0] ?? null;
  const href = `/admin/products/${p.id}`;

  return (
    <Reorder.Item
      as="li"
      value={p}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDrop}
      whileDrag={{
        scale: 1.015,
        boxShadow: "0 12px 30px rgb(0 0 0 / 0.16), 0 0 0 0.5px rgb(0 0 0 / 0.08)",
        borderRadius: 10,
        zIndex: 10,
      }}
      onClick={() => router.push(href)}
      onMouseEnter={() => router.prefetch(href)}
      className={`relative grid ${COLS} cursor-default items-center gap-4 border-b border-[var(--mac-sep)] bg-white px-4 py-2.5 last:border-b-0 transition-colors hover:bg-[#fafafa]`}
    >
      <button
        type="button"
        aria-label={`Drag to reorder ${p.title}`}
        disabled={!draggable}
        onPointerDown={(e) => draggable && controls.start(e)}
        onClick={(e) => e.stopPropagation()}
        className="flex h-8 w-5 touch-none items-center justify-center rounded text-[var(--mac-secondary)] enabled:cursor-grab enabled:hover:text-[var(--mac-text)] enabled:active:cursor-grabbing disabled:opacity-25"
      >
        <svg aria-hidden viewBox="0 0 10 16" className="h-4 w-2.5" fill="currentColor">
          {[3, 8, 13].map((y) => (
            <g key={y}>
              <circle cx="2.5" cy={y} r="1.3" />
              <circle cx="7.5" cy={y} r="1.3" />
            </g>
          ))}
        </svg>
      </button>
      <div
        className={`h-11 w-11 overflow-hidden rounded-[8px] bg-[#f0f0f2] shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.06)] ${
          p.active ? "" : "opacity-45"
        }`}
      >
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            loading="lazy"
            draggable={false}
            className="h-full w-full object-cover mix-blend-multiply"
          />
        )}
      </div>
      <Link href={href} onClick={(e) => e.stopPropagation()} className="min-w-0">
        <span
          className={`block truncate text-[13px] font-medium ${
            p.active ? "" : "text-[var(--mac-secondary)]"
          }`}
        >
          {p.title}
        </span>
        <span className="block truncate text-[12px] text-[var(--mac-secondary)]">
          <span className="capitalize">{p.type}</span>
          {!p.active && " · Hidden"}
          <span className="sm:hidden">
            {" · "}
            {formatPrice(p.price_cents)} · {stock} in stock
          </span>
        </span>
      </Link>
      <span className="hidden text-right tabular-nums sm:block">
        <span className={stock === 0 ? "text-[#d70015]" : ""}>{stock}</span>
        <span className="text-[var(--mac-secondary)]">
          {" "}
          · {variants.length} {variants.length === 1 ? "size" : "sizes"}
        </span>
      </span>
      <span className="hidden text-right tabular-nums sm:block">
        {formatPrice(p.price_cents)}
      </span>
      <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
        <ActiveToggle id={p.id} active={p.active} />
      </div>
    </Reorder.Item>
  );
}
