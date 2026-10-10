import { Suspense } from "react";
import ShopBrowser from "@/components/shop-browser";
import { getProducts } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/configured";

// Statically generated; admin edits and checkout revalidate on demand, the
// timer is a safety net.
export const revalidate = 60;

const HERO_VIDEO =
  "https://euwpzielyffgzghvkdla.supabase.co/storage/v1/object/public/stab/stab2.mp4";

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
    <>
      <section className="pt-6">
        {/* Banner within the page gutters; the video is stretched to fit. Short on
            mobile, taller at md, then shorter again as the screen widens. */}
        <div className="relative h-36 overflow-hidden rounded-md bg-bone md:h-64 lg:h-56 xl:h-48">
          <video
            src={HERO_VIDEO}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="STAB"
            className="absolute inset-0 h-full w-full object-fill"
          />
        </div>
      </section>
    <Suspense>
      <ShopBrowser products={products}>
        <section id="music" className="mt-6 scroll-mt-4">
          <div className="pt-10 flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
            <h2 className="text-[22px] font-bold tracking-tight">Music</h2>
            <span className="text-[13px] text-faded">Listen and watch</span>
          </div>
          <div className="pt-6 grid md:grid-cols-2 gap-6">
            <div className="panel p-2.5">
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
            <div className="panel p-2.5">
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
    </>
  );
}
