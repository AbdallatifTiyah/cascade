import { db } from "@/lib/db";
import { calculateMatchScore } from "@/lib/matching/engine";
import { getActiveWeights, toProjectMatchInput } from "@/lib/matching/service";
import type { UserMatchProfile } from "@/lib/matching/types";

export interface ProjectDemandCoverage {
  totalApartments: number;
  suitableUsers: number; // score >= 40
  highlyMatchedUsers: number; // score >= 70
  requiredParticipants: number;
  demandCoveragePercent: number;
}

/** Spec #56 — how much real demand exists for a project before building it.
 * Fetches every preference once (not per-user) to keep this fast even with
 * hundreds of demand rows. */
export async function calculateProjectDemandCoverage(projectId: string): Promise<ProjectDemandCoverage> {
  const [project, preferences, weights] = await Promise.all([
    db.project.findUniqueOrThrow({ where: { id: projectId }, include: { apartments: true } }),
    db.propertyPreference.findMany({ include: { locations: true } }),
    getActiveWeights(),
  ]);

  const input = toProjectMatchInput(project);

  let suitableUsers = 0;
  let highlyMatchedUsers = 0;

  for (const p of preferences) {
    const profile: UserMatchProfile = {
      locationIds: p.locations.map((l) => l.locationId),
      bedrooms: p.bedrooms,
      minSize: p.minSize,
      maxSize: p.maxSize,
      downPaymentMin: p.downPaymentMin,
      downPaymentMax: p.downPaymentMax,
      monthlyMin: p.monthlyMin,
      monthlyMax: p.monthlyMax,
      durationMinYears: p.durationMinYears,
      durationMaxYears: p.durationMaxYears,
      timeline: p.timeline,
      amenities: JSON.parse(p.amenities || "[]"),
    };
    const { overallScore } = calculateMatchScore(profile, input, weights);
    if (overallScore >= 70) highlyMatchedUsers++;
    if (overallScore >= 40) suitableUsers++;
  }

  const requiredParticipants = project.totalApartments;
  const demandCoveragePercent = requiredParticipants > 0 ? (highlyMatchedUsers / requiredParticipants) * 100 : 0;

  return {
    totalApartments: project.totalApartments,
    suitableUsers,
    highlyMatchedUsers,
    requiredParticipants,
    demandCoveragePercent,
  };
}
