"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PageBody from "@/components/page-body";
import ProductCard from "@/components/product-card";
import type { Product, ProductType } from "@/lib/types";

const TYPE_LABELS: Record<ProductType, string> = {
  apparel: "Apparel",
  accessory: "Accessories",
  music: "Music",
};

// The type filter lives here (not in the page) so the home page doesn't read
// searchParams and can stay statically rendered.
export default function ShopBrowser({
  products,
  children,
}: {
  products: Product[];
  children?: React.ReactNode;
}) {
  const type = useSearchParams().get("type");

  // Numbers stay tied to the full catalog so they don't shift when filtering.
  const numbered = products.map((product, i) => ({
    product,
    n: String(i + 1).padStart(3, "0"),
  }));
  const types = (Object.keys(TYPE_LABELS) as ProductType[]).filter((t) =>
    products.some((p) => p.type === t),
  );
  const active = types.find((t) => t === type) ?? null;
  const shown = active
    ? numbered.filter(({ product }) => product.type === active)
    : numbered;

  const sections = [
    { href: "/", label: "All", on: active === null },
    ...types.map((t) => ({
      href: `/?type=${t}`,
      label: TYPE_LABELS[t],
      on: active === t,
    })),
  ];

  return (
    <>
      <div className="py-2.5 border-b border-line flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1.5 tag">
        <span>
          Merch · For sale{" "}
          <span className="text-faded">({shown.length})</span>
        </span>
        <span className="hidden lg:inline text-faded">
          Pickup at shows · Ships PH + worldwide · GCash, bank, PayPal
        </span>
        <nav className="flex gap-4 overflow-x-auto">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              scroll={false}
              className={
                s.on
                  ? "text-ink underline underline-offset-4"
                  : "text-faded hover:text-ink"
              }
            >
              {s.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Reads left to right, row by row: 2 columns on phones, up to 4 wide */}
      <PageBody>
        <div className="pt-6 grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-6">
          {shown.map(({ product, n }) => (
            <ProductCard key={product.id} product={product} number={n} />
          ))}
        </div>
        {children}
      </PageBody>
    </>
  );
}
