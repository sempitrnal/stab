"use client";

import { useSearchParams } from "next/navigation";
import PageBody from "@/components/page-body";
import ProductCard from "@/components/product-card";
import Segmented from "@/components/admin/segmented";
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
    { value: "all", label: "All", href: "/" },
    ...types.map((t) => ({ value: t, label: TYPE_LABELS[t], href: `/?type=${t}` })),
  ];

  return (
    <>
      <div className="pt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight leading-tight">
            Shop{" "}
            <span className="text-faded font-semibold tabular-nums">{shown.length}</span>
          </h1>
          <p className="text-[13px] text-faded">
           gone stabbin
          </p>
        </div>
        <nav aria-label="Filter by type" className="max-w-full overflow-x-auto">
          <Segmented value={active ?? "all"} options={sections} scroll={false} />
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

