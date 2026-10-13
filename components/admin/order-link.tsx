"use client";

import Link, { useLinkStatus } from "next/link";

// Shown inside the Link while its navigation is pending: dims the row and
// spins a small ring at the right edge. Absolutely positioned so nothing in
// the row shifts.
function Pending() {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute inset-0 flex items-center justify-end bg-paper/60 pr-3 transition-opacity duration-150 ${
        pending ? "opacity-100" : "opacity-0"
      }`}
    >
      <span className="size-4 rounded-full border-2 border-ink/20 border-t-ink motion-safe:animate-spin" />
    </span>
  );
}

// Order row link with click feedback: the row presses in the instant it's
// tapped (active state), then shows a spinner until the order page is ready.
export default function OrderLink({
  href,
  className = "",
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`relative transition-[background-color,transform] duration-100 active:bg-bone active:scale-[0.99] ${className}`}
    >
      {children}
      <Pending />
    </Link>
  );
}
