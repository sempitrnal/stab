// Variants store measurements as one text field (`dimensions`), e.g.
// `W20" × L27"`. The size guide splits that into width and length. Parsing
// is forgiving about spacing, case, the separator (× x X ,) and unit marks, so
// hand-typed values like "w27 x l29" work too. Anything it can't read comes
// back null and the size guide shows the raw text instead.
const DIMENSIONS = /^\s*w\s*(\d+(?:\.\d+)?)\s*(?:"|”|in)?\s*[×xX,/]\s*l\s*(\d+(?:\.\d+)?)\s*(?:"|”|in)?\s*$/i;

export function parseDimensions(
  value: string | null,
): { width: string; length: string } | null {
  const m = value?.match(DIMENSIONS);
  return m ? { width: m[1], length: m[2] } : null;
}
