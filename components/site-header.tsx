"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";
import StabLogo3D from "@/components/stab-logo-3d";
import Segmented from "@/components/admin/segmented";

export default function SiteHeader() {
  const { count, hydrated } = useCart();
  const pathname = usePathname();
  const inShop = pathname === "/" || pathname.startsWith("/product");
  const inCart = pathname === "/cart" || pathname === "/checkout";

  const nav = (
    <nav aria-label="Main">
      <Segmented<"shop" | "music" | "none">
        size="sm"
        value={inShop ? "shop" : "none"}
        options={[
          { value: "shop", label: "Shop", href: "/" },
          { value: "music", label: "Music", href: "/#music" },
        ]}
      />
    </nav>
  );

  const cart = (
    <Link
      href="/cart"
      className="mac-btn"
      aria-current={inCart ? "page" : undefined}
    >
      <svg aria-hidden viewBox="0 0 16 16" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.5 2.5h1.6l1.5 8.2h7l1.4-5.9H4.6" />
        <circle cx="6.4" cy="13.2" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="11.6" cy="13.2" r="0.9" fill="currentColor" stroke="none" />
      </svg>
      Cart
      {hydrated && count > 0 && (
        <span className="ml-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--mac-accent)] px-1.5 text-[11px] font-semibold tabular-nums text-white">
          {count}
        </span>
      )}
    </Link>
  );

  return (
    // Masthead: nav | logo | cart on desktop; logo on top with nav + cart
    // sharing one row underneath on mobile.
    <header className="rule-double grid grid-cols-2 md:grid-cols-[1fr_auto_1fr] items-center pt-1 pb-2 md:py-1">
      <Link
        href="/"
        aria-label="STAB, home"
        className="col-span-2 md:col-span-1 md:col-start-2 md:row-start-1 w-full md:w-auto justify-self-center"
      >
        <StabLogo3D className="h-24 md:w-[30rem] md:h-48" />
      </Link>
      <div className="md:col-start-1 md:row-start-1 flex flex-col gap-1">
        {nav}
        <span className="hidden md:block pl-1 text-[12px] text-faded">
          hostile youth records
        </span>
      </div>
      <div className="md:col-start-3 md:row-start-1 justify-self-end">{cart}</div>
    </header>
  );
}
