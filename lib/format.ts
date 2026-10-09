export function formatPrice(cents: number) {
  const pesos = cents / 100;
  return `₱${pesos.toLocaleString("en-PH", {
    minimumFractionDigits: Number.isInteger(pesos) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

const PH_PREFIX = "+63";

// PH mobile number as "+63 999 616 6666". Accepts typing after the prefix,
// pastes like "09996166666" / "639996166666", and backspacing into the
// prefix (which clears the field so the placeholder shows again).
export function formatPhPhone(input: string): string {
  if (input.length <= PH_PREFIX.length && PH_PREFIX.startsWith(input)) {
    return "";
  }
  let digits: string;
  if (input.startsWith(PH_PREFIX)) {
    digits = input.slice(PH_PREFIX.length).replace(/\D/g, "");
  } else {
    digits = input.replace(/\D/g, "");
    if (digits.startsWith("63")) digits = digits.slice(2);
    else if (digits.startsWith("0")) digits = digits.slice(1);
  }
  digits = digits.slice(0, 10);
  const groups = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6)];
  return [PH_PREFIX, ...groups.filter(Boolean)].join(" ");
}

// True once all 10 digits after +63 are filled in.
export function isCompletePhPhone(formatted: string): boolean {
  return formatted.replace(/\D/g, "").length === 12;
}
