"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import CartButton from "@/components/cart-button";
import TermLogo from "@/components/term-logo";

const NAV = [
  { key: "F1", label: "SHOP", href: "/" },
  { key: "F2", label: "MUSIC", href: "/#music" },
] as const;

export default function SiteHeader() {
  const pathname = usePathname();
  const inShop = pathname === "/" || pathname.startsWith("/product");

  return (
    <header className="pt-4">
      {/* BBS status bar: node info, function-key nav, cart. */}
      <div className="flex flex-wrap items-stretch justify-between gap-x-4 border border-ink font-vt text-[1.25rem] leading-none uppercase">
        <span className="hidden items-center px-3 py-2 sm:flex">
          STAB BBS v1.3 · NODE 07 · 2400 BAUD
        </span>
        <nav aria-label="Main" className="flex items-stretch">
          {NAV.map((n) => {
            const on = n.label === "SHOP" && inShop;
            return (
              <Link
                key={n.key}
                href={n.href}
                aria-current={on ? "page" : undefined}
                className={`flex min-h-11 items-center px-3 hover:bg-ink hover:text-paper ${
                  on ? "underline underline-offset-4" : ""
                }`}
              >
                [{n.key}] {n.label}
              </Link>
            );
          })}
        </nav>
        <CartButton />
      </div>

      <Link
        href="/"
        aria-label="STAB, home"
        className="glow mt-8 block w-fit text-ink drop-shadow-[0_0_6px_rgb(255_68_56/0.5)]"
      >
        <TermLogo className="h-auto w-[min(100%,34rem)]" />
      </Link>
    </header>
  );
}
