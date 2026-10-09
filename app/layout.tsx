import type { Metadata } from "next";
import Link from "next/link";
import { Newsreader, IBM_Plex_Mono } from "next/font/google";
import { CartProvider } from "@/lib/cart";
import SiteHeader from "@/components/site-header";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const ibmMono = IBM_Plex_Mono({
  variable: "--font-ibm-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "STAB",
  description: "STAB · merch",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${ibmMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-mono text-xs bg-paper text-ink">
        <CartProvider>
          <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 flex-1 flex flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <footer className="mt-12 border-t border-line py-4 flex flex-wrap gap-x-6 gap-y-2 justify-between tag text-faded">
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
