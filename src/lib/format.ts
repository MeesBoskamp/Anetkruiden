const euro = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" });

/** Bedragen worden overal in eurocenten bewaard en pas hier getoond. */
export function formatPrice(cents: number) {
  return euro.format(cents / 100);
}
