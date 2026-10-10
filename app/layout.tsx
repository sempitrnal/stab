import type { Metadata } from "next";
import Link from "next/link";
import { CartProvider } from "@/lib/cart";
import SiteHeader from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "STAB",
  description: "STAB · merch",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="mac min-h-full flex flex-col bg-paper text-ink">
        <CartProvider>
          <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 flex-1 flex flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <footer className="mt-16 border-t border-line py-5 flex flex-wrap gap-x-6 gap-y-2 justify-between text-[12px] text-faded">
              <span>© {new Date().getFullYear()} STAB · All rights reserved</span>
              <nav className="flex gap-5">
                <Link href="/#music" className="hover:text-ink">
                  Music
                </Link>
                <Link href="/cart" className="hover:text-ink">
                  Cart
                </Link>
                <Link href="/admin" className="hover:text-ink">
                  Admin
                </Link>
              </nav>
            </footer>
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
