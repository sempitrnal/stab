import Link from "next/link";
import PageBody from "@/components/page-body";
import ProductCard from "@/components/product-card";
import { getProducts } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/configured";
import type { ProductType } from "@/lib/types";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<ProductType, string> = {
  apparel: "Apparel",
  accessory: "Accessories",
  music: "Music",
};

export default async function Home(props: PageProps<"/">) {
  const configured = isSupabaseConfigured();
  const products = configured ? await getProducts() : [];
  const { type } = await props.searchParams;

  if (!configured || products.length === 0) {
    return (
      <p className="py-32 text-center tag text-faded">
        {configured
          ? "No listings yet"
          : "Supabase not configured: fill in .env.local"}
      </p>
    );
  }

  // Numbers stay tied to the full catalog so they don't shift when filtering.
  const numbered = products.map((product, i) => ({
    product,
    n: String(i + 1).padStart(3, "0"),
  }));
  const types = (Object.keys(TYPE_LABELS) as ProductType[]).filter((t) =>
    products.some((p) => p.type === t),
  );
  const active = types.find((t) => t === type) ?? null;
  const shown = active
    ? numbered.filter(({ product }) => product.type === active)
    : numbered;

  const sections = [
    { href: "/", label: "All", on: active === null },
    ...types.map((t) => ({
      href: `/?type=${t}`,
      label: TYPE_LABELS[t],
      on: active === t,
    })),
  ];

  return (
    <>
      <div className="py-2.5 border-b border-line flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1.5 tag">
        <span>
          Merch · For sale{" "}
          <span className="text-faded">({shown.length})</span>
        </span>
        <span className="hidden lg:inline text-faded">
          Pickup at shows · Ships PH + worldwide · GCash, bank, PayPal
        </span>
        <nav className="flex gap-4 overflow-x-auto">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              scroll={false}
              className={
                s.on
                  ? "text-ink underline underline-offset-4"
                  : "text-faded hover:text-ink"
              }
            >
              {s.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Reads left to right, row by row: 1 column on phones, up to 4 wide */}
      <PageBody>
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {shown.map(({ product, n }) => (
            <ProductCard key={product.id} product={product} number={n} />
          ))}
        </div>

        <section id="music" className="mt-6 scroll-mt-4">
          <div className="py-2.5 border-y border-line flex justify-between tag">
            <span>Music · Now playing</span>
            <span className="text-faded">Listen / Watch</span>
          </div>
          <div className="pt-6 grid md:grid-cols-2 gap-6">
            <div className="rounded-lg bg-card p-2.5">
              <iframe
                src="https://open.spotify.com/embed/album/4MnTPaBmEl61zANQDXRdAe?utm_source=generator&theme=0"
                width="100%"
                height="352"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title="STAB on Spotify"
                className="block border-0 w-full rounded-md"
              />
            </div>
            <div className="rounded-lg bg-card p-2.5">
              <div className="relative aspect-video rounded-md overflow-hidden bg-bone">
                <iframe
                  src="https://www.youtube.com/embed/Y140YV3xvAk"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  title="STAB set video"
                  className="absolute inset-0 w-full h-full border-0"
                />
              </div>
            </div>
          </div>
        </section>
      </PageBody>
    </>
  );
}
