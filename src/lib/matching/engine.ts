import { WEIGHT_LABELS, DEFAULT_WEIGHTS } from "./weights";
import {
  affordabilityScore,
  amenitiesScore,
  bedroomScore,
  locationScore,
  rangeScore,
  timelineScore,
} from "./scoring";
import { explain } from "./explain";
import type {
  ApartmentMatchInput,
  CriterionScore,
  MatchResult,
  MatchWeights,
  ProjectMatchInput,
  UserMatchProfile,
} from "./types";

/**
 * Deterministic, explainable match score between a customer's demand
 * profile and a project. Given the same profile + project + weights, this
 * always returns the same result (see spec requirement #55) — there is no
 * randomness or external state.
 *
 * Apartment-level criteria (monthly, initial payment, size, bedrooms,
 * duration) are scored against whichever *available* apartment in the
 * project best fits the user, since a project offers many unit types and
 * the customer only cares about the best one for them.
 */
export function calculateMatchScore(
  profile: UserMatchProfile,
  project: ProjectMatchInput,
  weights: MatchWeights = DEFAULT_WEIGHTS
): MatchResult {
  const candidates = project.apartments.filter((a) => a.status === "AVAILABLE");
  const pool = candidates.length > 0 ? candidates : project.apartments;

  let bestApartment: ApartmentMatchInput | null = null;
  let bestApartmentFit = -1;
  const apartmentScores = new Map<
    string,
    { monthly: number; initial: number; size: number; bedrooms: number; duration: number }
  >();

  for (const apt of pool) {
    const monthly = affordabilityScore(apt.monthlyPayment, profile.monthlyMin, profile.monthlyMax);
    const initial = affordabilityScore(apt.downPayment, profile.downPaymentMin, profile.downPaymentMax);
    const size = rangeScore(apt.area, profile.minSize, profile.maxSize);
    const bedrooms = bedroomScore(profile.bedrooms, apt.bedrooms);
    const duration = rangeScore(
      apt.durationMonths,
      profile.durationMinYears * 12,
      profile.durationMaxYears * 12
    );
    const fit = monthly * 0.4 + initial * 0.25 + size * 0.15 + bedrooms * 0.15 + duration * 0.05;
    apartmentScores.set(apt.id, { monthly, initial, size, bedrooms, duration });
    if (fit > bestApartmentFit) {
      bestApartmentFit = fit;
      bestApartment = apt;
    }
  }

  const aptScores = bestApartment
    ? apartmentScores.get(bestApartment.id)!
    : { monthly: 0, initial: 0, size: 0, bedrooms: 0, duration: 0 };

  const criteria: { key: keyof MatchWeights; score: number }[] = [
    { key: "location", score: locationScore(profile.locationIds, project.locationId) },
    { key: "monthly", score: aptScores.monthly },
    { key: "initial", score: aptScores.initial },
    { key: "size", score: aptScores.size },
    { key: "bedrooms", score: aptScores.bedrooms },
    { key: "timeline", score: timelineScore(profile.timeline, project.estimatedDeliveryDate) },
    { key: "duration", score: aptScores.duration },
    { key: "amenities", score: amenitiesScore(profile.amenities, project.amenities) },
  ];

  const breakdown: CriterionScore[] = criteria.map(({ key, score }) => ({
    key,
    label: WEIGHT_LABELS[key],
    score,
    weight: weights[key],
    contribution: score * weights[key],
    explanation: explain(key, score),
  }));

  const overallScore = Math.round(breakdown.reduce((sum, c) => sum + c.contribution, 0));

  return {
    overallScore: Math.min(100, Math.max(0, overallScore)),
    breakdown,
    weightsUsed: weights,
    bestApartmentId: bestApartment?.id ?? null,
    computedAt: new Date().toISOString(),
  };
}
