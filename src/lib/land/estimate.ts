import { calculateMonthlyPayment } from "@/lib/finance";

// Baseline planning assumptions used to turn a raw land parcel into an
// estimated apartment product, before any project has been designed.
// These are intentionally simple, named constants (not a black box) and
// can be tuned per-market later.
export const CONSTRUCTION_COST_PER_SQM = 130;
export const OTHER_COSTS_RATIO = 0.08; // permits, design, soft costs, as % of (land+construction)
export const DEFAULT_DOWN_PAYMENT_RATIO = 0.2;
export const DEFAULT_DURATION_MONTHS = 84; // 7 years, matches typical demand duration

export interface LandEstimate {
  avgApartmentSize: number;
  targetSizeMin: number;
  targetSizeMax: number;
  estimatedApartmentPrice: number;
  estimatedDownPayment: number;
  estimatedMonthlyPayment: number;
  estimatedLandCost: number;
  estimatedConstructionCost: number;
  estimatedOtherCosts: number;
}

export function estimateLandProduct(input: {
  price: number;
  expectedBuildableArea: number;
  potentialApartments: number;
}): LandEstimate {
  const { price, expectedBuildableArea, potentialApartments } = input;
  const units = Math.max(potentialApartments, 1);
  const avgApartmentSize = expectedBuildableArea / units;

  const constructionCost = expectedBuildableArea * CONSTRUCTION_COST_PER_SQM;
  const otherCosts = (price + constructionCost) * OTHER_COSTS_RATIO;
  const totalCost = price + constructionCost + otherCosts;

  // Assume a healthy development margin to arrive at an indicative selling price.
  const targetMarginRatio = 0.22;
  const totalRevenue = totalCost / (1 - targetMarginRatio);
  const estimatedApartmentPrice = totalRevenue / units;

  const estimatedDownPayment = estimatedApartmentPrice * DEFAULT_DOWN_PAYMENT_RATIO;
  const { monthlyPaymentDisplay } = calculateMonthlyPayment({
    totalPrice: estimatedApartmentPrice,
    downPayment: estimatedDownPayment,
    durationMonths: DEFAULT_DURATION_MONTHS,
  });

  return {
    avgApartmentSize,
    targetSizeMin: avgApartmentSize * 0.85,
    targetSizeMax: avgApartmentSize * 1.15,
    estimatedApartmentPrice,
    estimatedDownPayment,
    estimatedMonthlyPayment: monthlyPaymentDisplay,
    estimatedLandCost: price,
    estimatedConstructionCost: constructionCost,
    estimatedOtherCosts: otherCosts,
  };
}
