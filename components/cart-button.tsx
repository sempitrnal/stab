"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";

// [F4] CART:n in the header's status bar.
export default function CartButton() {
  const { count, hydrated } = useCart();
  const pathname = usePathname();
  const inCart = pathname === "/cart" || pathname === "/checkout";

  return (
    <Link
      href="/cart"
      aria-current={inCart ? "page" : undefined}
      className="flex min-h-11 items-center border-l border-ink px-3 font-vt text-[1.25rem] leading-none uppercase text-amber hover:bg-amber hover:text-paper"
    >
      [F4] CART:{hydrated ? count : 0}
    </Link>
  );
}
