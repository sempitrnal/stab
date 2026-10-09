"use client";

import { useRef, useState } from "react";
import Image from "next/image";

interface Props {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
}

// Hover magnifier: scales the image and tracks transform-origin to the
// cursor. Click toggles for touch devices.
export default function ZoomableImage({ src, alt, sizes, priority }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [zoomed, setZoomed] = useState(false);
  const [locked, setLocked] = useState(false);
  const origin = useRef("50% 50%");

  function track(e: React.MouseEvent) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    origin.current = `${x}% ${y}%`;
    if (ref.current) {
      const img = ref.current.querySelector("img");
      if (img) img.style.transformOrigin = origin.current;
    }
  }

  return (
    <div
      ref={ref}
      className={`absolute inset-0 overflow-hidden ${zoomed || locked ? "cursor-zoom-out" : "cursor-zoom-in"}`}
      onMouseEnter={() => setZoomed(true)}
      onMouseLeave={() => setZoomed(false)}
      onMouseMove={track}
      onClick={() => setLocked((l) => !l)}
      role="img"
      aria-label={alt}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-contain p-[10%] mix-blend-multiply transition-transform duration-200 ease-out"
        style={{
          transform: zoomed || locked ? "scale(2.25)" : "scale(1)",
        }}
      />
    </div>
  );
}
