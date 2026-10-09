// Tee size chart from the supplier, in cm: [size, length, width].
// Shown on the site in inches, rounded to the nearest half inch.
const TEE_CHART_CM: [label: string, lengthCm: number, widthCm: number][] = [
  ["XS", 68, 47],
  ["S", 71, 52],
  ["M", 73, 56],
  ["L", 76, 58],
  ["XL", 77, 60],
  ["2XL", 79, 64],
  ["3XL", 80, 66],
];

const toInches = (cm: number) => Math.round((cm / 2.54) * 2) / 2;

// Same "W18" × L26"" format the product page and size guide display.
export const TEE_SIZES = TEE_CHART_CM.map(([label, lengthCm, widthCm]) => ({
  label,
  dimensions: `W${toInches(widthCm)}" × L${toInches(lengthCm)}"`,
}));
