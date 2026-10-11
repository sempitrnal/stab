// Made-to-measure apparel: the buyer types a width and length in inches. A
// custom size isn't a variant row, so it has no stock; the cart and order
// carry the measurements in the line's label instead.
export interface CustomSize {
  width: number;
  length: number;
}

// Sane garment ranges (inches); the server enforces the same limits.
export const CUSTOM_LIMITS = {
  width: { min: 14, max: 40 },
  length: { min: 18, max: 40 },
} as const;

export function isValidCustomSize(
  c: CustomSize | null | undefined,
): c is CustomSize {
  return (
    !!c &&
    Number.isFinite(c.width) &&
    Number.isFinite(c.length) &&
    c.width >= CUSTOM_LIMITS.width.min &&
    c.width <= CUSTOM_LIMITS.width.max &&
    c.length >= CUSTOM_LIMITS.length.min &&
    c.length <= CUSTOM_LIMITS.length.max
  );
}

// Round to the nearest half inch so lines with near-identical sizes merge.
export const roundHalf = (n: number) => Math.round(n * 2) / 2;

// Same "W20" × L27"" format as the size guide.
export const customLabel = (c: CustomSize) =>
  `Custom · W${c.width}" × L${c.length}"`;

// Cart line key: custom lines have no variant id.
export const customLineId = (productId: string, c: CustomSize) =>
  `custom:${productId}:${c.width}x${c.length}`;
