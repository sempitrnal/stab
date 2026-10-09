"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";
import StabLogo3D from "@/components/stab-logo-3d";

export default function SiteHeader() {
  const { count, hydrated } = useCart();
  const pathname = usePathname();
  const inShop = pathname === "/" || pathname.startsWith("/product");
  const inCart = pathname === "/cart" || pathname === "/checkout";

  const nav = (
    <nav className="flex gap-4 tag">
      <Link href="/" className={inShop ? "text-ink" : "text-faded hover:text-ink"}>
        Shop
      </Link>
      <Link href="/#music" className="text-faded hover:text-ink">
        Music
      </Link>
    </nav>
  );

  const cart = (
    <Link
      href="/cart"
      className={`tag ${inCart ? "text-ink" : "text-faded hover:text-ink"}`}
    >
      Cart{" "}
      <span className={hydrated && count > 0 ? "text-accent" : ""}>
        [{hydrated ? count : 0}]
      </span>
    </Link>
  );

  return (
    // Masthead: nav | logo | cart on desktop; logo on top with nav + cart
    // sharing one row underneath on mobile.
    <header className="rule-double grid grid-cols-2 md:grid-cols-[1fr_auto_1fr] items-center pt-1 pb-2 md:py-1">
      <Link
        href="/"
        aria-label="STAB, home"
        className="col-span-2 md:col-span-1 md:col-start-2 md:row-start-1 justify-self-center"
      >
        <StabLogo3D className="w-80 h-36 md:w-[30rem] md:h-48" />
      </Link>
      <div className="md:col-start-1 md:row-start-1 flex flex-col gap-1">
        {nav}
        <span className="hidden md:block tag text-faded">
          hostile youth records
        </span>
      </div>
      <div className="md:col-start-3 md:row-start-1 justify-self-end">{cart}</div>
    </header>
  );
}
