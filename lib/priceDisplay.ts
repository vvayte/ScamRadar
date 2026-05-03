import type { Currency } from "@/lib/billing";

const SYMBOLS: Record<Currency, string> = { usd: "$", eur: "€", gbp: "£" };

export const PRICE_TABLE: Record<
  "monthly" | "yearly" | "lifetime" | "flash",
  Record<Currency, number>
> = {
  monthly:  { usd: 4.99,  eur: 4.99,  gbp: 4.49 },
  yearly:   { usd: 29.99, eur: 29.99, gbp: 24.99 },
  lifetime: { usd: 59.99, eur: 59.99, gbp: 49.99 },
  flash:    { usd: 3.49,  eur: 3.49,  gbp: 2.99 },
};

/** Format a known plan amount in the right currency symbol + locale price. */
export function priceFor(plan: keyof typeof PRICE_TABLE, currency: Currency): string {
  const value = PRICE_TABLE[plan][currency];
  const sym = SYMBOLS[currency] || "$";
  return `${sym}${value.toFixed(2)}`;
}

export function symbolFor(currency: Currency): string {
  return SYMBOLS[currency] || "$";
}
