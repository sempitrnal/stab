// Product photos are multiplied into their tile to drop a white backdrop.
// Photos that are already transparent don't need that, and multiplying would
// tint white garments with the tile colour, so these slugs skip the blend.
const TRANSPARENT_PHOTO_SLUGS = new Set(["stab-davis"]);

/** Blend-mode class for a product's photo on its tile. */
export function photoBlend(slug?: string | null) {
  return slug && TRANSPARENT_PHOTO_SLUGS.has(slug)
    ? "bg-blend-normal"
    : "bg-blend-multiply";
}
