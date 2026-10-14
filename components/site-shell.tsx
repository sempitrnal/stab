"use client";

import { usePathname } from "next/navigation";
import SiteHeader from "@/components/site-header";

// Page container: centered with gutters for the shop; admin runs full-bleed
// with no header or footer (it has its own window chrome).
export default function SiteShell({
  footer,
  children,
}: {
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const admin = usePathname().startsWith("/admin");

  if (admin) return <main className="flex-1">{children}</main>;

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 flex-1 flex flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      {footer}
    </div>
  );
}
