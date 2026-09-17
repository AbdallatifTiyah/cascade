import type { MatchWeights } from "./types";

// Percentages from the product spec, expressed as fractions summing to 1.
// Stored/overridable via MatchingConfiguration in the database — this is
// only the fallback used when no active configuration exists yet.
export const DEFAULT_WEIGHTS: MatchWeights = {
  location: 0.25,
  monthly: 0.25,
  initial: 0.15,
  size: 0.1,
  bedrooms: 0.1,
  timeline: 0.05,
  duration: 0.05,
  amenities: 0.05,
};

export const WEIGHT_LABELS: Record<keyof MatchWeights, string> = {
  location: "Location",
  monthly: "Monthly affordability",
  initial: "Initial payment",
  size: "Apartment size",
  bedrooms: "Bedrooms",
  timeline: "Delivery timeline",
  duration: "Payment duration",
  amenities: "Amenities",
};

export function normalizeWeights(weights: Partial<MatchWeights>): MatchWeights {
  const merged: MatchWeights = { ...DEFAULT_WEIGHTS, ...weights };
  const total = Object.values(merged).reduce((sum, w) => sum + w, 0);
  if (total <= 0) return DEFAULT_WEIGHTS;
  const normalized = {} as MatchWeights;
  (Object.keys(merged) as (keyof MatchWeights)[]).forEach((key) => {
    normalized[key] = merged[key] / total;
  });
  return normalized;
}
