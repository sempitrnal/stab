"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import BannerVideo from "@/components/banner-video";
import PageBody from "@/components/page-body";
import ProductCard from "@/components/product-card";
import type { Product, ProductType } from "@/lib/types";

const TYPE_LABELS: Record<ProductType, string> = {
  apparel: "APPAREL",
  accessory: "ACCESSORIES",
  music: "MUSIC",
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

  const types = (Object.keys(TYPE_LABELS) as ProductType[]).filter((t) =>
    products.some((p) => p.type === t),
  );
  const active = types.find((t) => t === type) ?? null;
  const shown = active ? products.filter((p) => p.type === active) : products;

  const sections = [
    { value: "all", label: "ALL", href: "/" },
    ...types.map((t) => ({ value: t, label: TYPE_LABELS[t], href: `/?type=${t}` })),
  ];
  const dir = active ? `C:\\STAB\\MERCH\\${TYPE_LABELS[active]}` : "C:\\STAB\\MERCH";

  return (
    <>
      <div className="pt-5 font-vt text-[1.375rem] leading-[1.25] uppercase">
        <p>CONNECT 2400 — WELCOME TO THE STAB BBS.</p>
        <p>
          HOSTILE YOUTH RECORDS PRESENTS:{" "}
          <span className="text-amber">HARDER_THAN_YOU</span> — GONE STABBIN.
        </p>
        <p>
          PICK A FILE TO BUY IT.
          <span aria-hidden className="cursor-blink">█</span>
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-line pb-3">
        <h1 className="font-vt text-[1.5rem] leading-none text-amber">
          {dir}&gt; DIR <span className="text-faded">/{shown.length} FILE(S)</span>
        </h1>
        <nav
          aria-label="Filter by type"
          className="-mx-1 flex overflow-x-auto font-vt text-[1.25rem] leading-none"
        >
          {sections.map((s) => {
            const on = (active ?? "all") === s.value;
            return (
              <Link
                key={s.value}
                href={s.href}
                scroll={false}
                aria-current={on ? "page" : undefined}
                className={`flex min-h-11 shrink-0 items-center px-2 ${
                  on ? "bg-ink text-paper" : "hover:bg-ink/15"
                }`}
              >
                [{s.label}]
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Reads left to right, row by row: 2 columns on phones, up to 4 wide */}
      <PageBody>
        <div className="pt-6 grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-5">
          {shown.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
        <p className="mt-4 font-vt text-[1.25rem] uppercase text-faded">
          {shown.length} FILE(S) · 0 BYTES FREE IN YOUR WALLET
        </p>
        <div className="pt-10">
          <BannerVideo />
        </div>
        {children}
      </PageBody>
    </>
  );
}
