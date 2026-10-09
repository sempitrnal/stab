import { Suspense } from "react";
import ShopBrowser from "@/components/shop-browser";
import { getProducts } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/configured";

// Statically generated; admin edits and checkout revalidate on demand, the
// timer is a safety net.
export const revalidate = 60;

export default async function Home() {
  const configured = isSupabaseConfigured();
  const products = configured ? await getProducts() : [];

  if (!configured || products.length === 0) {
    return (
      <p className="py-32 text-center tag text-faded">
        {configured
          ? "No listings yet"
          : "Supabase not configured: fill in .env.local"}
      </p>
    );
  }

  return (
    <Suspense>
      <ShopBrowser products={products}>
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
      </ShopBrowser>
    </Suspense>
  );
}
