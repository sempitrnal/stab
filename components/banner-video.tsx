"use client";

import Link from "next/link";
import HeroVideo from "@/components/hero-video";

const BANNER_VIDEO =
  "https://euwpzielyffgzghvkdla.supabase.co/storage/v1/object/public/stab/stab2.mp4";

// Full-bleed: breaks out of the max-width container to span the viewport. The
// video is stretched to fit. Short on mobile, taller at md, then shorter again
// as the screen widens.
export default function BannerVideo({
  className = "",
}: {
  className?: string;
}) {
  return (
    <Link
      href="/"
      aria-label="STAB, home"
      className={`relative ml-[calc(50%-50vw)] block h-36 w-screen overflow-hidden bg-bone md:h-64 lg:h-56 xl:h-48 ${className}`}
    >
      <HeroVideo
        src={BANNER_VIDEO}
        className="absolute inset-0 h-full w-full object-fill"
      />
    </Link>
  );
}
