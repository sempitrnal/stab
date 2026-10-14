import type { Metadata } from "next";
import Link from "next/link";
import { CartProvider } from "@/lib/cart";
import SiteShell from "@/components/site-shell";
import {
  DEFAULT_IMAGE,
  DEFAULT_OG_IMAGE,
  OG_BASE,
  SITE_DESCRIPTION,
  SITE_NAME,
  siteUrl,
} from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  // Absolute URLs for og:image and canonical links resolve against this.
  metadataBase: new URL(siteUrl() ?? "http://localhost:3000"),
  title: "STAB",
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    ...OG_BASE,
    title: "STAB",
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "STAB",
    description: SITE_DESCRIPTION,
    images: [DEFAULT_IMAGE],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="mac min-h-full flex flex-col bg-paper text-ink">
        <CartProvider>
          <SiteShell
            footer={
            <footer className="mt-16 border-t border-line py-5 flex flex-wrap gap-x-6 gap-y-2 justify-between text-[0.75rem] text-faded">
              <span>
                © {new Date().getFullYear()} STAB · All rights reserved
              </span>
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
            }
          >
            {children}
          </SiteShell>
        </CartProvider>
      </body>
    </html>
  );
}
