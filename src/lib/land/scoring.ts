// Pure scoring functions for land-to-demand matching (spec #35, #57).
// Kept explainable: the final score is a documented weighted composite of
// named components, never an opaque number.

export interface LandTargetProfile {
  potentialApartments: number;
  targetSizeMin: number;
  targetSizeMax: number;
  estimatedMonthlyPayment: number;
}

export interface DemandUserSlice {
  locationMatches: boolean;
  minSize: number;
  maxSize: number;
  monthlyMax: number;
}

export interface LandDemandComponents {
  coverage: number;
  locationPopularity: number;
  sizeFit: number;
  affordability: number;
}

export interface LandDemandResult {
  score: number;
  components: LandDemandComponents;
  potentialUsers: number;
  totalLocationUsers: number;
  status: "High demand" | "Moderate demand" | "Low demand";
}

const WEIGHTS = { coverage: 0.35, locationPopularity: 0.25, sizeFit: 0.2, affordability: 0.2 };

function overlaps(aMin: number, aMax: number, bMin: number, bMax: number): boolean {
  return aMin <= bMax && aMax >= bMin;
}

export function scoreLandDemand(target: LandTargetProfile, users: DemandUserSlice[]): LandDemandResult {
  const locationUsers = users.filter((u) => u.locationMatches);
  const totalLocationUsers = locationUsers.length;

  const potentialUsers = locationUsers.filter(
    (u) =>
      overlaps(u.minSize, u.maxSize, target.targetSizeMin, target.targetSizeMax) &&
      u.monthlyMax >= target.estimatedMonthlyPayment * 0.85
  ).length;

  const coverage = Math.min(100, target.potentialApartments > 0 ? (potentialUsers / target.potentialApartments) * 20 : 0);
  const locationPopularity = Math.min(100, (totalLocationUsers / 30) * 100);
  const sizeFit =
    totalLocationUsers > 0
      ? (locationUsers.filter((u) => overlaps(u.minSize, u.maxSize, target.targetSizeMin, target.targetSizeMax)).length /
          totalLocationUsers) *
        100
      : 0;
  const affordability =
    totalLocationUsers > 0
      ? (locationUsers.filter((u) => u.monthlyMax >= target.estimatedMonthlyPayment * 0.85).length / totalLocationUsers) * 100
      : 0;

  const score = Math.round(
    coverage * WEIGHTS.coverage +
      locationPopularity * WEIGHTS.locationPopularity +
      sizeFit * WEIGHTS.sizeFit +
      affordability * WEIGHTS.affordability
  );

  const status: LandDemandResult["status"] = score >= 80 ? "High demand" : score >= 50 ? "Moderate demand" : "Low demand";

  return {
    score,
    components: { coverage, locationPopularity, sizeFit, affordability },
    potentialUsers,
    totalLocationUsers,
    status,
  };
}
