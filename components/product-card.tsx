import Link from "next/link";
import ProductMedia from "@/components/product-media";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

// One boxed classified ad.
export default function ProductCard({
  product,
  number,
}: {
  product: Product;
  number: string;
}) {
  const variants = product.variants ?? [];
  const soldOut = variants.length > 0 && variants.every((v) => v.stock <= 0);
  const inStock = variants.filter((v) => v.stock > 0).map((v) => v.label);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block overflow-hidden rounded-lg bg-card hover:bg-card-hover transition-colors"
    >
      <div className="relative aspect-4/3 bg-bone">
        <ProductMedia title={product.title} image={product.images[0] ?? null} />
      </div>
      <div className="p-2.5 sm:p-3.5">
        <div className="flex justify-between gap-3 mb-2 sm:mb-3 tag">
          <span>{number}</span>
          <span className={soldOut ? "text-faded" : "text-accent"}>
            {soldOut ? "Sold out" : formatPrice(product.price_cents)}
          </span>
        </div>
        <h3 className="font-serif italic text-base sm:text-xl leading-tight">
          {product.title}
        </h3>
        <p className="mt-1 font-serif text-xs sm:text-[13px] leading-snug text-ink/75 line-clamp-2 sm:line-clamp-3">
          {product.description ||
            "Official STAB merch. Pick it up at a show or have it shipped."}
        </p>
        {inStock.length > 1 && (
          <></>
          // <p className="mt-1.5 text-faded">In stock: {inStock.join(" · ")}</p>
        )}
        {!soldOut && (
          <p className="mt-2 tag group-hover:text-accent">→ Add to cart</p>
        )}
      </div>
    </Link>
  );
}
