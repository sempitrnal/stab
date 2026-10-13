import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/data";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = siteUrl() ?? "http://localhost:3000";
  const products = await getProducts();
  return [
    { url: site, changeFrequency: "weekly", priority: 1 },
    ...products.map((p) => ({
      url: `${site}/product/${p.slug}`,
      lastModified: p.created_at,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
