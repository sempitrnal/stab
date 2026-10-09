"use client";

import { useRef, useState } from "react";
import PaperPhoto from "@/components/paper-photo";

interface Props {
  src: string;
  alt: string;
}

// Hover magnifier: scales the photo tile and tracks transform-origin to the
// cursor. Click toggles for touch devices.
export default function ZoomableImage({ src, alt }: Props) {
  const tile = useRef<HTMLDivElement>(null);
  const [zoomed, setZoomed] = useState(false);
  const [locked, setLocked] = useState(false);

  function track(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    if (tile.current) tile.current.style.transformOrigin = `${x}% ${y}%`;
  }

  return (
    <div
      className={`absolute inset-0 overflow-hidden ${zoomed || locked ? "cursor-zoom-out" : "cursor-zoom-in"}`}
      onMouseEnter={() => setZoomed(true)}
      onMouseLeave={() => setZoomed(false)}
      onMouseMove={track}
      onClick={() => setLocked((l) => !l)}
    >
      <PaperPhoto
        ref={tile}
        src={src}
        alt={alt}
        width={1200}
        inset="10%"
        className="absolute inset-0 transition-transform duration-200 ease-out"
        style={{ transform: zoomed || locked ? "scale(2.25)" : "scale(1)" }}
      />
    </div>
  );
}
