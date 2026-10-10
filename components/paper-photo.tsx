import { getImageProps } from "next/image";
import { photoBlend } from "@/lib/photo-tiles";

interface Props {
  src: string;
  alt: string;
  /** Width of the optimized image to request. */
  width: number;
  /** Space between the photo and the tile edge. */
  inset?: string;
  /** Product slug: transparent photos skip the blend (lib/photo-tiles.ts). */
  slug?: string;
  /** Tile background class. */
  tile?: string;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
}

// Product photo printed onto its tile. The photo and the tile colour are
// multiplied inside one element (background-blend-mode), so white photo
// backdrops drop out on every browser, iOS Safari included, even while the
// tile is transformed or filtered. mix-blend-mode is not reliable there.
export default function PaperPhoto({
  src,
  alt,
  width,
  inset = "6%",
  slug,
  tile = "bg-well",
  className = "",
  style,
  ref,
}: Props) {
  const { props } = getImageProps({ src, alt, width, height: width });

  return (
    <div
      ref={ref}
      role="img"
      aria-label={alt}
      className={`${tile} bg-no-repeat bg-center bg-contain bg-origin-content ${photoBlend(slug)} ${className}`}
      style={{ backgroundImage: `url("${props.src}")`, padding: inset, ...style }}
    />
  );
}
