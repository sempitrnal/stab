"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";
import HeroVideo from "@/components/hero-video";
import Segmented from "@/components/admin/segmented";

const HEADER_VIDEO =
  "https://euwpzielyffgzghvkdla.supabase.co/storage/v1/object/public/stab/stab2.mp4";

export default function SiteHeader() {
  const { count, hydrated } = useCart();
  const pathname = usePathname();
  const inShop = pathname === "/" || pathname.startsWith("/product");
  const inCart = pathname === "/cart" || pathname === "/checkout";

  const nav = (
    <nav aria-label="Main" className="hidden">
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
      className="mac-btn min-[1920px]:h-[56px] min-[1920px]:gap-[12px] min-[1920px]:rounded-[12px] min-[1920px]:px-[28px] min-[1920px]:text-[1.0625rem]"
      aria-current={inCart ? "page" : undefined}
    >
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="h-[15px] w-[15px] min-[1920px]:h-[28px] min-[1920px]:w-[28px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2.5 2.5h1.6l1.5 8.2h7l1.4-5.9H4.6" />
        <circle cx="6.4" cy="13.2" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="11.6" cy="13.2" r="0.9" fill="currentColor" stroke="none" />
      </svg>
      Cart
      {hydrated && count > 0 && (
        <span className="ml-0.5 inline-flex h-[18px] min-w-[18px] min-[1920px]:h-[30px] min-[1920px]:min-w-[30px] items-center justify-center rounded-full bg-[var(--mac-accent)] px-1.5 text-[0.6875rem] font-semibold tabular-nums text-white">
          {count}
        </span>
      )}
    </Link>
  );

  return (
    // Video banner above the divider; nav and cart share the row below it.
    <header>
      <div className=" pb-2 md:pb-1">
        {/* Full-bleed: breaks out of the max-width container to span the
            viewport. The video is stretched to fit. Short on mobile, taller at
            md, then shorter again as the screen widens. */}
        <Link
          href="/"
          aria-label="STAB, home"
          className="relative ml-[calc(50%-50vw)] block h-36 w-screen overflow-hidden bg-bone md:h-64 lg:h-56 xl:h-48"
        >
          <HeroVideo
            src={HEADER_VIDEO}
            className="absolute inset-0 h-full w-full object-fill"
          />
        </Link>
      </div>
      <div className="flex items-center justify-between gap-4 pt-3">
        <div className="flex items-center gap-3">
          {nav}
          <span className="hidden text-[0.75rem] text-faded md:inline min-[1920px]:hidden">
            hostile youth records
          </span>
        </div>
        {cart}
      </div>
    </header>
  );
}
