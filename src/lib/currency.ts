// Centralized currency formatting. Swapping the app's currency later means
// changing NEXT_PUBLIC_DEFAULT_CURRENCY, not hunting for "$" across components.

const CURRENCY = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "USD";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: CURRENCY,
  maximumFractionDigits: 0,
});

const preciseFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: CURRENCY,
  maximumFractionDigits: 2,
});

export function formatCurrency(amount: number, precise = false): string {
  if (!Number.isFinite(amount)) return "—";
  return (precise ? preciseFormatter : formatter).format(amount);
}

export function formatCompactCurrency(amount: number): string {
  if (!Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: CURRENCY,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatPercent(value: number, digits = 0): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(digits)}%`;
}
