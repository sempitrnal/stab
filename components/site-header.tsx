"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import CartButton from "@/components/cart-button";
import StabLogo3D from "@/components/stab-logo-3d";
import Segmented from "@/components/admin/segmented";

export default function SiteHeader() {
  const pathname = usePathname();
  const inShop = pathname === "/" || pathname.startsWith("/product");

  // Admin has its own window chrome.
  if (pathname.startsWith("/admin")) return null;

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

  return (
    // 3D logo on every page; nav and cart share the row below it.
    <header>
      <div className="flex justify-center pt-6">
        <Link href="/" aria-label="STAB, home" className="w-full md:w-auto">
          <StabLogo3D className="h-28 md:h-56 md:w-[30rem]" />
        </Link>
      </div>
      {/* On the home page the cart lives in the shop row instead. */}
      {pathname !== "/" && (
        <div className="flex items-center justify-between gap-4 pt-3">
          <div className="flex items-center gap-3">
            {nav}
            <span className="hidden text-[0.75rem] text-faded md:inline">
              hostile youth records
            </span>
          </div>
          <CartButton />
        </div>
      )}
    </header>
  );
}
