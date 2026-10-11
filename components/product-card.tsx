import Link from "next/link";
import ProductMedia from "@/components/product-media";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

// Photo-first card: the photo on a light tile with a frosted price tag,
// name and a two-line description underneath.
export default function ProductCard({ product }: { product: Product }) {
  const variants = product.variants ?? [];
  const soldOut = variants.length > 0 && variants.every((v) => v.stock <= 0);

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-4/5 overflow-hidden rounded-[14px] bg-paper">
        <ProductMedia
          title={product.title}
          image={product.images[0] ?? null}
          hoverImage={product.images[1] ?? null}
          slug={product.slug}
          tile="bg-paper"
          inset="4%"
        />
        <span
          className={`absolute bottom-2 left-2 rounded-full bg-white/80 px-2.5 py-1 text-[10px]  font-normal sm:font-semibold leading-none tabular-nums shadow-[0_1px_2px_rgb(0_0_0/0.08)] backdrop-blur-md sm:bottom-3 sm:left-3 sm:text-[0.8125rem] ${
            soldOut ? "text-faded" : "text-ink"
          }`}
        >
          {soldOut ? "sold out" : formatPrice(product.price_cents)}
        </span>
      </div>
      <h3 className="mt-2 px-0.5 text-[0.8125rem] font-medium sm:font-semibold leading-snug tracking-tight sm:mt-2.5 sm:text-[0.9375rem]">
        {product.title}
      </h3>
      {product.description && (
        <p className="mt-0.5 line-clamp-2 font-light sm:font-normal px-0.5 text-[0.6875rem] leading-snug text-faded sm:text-[0.75rem]">
          {product.description}
        </p>
      )}
    </Link>
  );
}
