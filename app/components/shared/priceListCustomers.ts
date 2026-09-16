// Deterministic mock "kund" (customer) for a given prislistenr, matching the
// same idx % 5 pattern used to seed the price list table rows in PriceListView.
const PRICE_LIST_KUNDER = ["Martinsons", "Skogmo Bruk", "Hernes", "JäTre", "Moelv Tre"];

export function getPriceListKund(priceListId: string): string {
  const idx = 17611 - Number(priceListId);
  const normalizedIdx = ((idx % PRICE_LIST_KUNDER.length) + PRICE_LIST_KUNDER.length) % PRICE_LIST_KUNDER.length;
  return PRICE_LIST_KUNDER[normalizedIdx];
}
