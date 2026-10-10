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
      className="group flex flex-col overflow-hidden rounded-xl bg-card shadow-[0_0_0_0.5px_rgb(0_0_0/0.07),0_1px_3px_rgb(0_0_0/0.05)] transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:bg-card-hover hover:shadow-[0_0_0_0.5px_rgb(0_0_0/0.08),0_10px_24px_rgb(0_0_0/0.08)]"
    >
      <div className="relative aspect-4/3 bg-well">
        <ProductMedia
          title={product.title}
          image={product.images[0] ?? null}
          slug={product.slug}
        />
      </div>
      {/* flex-1: fills the card when the row is taller than this card's text */}
      <div className="flex-1 p-2.5 sm:p-3.5 bg-[#fff]">
        <div className="flex justify-between gap-3 mb-2 sm:mb-3 tag">
          <span className="text-faded tabular-nums">{number}</span>
          <span className={`tabular-nums ${soldOut ? "text-faded" : "text-ink"}`}>
            {soldOut ? "Sold out" : formatPrice(product.price_cents)}
          </span>
        </div>
        <h3 className="text-[15px] sm:text-[17px] font-semibold tracking-tight leading-snug">
          {product.title}
        </h3>
        <p className="mt-1 text-[12px] sm:text-[13px] leading-snug text-faded line-clamp-2 sm:line-clamp-3">
          {product.description ||
            "Official STAB merch. Pick it up at a show or have it shipped."}
        </p>
        {inStock.length > 1 && (
          <></>
          // <p className="mt-1.5 text-faded">In stock: {inStock.join(" · ")}</p>
        )}
        {!soldOut && (
          <p className="mt-2.5 text-[12px] font-medium text-ink/70 group-hover:text-ink transition-colors">Add to cart →</p>
        )}
      </div>
    </Link>
  );
}
