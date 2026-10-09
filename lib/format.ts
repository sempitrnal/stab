export function formatPrice(cents: number) {
  const pesos = cents / 100;
  return `₱${pesos.toLocaleString("en-PH", {
    minimumFractionDigits: Number.isInteger(pesos) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}
