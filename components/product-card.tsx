import Link from "next/link";
import ProductMedia from "@/components/product-media";
import { formatPrice } from "@/lib/format";
import type { Product, ProductType } from "@/lib/types";

const TYPE_WORD: Record<ProductType, string> = {
  apparel: "Apparel",
  accessory: "Accessory",
  music: "Music",
};

// One boxed classified ad.
export default function ProductCard({
  product,
  number,
  priority,
}: {
  product: Product;
  number: string;
  priority?: boolean;
}) {
  const variants = product.variants ?? [];
  const soldOut = variants.length > 0 && variants.every((v) => v.stock <= 0);
  const inStock = variants.filter((v) => v.stock > 0).map((v) => v.label);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block break-inside-avoid mb-6 rounded-lg bg-card p-3.5 hover:bg-card-hover transition-colors"
    >
      <div className="flex justify-between gap-3 mb-3 tag">
        <span>
          No. {number} · {TYPE_WORD[product.type]}
        </span>
        <span className={soldOut ? "text-faded" : "text-accent"}>
          {soldOut ? "Sold out" : formatPrice(product.price_cents)}
        </span>
      </div>
      <div className="relative aspect-4/3 rounded-md overflow-hidden bg-bone mb-3">
        <ProductMedia
          title={product.title}
          image={product.images[0] ?? null}
          priority={priority}
        />
      </div>
      <h3 className="font-serif italic text-xl leading-tight">
        {product.title}
      </h3>
      <p className="mt-1 font-serif text-[13px] leading-snug text-ink/75 line-clamp-3">
        {product.description ||
          "Official STAB merch. Pick it up at a show or have it shipped."}
      </p>
      {inStock.length > 1 && (
        <p className="mt-1.5 text-faded">In stock: {inStock.join(" · ")}</p>
      )}
      <p className="mt-2 tag group-hover:text-accent">
        {soldOut ? "→ See listing" : "→ Add to cart"}
      </p>
    </Link>
  );
}
