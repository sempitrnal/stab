import type { Metadata } from "next";
import Link from "next/link";
import { IBM_Plex_Mono, Inter, VT323 } from "next/font/google";
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

// Bundled web font so every device renders the same type, instead of each
// platform's system font (Roboto on Android, SF on Apple).
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
// Storefront terminal type: Plex Mono for reading, VT323 for display.
const plex = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-plex",
  display: "swap",
});
const vt = VT323({ subsets: ["latin"], weight: "400", variable: "--font-vt", display: "swap" });

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
    <html lang="en" className={`${inter.variable} ${plex.variable} ${vt.variable} h-full antialiased`}>
      <body className="mac min-h-full flex flex-col bg-paper text-ink">
        <CartProvider>
          <SiteShell
            footer={
            <footer className="mt-16 border-t border-line py-4 flex flex-wrap gap-x-6 gap-y-2 justify-between font-vt text-[1.125rem] uppercase">
              <span>
                (C) {new Date().getFullYear()} STAB · SYSOP: HOSTILE YOUTH
              </span>
              <nav className="flex gap-5">
                <Link href="/#music" className="hover:bg-ink hover:text-paper">
                  [MUSIC]
                </Link>
                <Link href="/cart" className="hover:bg-ink hover:text-paper">
                  [CART]
                </Link>
                <Link href="/admin" className="hover:bg-ink hover:text-paper">
                  [SYSOP]
                </Link>
              </nav>
              <span className="text-faded">NO CARRIER</span>
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
