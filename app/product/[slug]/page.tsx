import Link from "next/link";
import { notFound } from "next/navigation";
import PageBody from "@/components/page-body";
import ProductGallery from "@/components/product-gallery";
import ProductMedia from "@/components/product-media";
import PurchasePanel from "@/components/purchase-panel";
import { getProductBySlug, getProducts } from "@/lib/data";
import { formatPrice } from "@/lib/format";

// Statically generated; admin edits and checkout revalidate on demand, the
// timer is a safety net.
export const revalidate = 300;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage(props: PageProps<"/product/[slug]">) {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <>
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
            <div className="md:sticky md:top-6 panel p-5 md:p-6">
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
            </div>
          </div>
        </article>
      </PageBody>
    </>
  );
}
