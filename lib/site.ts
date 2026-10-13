// Public origin of the site (no trailing slash), or null when unknown. Set
// SITE_URL on a custom domain; on Vercel the production URL is picked up.
export function siteUrl() {
  const explicit = process.env.SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  return vercel ? `https://${vercel}` : null;
}

export const SITE_NAME = "STAB";
export const SITE_DESCRIPTION =
  "STAB merch: tees, caps, tapes and more from hostile youth records.";

// Next.js replaces a parent's openGraph object wholesale rather than merging
// it, so pages spread this in to keep the site-wide fields.
export const OG_BASE = {
  type: "website",
  siteName: SITE_NAME,
  locale: "en_PH",
} as const;
