"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

export function PageBar({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="py-2.5 border-b border-line flex justify-between tag">
      <span>{title}</span>
      {meta && <span className="text-faded">{meta}</span>}
    </div>
  );
}

export function EmptyState({ line }: { line: string }) {
  return (
    <div className="px-4 py-32 flex flex-col items-center gap-4 text-center">
      <p className="tag text-faded">{line}</p>
      <Link href="/" className="tag underline underline-offset-4 hover:text-accent">
        Back to shop
      </Link>
    </div>
  );
}

export function Thumb({
  src,
  title,
  className,
}: {
  src: string | null;
  title: string;
  className: string;
}) {
  return (
    <div className={`relative rounded-md bg-bone shrink-0 overflow-hidden ${className}`}>
      {src && (
        <Image
          src={src}
          alt={title}
          fill
          sizes="80px"
          className="object-contain p-1 mix-blend-multiply"
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
        <PageBar title="Cart" meta="[0]" />
        <EmptyState line="Your cart is empty" />
      </>
    );
  }

  return (
    <>
      <PageBar title="Cart" meta={`[${count}]`} />
      <div className="pt-5 grid lg:grid-cols-[1fr_340px] gap-4 lg:gap-6 items-start">
        <ul className="rounded-lg bg-card p-2 md:p-3">
          {items.map((item, i) => (
            <li
              key={item.variantId}
              className="rounded-md p-2.5 grid grid-cols-[22px_auto_1fr_auto] items-center gap-x-4 hover:bg-paper/60 transition-colors"
            >
              <span className="text-faded self-start">
                {String(i + 1).padStart(2, "0")}
              </span>
              <Thumb src={item.image} title={item.title} className="w-16 h-16" />
              <div className="min-w-0 flex flex-col gap-1">
                <Link
                  href={`/product/${item.slug}`}
                  className="font-serif italic text-lg leading-tight hover:text-accent truncate"
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

        <div className="lg:sticky lg:top-6 rounded-lg bg-card p-5">
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
              className="mt-4 h-12 px-4 rounded-md flex items-center justify-between bg-ink text-paper tag hover:bg-accent transition-colors"
            >
              <span>Checkout</span>
              <span>{formatPrice(subtotalCents)} →</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
