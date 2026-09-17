import type { MatchWeights } from "./types";

type ExplanationSet = { great: string; good: string; fair: string; poor: string };

const EXPLANATIONS: Record<keyof MatchWeights, ExplanationSet> = {
  location: {
    great: "Perfect match — in one of your preferred areas",
    good: "In one of your preferred areas",
    fair: "Near your preferred areas",
    poor: "Not in your preferred areas",
  },
  monthly: {
    great: "Comfortably within your monthly budget",
    good: "Within your monthly budget",
    fair: "Slightly above your monthly budget",
    poor: "Above your monthly budget",
  },
  initial: {
    great: "Comfortably within your down payment range",
    good: "Within your down payment range",
    fair: "Slightly above your down payment range",
    poor: "Above your down payment range",
  },
  size: {
    great: "Very close to your preferred size",
    good: "Within your preferred size range",
    fair: "Somewhat outside your preferred size",
    poor: "Outside your preferred size range",
  },
  bedrooms: {
    great: "Exact match for bedrooms",
    good: "Close to your bedroom preference",
    fair: "One bedroom off your preference",
    poor: "Different from your bedroom preference",
  },
  timeline: {
    great: "Matches your target delivery timeline",
    good: "Close to your target delivery timeline",
    fair: "Somewhat off your target timeline",
    poor: "Far from your target timeline",
  },
  duration: {
    great: "Matches your preferred payment duration",
    good: "Within your preferred payment duration",
    fair: "Slightly outside your preferred duration",
    poor: "Outside your preferred payment duration",
  },
  amenities: {
    great: "Includes all your preferred features",
    good: "Includes most of your preferred features",
    fair: "Includes some of your preferred features",
    poor: "Missing most of your preferred features",
  },
};

export function explain(key: keyof MatchWeights, score: number): string {
  const set = EXPLANATIONS[key];
  if (score >= 90) return set.great;
  if (score >= 70) return set.good;
  if (score >= 40) return set.fair;
  return set.poor;
}
