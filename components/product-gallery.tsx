"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import PaperPhoto from "@/components/paper-photo";
import ZoomableImage from "@/components/zoomable-image";

// Product photos one at a time: arrows, thumbnails, arrow keys and swipe to
// switch; the current photo keeps hover/tap zoom.
export default function ProductGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);
  const count = images.length;
  const many = count > 1;
  const go = (step: number) => setIndex((i) => (i + step + count) % count);
  const alt = (i: number) => (i === 0 ? title : `${title} ${i + 1}`);

  return (
    <figure
      className="rounded-lg bg-card p-2.5 focus:outline-none"
      tabIndex={many ? 0 : undefined}
      aria-roledescription={many ? "carousel" : undefined}
      aria-label={many ? `${title} photos` : undefined}
      onKeyDown={(e) => {
        if (!many) return;
        if (e.key === "ArrowLeft") go(-1);
        if (e.key === "ArrowRight") go(1);
      }}
    >
      <div
        className="relative aspect-4/5 rounded-md overflow-hidden bg-bone"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (!many || touchX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        }}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={images[index]}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <ZoomableImage src={images[index]} alt={alt(index)} />
          </motion.div>
        </AnimatePresence>

        {many && (
          <>
            <GalleryArrow side="left" onClick={() => go(-1)} />
            <GalleryArrow side="right" onClick={() => go(1)} />
          </>
        )}
      </div>

      <figcaption className="pt-2.5 px-1 flex justify-between tag text-faded">
        <span>
          Fig. {index + 1} · {title}
        </span>
        {many && (
          <span>
            {index + 1} / {count}
          </span>
        )}
      </figcaption>

      {many && (
        <div className="mt-2.5 grid grid-cols-5 sm:grid-cols-6 gap-2">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index}
              className={`rounded-md transition-opacity ${
                i === index
                  ? "ring-1 ring-ink ring-offset-2 ring-offset-card"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <PaperPhoto
                src={src}
                alt=""
                width={240}
                inset="8%"
                className="w-full aspect-square rounded-md"
              />
            </button>
          ))}
        </div>
      )}
    </figure>
  );
}

function GalleryArrow({
  side,
  onClick,
}: {
  side: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous photo" : "Next photo"}
      className={`absolute top-1/2 -translate-y-1/2 ${
        side === "left" ? "left-2" : "right-2"
      } z-10 w-9 h-9 rounded-full bg-card/85 text-ink flex items-center justify-center hover:bg-card transition-colors`}
    >
      {side === "left" ? "←" : "→"}
    </button>
  );
}
