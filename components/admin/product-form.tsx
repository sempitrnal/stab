"use client";

import { useRef, useState, useTransition } from "react";
import { saveProduct } from "@/app/admin/(panel)/actions";
import { createClient } from "@/lib/supabase/client";
import type { Product, ProductType } from "@/lib/types";

interface VariantRow {
  id?: string;
  label: string;
  sku: string;
  dimensions: string;
  priceDollars: string;
  stock: string;
}

const inputCls =
  "w-full bg-transparent border border-ink/25 px-3 py-2.5 font-mono text-xs tracking-widest placeholder:text-faded focus:outline-none focus:border-ink";
const labelCls =
  "block font-mono text-[10px] uppercase tracking-widest text-faded mb-1.5";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ProductForm({ product }: { product?: Product }) {
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
  const [variants, setVariants] = useState<VariantRow[]>(
    (product?.variants ?? []).map((v) => ({
      id: v.id,
      label: v.label,
      sku: v.sku ?? "",
      dimensions: v.dimensions ?? "",
      priceDollars:
        v.price_cents != null ? (v.price_cents / 100).toString() : "",
      stock: v.stock.toString(),
    })),
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
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, file);
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

  return (
    <div className="flex flex-col gap-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Title</label>
          <input
            className={inputCls}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="LOGO TEE"
          />
        </div>
        <div>
          <label className={labelCls}>Slug (blank = auto)</label>
          <input
            className={inputCls}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={slugify(title) || "logo-tee"}
          />
        </div>
        <div>
          <label className={labelCls}>Type</label>
          <select
            className={inputCls}
            value={type}
            onChange={(e) => setType(e.target.value as ProductType)}
          >
            <option value="apparel">Apparel</option>
            <option value="accessory">Accessory</option>
            <option value="music">Music</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Price (USD)</label>
          <input
            className={inputCls}
            value={priceDollars}
            onChange={(e) => setPriceDollars(e.target.value)}
            inputMode="decimal"
            placeholder="35"
          />
        </div>
        <div>
          <label className={labelCls}>Sort order</label>
          <input
            className={inputCls}
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            inputMode="numeric"
          />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest cursor-pointer">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="accent-ink w-4 h-4"
            />
            Active (visible in store)
          </label>
        </div>
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea
          className={`${inputCls} normal-case min-h-24`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label className={labelCls}>Images</label>
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
        <div className="flex flex-wrap gap-2">
          {images.map((src, i) => (
            <div
              key={src}
              className="relative w-20 h-24 bg-bone border border-ink/15 group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-cover" />
              <span className="absolute bottom-0 left-0 bg-ink/70 text-paper font-mono text-[9px] px-1">
                {i + 1}
              </span>
              <button
                type="button"
                onClick={() =>
                  setImages((prev) => prev.filter((s) => s !== src))
                }
                className="absolute top-0 right-0 bg-ink text-paper font-mono text-[10px] w-4 h-4 leading-none hover:bg-accent"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="w-20 h-24 border border-dashed border-ink/30 font-mono text-[10px] uppercase tracking-widest text-faded hover:border-ink hover:text-ink transition-colors disabled:opacity-50"
          >
            {uploading ? "…" : "+ Add"}
          </button>
        </div>
        <p className="mt-1.5 font-mono text-[9px] uppercase tracking-widest text-faded">
          First image is the cover. Uploads go to the product-images bucket.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="font-mono text-[10px] uppercase tracking-widest text-faded">
            Variants
          </label>
          <button
            type="button"
            onClick={() =>
              setVariants((prev) => [
                ...prev,
                {
                  label: "",
                  sku: "",
                  dimensions: "",
                  priceDollars: "",
                  stock: "0",
                },
              ])
            }
            className="font-mono text-[10px] uppercase tracking-widest hover:text-accent"
          >
            + Add variant
          </button>
        </div>
        <div className="border-t border-ink/15">
          <div className="hidden sm:grid grid-cols-[1fr_7rem_4.5rem_6rem_5rem_2rem] gap-2 py-2 font-mono text-[9px] uppercase tracking-widest text-faded">
            <span>Label</span>
            <span>Dimensions</span>
            <span>Stock</span>
            <span>₱ Override</span>
            <span>SKU</span>
            <span />
          </div>
          {variants.map((v, i) => (
            <div
              key={i}
              className="relative grid grid-cols-2 gap-2 border-b border-ink/15 py-3 pr-8 last:border-b-0 sm:grid-cols-[1fr_7rem_4.5rem_6rem_5rem_2rem] sm:border-0 sm:py-0 sm:pb-2 sm:pr-0"
            >
              <div className="col-span-2 sm:col-span-1">
                <span className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-faded sm:hidden">
                  Label
                </span>
                <input
                  className={inputCls}
                  value={v.label}
                  onChange={(e) => setVariant(i, { label: e.target.value })}
                  placeholder="S / OS / BLACK LP"
                />
              </div>
              <div>
                <span className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-faded sm:hidden">
                  Dimensions
                </span>
                <input
                  className={inputCls}
                  value={v.dimensions}
                  onChange={(e) =>
                    setVariant(i, { dimensions: e.target.value })
                  }
                  placeholder='W20" × L27"'
                />
              </div>
              <div>
                <span className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-faded sm:hidden">
                  Stock
                </span>
                <input
                  className={inputCls}
                  value={v.stock}
                  onChange={(e) => setVariant(i, { stock: e.target.value })}
                  inputMode="numeric"
                />
              </div>
              <div>
                <span className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-faded sm:hidden">
                  ₱ Override
                </span>
                <input
                  className={inputCls}
                  value={v.priceDollars}
                  onChange={(e) =>
                    setVariant(i, { priceDollars: e.target.value })
                  }
                  inputMode="decimal"
                  placeholder="·"
                />
              </div>
              <div>
                <span className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-faded sm:hidden">
                  SKU
                </span>
                <input
                  className={inputCls}
                  value={v.sku}
                  onChange={(e) => setVariant(i, { sku: e.target.value })}
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  setVariants((prev) => prev.filter((_, idx) => idx !== i))
                }
                className="absolute top-3 right-0 font-mono text-sm text-faded hover:text-accent sm:static sm:text-xs"
              >
                ×
              </button>
            </div>
          ))}
          {variants.length === 0 && (
            <p className="py-4 font-mono text-[10px] uppercase tracking-widest text-faded">
              No variants, add at least one (use “OS” for one-size)
            </p>
          )}
        </div>
      </div>

      {error && (
        <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
          {error}
        </p>
      )}

      <button
        onClick={submit}
        disabled={pending}
        className="w-full bg-ink text-paper font-mono text-xs uppercase tracking-widest py-4 hover:bg-accent transition-colors disabled:opacity-50"
      >
        {pending ? "Saving…" : product ? "Save changes" : "Create product"}
      </button>
    </div>
  );
}
