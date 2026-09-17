// Project feasibility calculator. Pure function — no I/O — so it can run
// identically from an admin form, a seed script, or a future API.
//
// All outputs are ESTIMATES derived from the inputs provided. Nothing here
// is a guaranteed return; the UI layer is responsible for labeling these
// numbers as estimates (see spec #36).

export interface FeasibilityInput {
  landCost: number;
  constructionCost: number;
  otherCosts: number;
  numApartments: number;
  avgApartmentPrice: number;
  /** Count of users whose demand profile strongly matches this concept (score >= 70). */
  potentialParticipants: number;
}

export interface FeasibilityOutput {
  totalCost: number;
  totalRevenue: number;
  grossMargin: number; // absolute currency
  grossMarginPercent: number;
  costPerUnit: number;
  revenuePerUnit: number;
  requiredParticipants: number;
  potentialParticipants: number;
  demandCoveragePercent: number;
  marginIndicator: "Strong" | "Moderate" | "Weak";
  demandIndicator: "High demand" | "Adequate demand" | "Insufficient demand";
}

export function calculateProjectFeasibility(input: FeasibilityInput): FeasibilityOutput {
  const { landCost, constructionCost, otherCosts, numApartments, avgApartmentPrice, potentialParticipants } = input;

  const totalCost = landCost + constructionCost + otherCosts;
  const totalRevenue = numApartments * avgApartmentPrice;
  const grossMargin = totalRevenue - totalCost;
  const grossMarginPercent = totalRevenue > 0 ? (grossMargin / totalRevenue) * 100 : 0;
  const costPerUnit = numApartments > 0 ? totalCost / numApartments : 0;
  const revenuePerUnit = numApartments > 0 ? totalRevenue / numApartments : 0;
  const requiredParticipants = numApartments;
  const demandCoveragePercent = requiredParticipants > 0 ? (potentialParticipants / requiredParticipants) * 100 : 0;

  const marginIndicator: FeasibilityOutput["marginIndicator"] =
    grossMarginPercent >= 25 ? "Strong" : grossMarginPercent >= 10 ? "Moderate" : "Weak";

  const demandIndicator: FeasibilityOutput["demandIndicator"] =
    demandCoveragePercent >= 150 ? "High demand" : demandCoveragePercent >= 100 ? "Adequate demand" : "Insufficient demand";

  return {
    totalCost,
    totalRevenue,
    grossMargin,
    grossMarginPercent,
    costPerUnit,
    revenuePerUnit,
    requiredParticipants,
    potentialParticipants,
    demandCoveragePercent,
    marginIndicator,
    demandIndicator,
  };
}
