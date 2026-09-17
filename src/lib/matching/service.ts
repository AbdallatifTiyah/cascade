import { db } from "@/lib/db";
import { calculateMatchScore } from "./engine";
import { DEFAULT_WEIGHTS, normalizeWeights } from "./weights";
import type { MatchWeights, ProjectMatchInput, UserMatchProfile } from "./types";

export async function getActiveWeights(): Promise<MatchWeights> {
  const config = await db.matchingConfiguration.findFirst({ where: { isActive: true } });
  if (!config) return DEFAULT_WEIGHTS;
  try {
    return normalizeWeights(JSON.parse(config.weights));
  } catch {
    return DEFAULT_WEIGHTS;
  }
}

export async function buildUserProfile(userId: string): Promise<UserMatchProfile | null> {
  const preference = await db.propertyPreference.findUnique({
    where: { userId },
    include: { locations: true },
  });
  if (!preference) return null;

  return {
    locationIds: preference.locations.map((l) => l.locationId),
    bedrooms: preference.bedrooms,
    minSize: preference.minSize,
    maxSize: preference.maxSize,
    downPaymentMin: preference.downPaymentMin,
    downPaymentMax: preference.downPaymentMax,
    monthlyMin: preference.monthlyMin,
    monthlyMax: preference.monthlyMax,
    durationMinYears: preference.durationMinYears,
    durationMaxYears: preference.durationMaxYears,
    timeline: preference.timeline,
    amenities: JSON.parse(preference.amenities || "[]"),
  };
}

export function toProjectMatchInput(project: {
  id: string;
  locationId: string;
  amenities: string;
  estimatedDeliveryDate: Date;
  apartments: {
    id: string;
    area: number;
    bedrooms: number;
    price: number;
    downPayment: number;
    monthlyPayment: number;
    durationMonths: number;
    status: string;
  }[];
}): ProjectMatchInput {
  return {
    id: project.id,
    locationId: project.locationId,
    amenities: JSON.parse(project.amenities || "[]"),
    estimatedDeliveryDate: project.estimatedDeliveryDate,
    apartments: project.apartments,
  };
}

/** Recommended projects for a customer, scored and explained, persisted for audit. */
export async function getRecommendedProjects(userId: string) {
  const profile = await buildUserProfile(userId);
  if (!profile) return [];

  const weights = await getActiveWeights();
  const projects = await db.project.findMany({
    where: { status: { not: "DRAFT" } },
    include: { apartments: true, location: true },
  });

  const results = await Promise.all(
    projects.map(async (project) => {
      const match = calculateMatchScore(profile, toProjectMatchInput(project), weights);
      await db.matchingResult.upsert({
        where: { userId_projectId: { userId, projectId: project.id } },
        update: {
          overallScore: match.overallScore,
          breakdown: JSON.stringify(match.breakdown),
          weightsUsed: JSON.stringify(match.weightsUsed),
          computedAt: new Date(),
        },
        create: {
          userId,
          projectId: project.id,
          overallScore: match.overallScore,
          breakdown: JSON.stringify(match.breakdown),
          weightsUsed: JSON.stringify(match.weightsUsed),
        },
      });
      return { project, match };
    })
  );

  return results.sort((a, b) => b.match.overallScore - a.match.overallScore);
}

export async function getMatchForProject(userId: string, projectId: string) {
  const profile = await buildUserProfile(userId);
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: { apartments: true },
  });
  if (!profile || !project) return null;
  const weights = await getActiveWeights();
  return calculateMatchScore(profile, toProjectMatchInput(project), weights);
}
