"use client";

import Link from "next/link";
import PageBody from "@/components/page-body";
import PaperPhoto from "@/components/paper-photo";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

export function PageBar({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="pt-6 flex items-baseline gap-2">
      <h1 className="text-[28px] font-bold tracking-tight leading-tight">{title}</h1>
      {meta && <span className="text-[28px] font-semibold tabular-nums text-faded">{meta}</span>}
    </div>
  );
}

export function EmptyState({ line }: { line: string }) {
  return (
    <div className="px-4 py-32 flex flex-col items-center gap-4 text-center">
      <p className="text-[17px] font-semibold">{line}</p>
      <Link href="/" className="mac-btn">
        Back to shop
      </Link>
    </div>
  );
}

export function Thumb({
  src,
  title,
  slug,
  className,
}: {
  src: string | null;
  title: string;
  slug?: string;
  className: string;
}) {
  return (
    <div className={`relative rounded-md bg-well shrink-0 overflow-hidden ${className}`}>
      {src && (
        <PaperPhoto
          src={src}
          alt={title}
          slug={slug}
          width={256}
          inset="4px"
          className="absolute inset-0"
        />
      )}
    </div>
  );
}

export default function CartView() {
  const { items, count, subtotalCents, setQty, remove, hydrated } = useCart();

  if (!hydrated) return <div className="px-4 py-24" />;

  if (items.length === 0) {
    return (
      <>
        <PageBar title="Cart" meta="0" />
        <PageBody>
          <EmptyState line="Your cart is empty" />
        </PageBody>
      </>
    );
  }

  return (
    <>
      <PageBar title="Cart" meta={String(count)} />
      <PageBody>
        <div className="pt-5 grid lg:grid-cols-[1fr_340px] gap-4 lg:gap-6 items-start">
          <ul className="panel p-2 md:p-3">
            {items.map((item, i) => (
              <li
                key={item.variantId}
                className="rounded-md p-2.5 grid grid-cols-[22px_auto_1fr_auto] items-center gap-x-4 hover:bg-paper/60 transition-colors"
              >
                <span className="text-faded self-start">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Thumb src={item.image} title={item.title} slug={item.slug} className="w-16 h-16" />
                <div className="min-w-0 flex flex-col gap-1">
                  <Link
                    href={`/product/${item.slug}`}
                    className="text-[15px] font-semibold tracking-tight leading-tight hover:text-faded truncate"
                  >
                    {item.title}
                  </Link>
                  <span className="text-faded">
                    {item.variantLabel} · {formatPrice(item.unitPriceCents)}
                  </span>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center rounded-md bg-bone overflow-hidden">
                      <button
                        onClick={() => setQty(item.variantId, item.qty - 1)}
                        aria-label="Decrease quantity"
                        className="w-7 h-7 hover:bg-line"
                      >
                        −
                      </button>
                      <span className="w-7 text-center">{item.qty}</span>
                      <button
                        onClick={() => setQty(item.variantId, item.qty + 1)}
                        aria-label="Increase quantity"
                        className="w-7 h-7 hover:bg-line"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => remove(item.variantId)}
                      className="tag text-faded hover:text-accent"
                      aria-label={`Remove ${item.title}`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <span className="self-start">
                  {formatPrice(item.unitPriceCents * item.qty)}
                </span>
              </li>
            ))}
          </ul>

          <div className="lg:sticky lg:top-6 panel p-5">
            <div>
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="py-2 tag text-faded">Subtotal</td>
                    <td className="py-2 text-right">
                      {formatPrice(subtotalCents)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 tag text-faded">Shipping</td>
                    <td className="py-2 text-right text-faded">At checkout</td>
                  </tr>
                </tbody>
              </table>
              <Link
                href="/checkout"
                className="mt-4 btn-primary w-full justify-between"
              >
                <span>Checkout</span>
                <span>{formatPrice(subtotalCents)} →</span>
              </Link>
            </div>
          </div>
        </div>
      </PageBody>
    </>
  );
}
