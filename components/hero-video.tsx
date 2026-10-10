"use client";

import { useEffect, useRef } from "react";

// Background-style looping video. React doesn't reliably emit the `muted`
// attribute in server HTML, and Safari only autoplays when it's present, so
// it's set on the element directly before play() is called.
export default function HeroVideo({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.play().catch(() => {});

    // Safari pauses it on tab switches / Low Power Mode; resume when possible.
    const resume = () => {
      if (video.paused) video.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", resume);
    return () => document.removeEventListener("visibilitychange", resume);
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      disableRemotePlayback
      controlsList="nodownload nofullscreen noremoteplayback"
      tabIndex={-1}
      aria-hidden="true"
      className={`pointer-events-none ${className ?? ""}`}
    />
  );
}
