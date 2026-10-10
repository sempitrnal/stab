"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { compressImage } from "@/lib/compress-image";
import MacSwitch from "@/components/admin/mac-switch";
import Segmented from "@/components/admin/segmented";
import SortablePhotos from "@/components/admin/sortable-photos";
import { saveProduct } from "@/app/admin/(panel)/actions";
import { createClient } from "@/lib/supabase/client";
import { TEE_SIZES } from "@/lib/size-chart";
import type { Product, ProductType } from "@/lib/types";

interface VariantRow {
  id?: string;
  label: string;
  sku: string;
  dimensions: string;
  priceDollars: string;
  stock: string;
}

const blankVariant = (label = "", dimensions = ""): VariantRow => ({
  label,
  sku: "",
  dimensions,
  priceDollars: "",
  stock: "0",
});

// Tee sizes in chart order. A row whose label already matches a size keeps
// its stock, price, SKU and id and just takes the chart's measurements;
// missing sizes are added; any other rows stay after them.
function withTeeSizes(rows: VariantRow[]): VariantRow[] {
  // XXL/XXXL are the same sizes as the chart's 2XL/3XL.
  const key = (s: string) =>
    s.trim().toUpperCase().replace(/^XXXL$/, "3XL").replace(/^XXL$/, "2XL");
  const sized = TEE_SIZES.map(({ label, dimensions }) => {
    const match = rows.find((r) => key(r.label) === key(label));
    return match ? { ...match, dimensions } : blankVariant(label, dimensions);
  });
  const sizeKeys = new Set(TEE_SIZES.map((t) => key(t.label)));
  return [...sized, ...rows.filter((r) => !sizeKeys.has(key(r.label)))];
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// System Settings-style grouped section: small title, then a card of rows.
function Section({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-end justify-between gap-3 px-1">
        <h2 className="text-[13px] font-semibold">{title}</h2>
        {aside}
      </div>
      <div className="mac-card">{children}</div>
    </section>
  );
}

// One labelled row inside a Section card.
function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 border-b border-[var(--mac-sep)] px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:gap-4">
      <div className="shrink-0 sm:w-40">
        <div className="text-[13px]">{label}</div>
        {hint && <div className="text-[11px] text-[var(--mac-secondary)]">{hint}</div>}
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

const TYPES: { value: ProductType; label: string }[] = [
  { value: "apparel", label: "Apparel" },
  { value: "accessory", label: "Accessory" },
  { value: "music", label: "Music" },
];

export default function ProductForm({
  product,
  actions,
}: {
  product?: Product;
  /** Extra buttons for the bottom bar (e.g. Delete on the edit page). */
  actions?: React.ReactNode;
}) {
  const [title, setTitle] = useState(product?.title ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [type, setType] = useState<ProductType>(product?.type ?? "apparel");
  const [priceDollars, setPriceDollars] = useState(
    product ? (product.price_cents / 100).toString() : "",
  );
  const [description, setDescription] = useState(product?.description ?? "");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState(product?.active ?? true);
  const [sortOrder, setSortOrder] = useState(
    (product?.sort_order ?? 0).toString(),
  );
  // New products start with the tee size chart (type defaults to apparel).
  const [variants, setVariants] = useState<VariantRow[]>(() =>
    product
      ? (product.variants ?? []).map((v) => ({
          id: v.id,
          label: v.label,
          sku: v.sku ?? "",
          dimensions: v.dimensions ?? "",
          priceDollars:
            v.price_cents != null ? (v.price_cents / 100).toString() : "",
          stock: v.stock.toString(),
        }))
      : withTeeSizes([]),
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function setVariant(i: number, patch: Partial<VariantRow>) {
    setVariants((prev) =>
      prev.map((v, idx) => (idx === i ? { ...v, ...patch } : v)),
    );
  }

  async function uploadImage(file: File) {
    setUploading(true);
    setError(null);
    const supabase = createClient();
    // 2000px covers the 1200px gallery size on high-DPI screens.
    const { file: body, ext } = await compressImage(file, {
      maxEdge: 2000,
      quality: 0.85,
      type: "image/webp",
    });
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, body, { cacheControl: "31536000" });
    if (error) {
      setError(error.message);
    } else {
      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(path);
      setImages((prev) => [...prev, data.publicUrl]);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function submit() {
    setError(null);
    const price = Math.round(parseFloat(priceDollars) * 100);
    if (!title.trim()) return setError("Title required");
    if (!Number.isFinite(price) || price < 0) return setError("Invalid price");
    if (variants.length === 0) return setError("Add at least one variant");
    if (variants.some((v) => !v.label.trim()))
      return setError("Every variant needs a label");

    startTransition(async () => {
      try {
        await saveProduct({
          id: product?.id,
          slug: slugify(slug || title),
          title: title.trim(),
          description: description.trim() || null,
          type,
          price_cents: price,
          images,
          active,
          sort_order: parseInt(sortOrder) || 0,
          variants: variants.map((v, i) => ({
            id: v.id,
            label: v.label.trim(),
            sku: v.sku.trim() || null,
            dimensions: v.dimensions.trim() || null,
            price_cents: v.priceDollars.trim()
              ? Math.round(parseFloat(v.priceDollars) * 100)
              : null,
            stock: parseInt(v.stock) || 0,
            sort_order: i,
          })),
        });
      } catch (e) {
        // redirect() throws a navigation signal, not a real error
        if ((e as { digest?: string }).digest?.startsWith("NEXT_REDIRECT"))
          return;
        setError(e instanceof Error ? e.message : "Save failed");
      }
    });
  }

  const totalStock = variants.reduce((n, v) => n + (parseInt(v.stock) || 0), 0);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-7">
      <Section title="Details">
        <Row label="Title">
          <input
            className="mac-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Logo Tee"
          />
        </Row>
        <Row label="URL" hint="Leave blank to generate">
          <div className="flex items-center gap-1.5">
            <span className="shrink-0 text-[var(--mac-secondary)]">/product/</span>
            <input
              className="mac-input"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder={slugify(title) || "logo-tee"}
            />
          </div>
        </Row>
        <Row label="Type">
          <Segmented options={TYPES} value={type} onChange={setType} />
        </Row>
        <Row label="Price">
          <div className="relative w-40">
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--mac-secondary)]">
              ₱
            </span>
            <input
              className="mac-input pl-6! tabular-nums"
              value={priceDollars}
              onChange={(e) => setPriceDollars(e.target.value)}
              inputMode="decimal"
              placeholder="500"
            />
          </div>
        </Row>
        <Row label="Sort order" hint="Lower shows first">
          <input
            className="mac-input w-24! tabular-nums"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            inputMode="numeric"
          />
        </Row>
        <Row label="Visible in store">
          <MacSwitch checked={active} onChange={setActive} label="Visible in store" />
        </Row>
      </Section>

      <Section title="Description">
        <div className="p-3">
          <textarea
            className="mac-input h-auto! min-h-28 py-2! leading-relaxed"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Heavyweight cotton. Front print."
          />
        </div>
      </Section>

      <Section
        title="Photos"
        aside={
          <span className="text-[12px] text-[var(--mac-secondary)]">
            Drag to reorder · first photo is the cover
          </span>
        }
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            files.forEach(uploadImage);
          }}
        />
        <SortablePhotos images={images} onChange={setImages}>
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-[10px] border border-dashed border-[rgb(0_0_0/0.18)] text-[var(--mac-secondary)] transition-colors hover:border-[var(--mac-accent)] hover:text-[var(--mac-accent)] disabled:opacity-50"
          >
            <span className="text-[20px] leading-none">{uploading ? "…" : "+"}</span>
            <span className="text-[11px] font-medium">
              {uploading ? "Uploading" : "Add photos"}
            </span>
          </button>
        </SortablePhotos>
      </Section>

      <Section
        title="Sizes & stock"
        aside={
          <div className="flex items-center gap-2">
            <span className="hidden text-[12px] text-[var(--mac-secondary)] sm:inline">
              {totalStock} in stock
            </span>
            <button type="button" onClick={() => setVariants(withTeeSizes)} className="mac-btn">
              Use tee sizes
            </button>
            <button
              type="button"
              onClick={() => setVariants((prev) => [...prev, blankVariant()])}
              className="mac-btn"
            >
              + Add
            </button>
          </div>
        }
      >
        <div className="hidden grid-cols-[1fr_8rem_4.5rem_6rem_6rem_1.5rem] gap-2 border-b border-[var(--mac-sep)] px-4 py-2 mac-label sm:grid">
          <span>Size</span>
          <span>Measurements</span>
          <span>Stock</span>
          <span>Price override</span>
          <span>SKU</span>
          <span />
        </div>
        {variants.map((v, i) => (
          <div
            key={i}
            className="relative grid grid-cols-2 gap-2 border-b border-[var(--mac-sep)] px-4 py-3 pr-11 last:border-b-0 sm:grid-cols-[1fr_8rem_4.5rem_6rem_6rem_1.5rem] sm:items-center sm:py-2 sm:pr-4"
          >
            <label className="col-span-2 sm:col-span-1">
              <span className="mb-1 block mac-label sm:hidden">Size</span>
              <input
                className="mac-input"
                value={v.label}
                onChange={(e) => setVariant(i, { label: e.target.value })}
                placeholder="S, OS, Black LP"
              />
            </label>
            <label>
              <span className="mb-1 block mac-label sm:hidden">Measurements</span>
              <input
                className="mac-input"
                value={v.dimensions}
                onChange={(e) => setVariant(i, { dimensions: e.target.value })}
                placeholder='W20" × L27"'
              />
            </label>
            <label>
              <span className="mb-1 block mac-label sm:hidden">Stock</span>
              <input
                className="mac-input tabular-nums"
                value={v.stock}
                onChange={(e) => setVariant(i, { stock: e.target.value })}
                inputMode="numeric"
              />
            </label>
            <label>
              <span className="mb-1 block mac-label sm:hidden">Price override</span>
              <input
                className="mac-input tabular-nums"
                value={v.priceDollars}
                onChange={(e) => setVariant(i, { priceDollars: e.target.value })}
                inputMode="decimal"
                placeholder="₱"
              />
            </label>
            <label>
              <span className="mb-1 block mac-label sm:hidden">SKU</span>
              <input
                className="mac-input"
                value={v.sku}
                onChange={(e) => setVariant(i, { sku: e.target.value })}
              />
            </label>
            <button
              type="button"
              aria-label={`Remove ${v.label || "variant"}`}
              onClick={() => setVariants((prev) => prev.filter((_, idx) => idx !== i))}
              className="absolute right-4 top-3 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#ff3b30] text-[13px] font-semibold leading-none text-white shadow-[inset_0_0.5px_0_rgb(255_255_255/0.3)] transition-[filter] hover:brightness-110 sm:static"
            >
              −
            </button>
          </div>
        ))}
        {variants.length === 0 && (
          <p className="px-4 py-6 text-center text-[var(--mac-secondary)]">
            No sizes yet. Add one, or use “OS” for one-size.
          </p>
        )}
      </Section>

      <div className="sticky bottom-4 z-10">
        <div className="flex flex-wrap items-center gap-2 rounded-[12px] bg-white/80 px-3 py-2.5 shadow-[0_0_0_0.5px_rgb(0_0_0/0.1),0_8px_24px_rgb(0_0_0/0.10)] backdrop-blur-xl backdrop-saturate-150">
          {error ? (
            <p className="min-w-0 flex-1 truncate px-1 text-[12px] text-[#d70015]">{error}</p>
          ) : (
            <span className="flex-1" />
          )}
          {actions}
          <Link href="/admin" className="mac-btn">
            Cancel
          </Link>
          <button onClick={submit} disabled={pending} className="mac-btn" data-variant="primary">
            {pending ? "Saving…" : product ? "Save changes" : "Create product"}
          </button>
        </div>
      </div>
    </div>
  );
}
