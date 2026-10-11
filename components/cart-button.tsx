"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";

export default function CartButton() {
  const { count, hydrated } = useCart();
  const pathname = usePathname();
  const inCart = pathname === "/cart" || pathname === "/checkout";

  return (
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
}
