import Link from "next/link";
import { LinkOverlay, PendingFade } from "@/components/link-pending";
import ProductMedia from "@/components/product-media";
import { formatPrice } from "@/lib/format";
import { fileName, STOCK_LABEL, stockStatus } from "@/lib/term";
import type { Product } from "@/lib/types";

// A product as a file window: title bar with its number and filename, the
// photo on a lit preview tile, then price and stock on the status line.
export default function ProductCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const status = stockStatus(product);
  const soldOut = status === "sold_out";

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col border border-ink bg-paper hover:shadow-[0_0_0_1px_var(--color-ink),0_0_18px_rgb(255_68_56/0.35)]"
    >
      <div className="flex items-center justify-between gap-2 bg-ink px-2 py-1 font-vt text-[1.0625rem] leading-none text-paper sm:text-[1.25rem]">
        <span className="truncate">
          {String(index + 1).padStart(2, "0")} {fileName(product)}
        </span>
        <span aria-hidden className="shrink-0">
          ■
        </span>
      </div>
      <div className="relative aspect-4/5 overflow-hidden bg-well">
        <PendingFade>
          <ProductMedia
            title={product.title}
            image={product.images[0] ?? null}
            hoverImage={product.images[1] ?? null}
            slug={product.slug}
            tile="bg-well"
            inset="6%"
          />
        </PendingFade>
        <LinkOverlay />
      </div>
      <div className="flex items-baseline justify-between gap-2 border-t border-ink px-2 py-1.5 font-vt text-[1.125rem] leading-none sm:text-[1.375rem]">
        <span className={soldOut ? "text-faded line-through" : "text-amber"}>
          {formatPrice(product.price_cents)}
        </span>
        <span
          className={
            status === "ok" ? "text-faded" : soldOut ? "text-faded" : "text-ink"
          }
        >
          {STOCK_LABEL[status]}
        </span>
      </div>
      {product.description && (
        <p className="line-clamp-2 border-t border-line px-2 py-1.5 text-[0.6875rem] leading-snug text-faded sm:text-[0.75rem]">
          &gt; {product.description}
        </p>
      )}
    </Link>
  );
}
