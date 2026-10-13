import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageBody from "@/components/page-body";
import ProductGallery from "@/components/product-gallery";
import ProductMedia from "@/components/product-media";
import PurchasePanel from "@/components/purchase-panel";
import RevealUp from "@/components/reveal-up";
import { getProductBySlug, getProducts } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import {
  absoluteUrl,
  DEFAULT_IMAGE,
  OG_BASE,
  SITE_DESCRIPTION,
} from "@/lib/site";

// Statically generated; admin edits and checkout revalidate on demand, the
// timer is a safety net.
export const revalidate = 300;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  props: PageProps<"/product/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "STAB · Not found", robots: { index: false } };

  const title = `STAB · ${product.title}`;
  const description =
    product.description?.replace(/\s+/g, " ").trim().slice(0, 200) ||
    `${product.title}. ${SITE_DESCRIPTION}`;
  const images = [
    { url: product.images[0] ?? DEFAULT_IMAGE, alt: product.title },
  ];

  return {
    title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      ...OG_BASE,
      url: `/product/${product.slug}`,
      title,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.map((i) => i.url),
    },
  };
}

export default async function ProductPage(props: PageProps<"/product/[slug]">) {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const variants = product.variants ?? [];
  const inStock = variants.length === 0 || variants.some((v) => v.stock > 0);
  // Structured data for search results (price, availability, photo).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    ...(product.description ? { description: product.description } : {}),
    url: absoluteUrl(`/product/${product.slug}`),
    // Every photo, or the site card when the product has none yet.
    image:
      product.images.length > 0 ? product.images : [absoluteUrl(DEFAULT_IMAGE)],
    brand: { "@type": "Brand", name: "STAB" },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/product/${product.slug}`),
      priceCurrency: "PHP",
      price: (product.price_cents / 100).toFixed(2),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Shop",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: product.title,
        item: absoluteUrl(`/product/${product.slug}`),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([jsonLd, breadcrumbs]).replace(
            /</g,
            "\\u003c",
          ),
        }}
      />
      <nav
        aria-label="Breadcrumb"
        className="pt-6 flex items-center gap-1.5 text-[0.8125rem] text-faded"
      >
        <Link href="/" className="hover:text-ink">
          Shop
        </Link>
        <span aria-hidden>›</span>
        <Link
          href={`/?type=${product.type}`}
          className="capitalize hover:text-ink"
        >
          {product.type}
        </Link>
      </nav>

      <PageBody>
        <article className="pt-5 grid md:grid-cols-[1.15fr_1fr] gap-6 md:gap-10">
          <div className="flex flex-col gap-4">
            {product.images.length > 0 ? (
              <ProductGallery
                images={product.images}
                title={product.title}
                slug={product.slug}
              />
            ) : (
              <div className="panel p-2.5">
                <div className="relative aspect-4/5 rounded-md overflow-hidden bg-well-light">
                  <ProductMedia title={product.title} image={null} />
                </div>
              </div>
            )}
          </div>

          <div>
            <RevealUp className="md:sticky md:top-6 panel -mx-4 rounded-t-[44px] rounded-b-none p-5 md:mx-0 md:rounded-[14px] md:p-6">
              <h1 className="text-[1.75rem] md:text-[1.9rem] font-light sm:font-light  tracking-tight leading-tight">
                {product.title}
              </h1>
              <p className="mt-1 text-[1.1875rem] font-light sm:font-normal tabular-nums text-faded">
                {formatPrice(product.price_cents)}
              </p>
              {product.description && (
                <p className="mt-4 text-[0.675rem] sm:text-[0.875rem] font-light font-stretch-105% leading-relaxed whitespace-pre-line text-faded/95">
                  {product.description}
                </p>
              )}
              <div className="mt-6">
                <PurchasePanel product={product} />
              </div>
            </RevealUp>
          </div>
        </article>
      </PageBody>
    </>
  );
}
