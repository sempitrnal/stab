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
      <div className="py-2.5 border-b border-line flex justify-between gap-4 tag">
        <Link href="/" className="hover:text-accent">
          ← All listings
        </Link>
        <Link href={`/?type=${product.type}`} className="text-faded hover:text-ink">
          For sale · {product.type}
        </Link>
      </div>

      <PageBody>
        <article className="pt-5 grid md:grid-cols-[1.15fr_1fr] gap-6 md:gap-10">
          <div className="flex flex-col gap-4">
            {product.images.length > 0 ? (
              <ProductGallery images={product.images} title={product.title} />
            ) : (
              <div className="rounded-lg bg-card p-2.5">
                <div className="relative aspect-4/5 rounded-md overflow-hidden bg-bone">
                  <ProductMedia title={product.title} image={null} />
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="md:sticky md:top-6 rounded-lg bg-card p-5 md:p-6">
              <h1 className="font-serif italic text-4xl md:text-5xl leading-none">
                {product.title}
              </h1>
              <p className="mt-2 font-serif text-xl text-accent">
                {formatPrice(product.price_cents)}
              </p>
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
