import { db } from "@/lib/db";
import { estimateLandProduct } from "./estimate";
import { scoreLandDemand, type DemandUserSlice } from "./scoring";

export async function getLandDemandMatch(landId: string) {
  const land = await db.land.findUniqueOrThrow({
    where: { id: landId },
    include: { location: true },
  });

  const estimate = estimateLandProduct({
    price: land.price,
    expectedBuildableArea: land.expectedBuildableArea,
    potentialApartments: land.potentialApartments,
  });

  const preferences = await db.propertyPreference.findMany({
    include: { locations: true },
  });

  const slices: DemandUserSlice[] = preferences.map((p) => ({
    locationMatches: p.locations.some((l) => l.locationId === land.locationId),
    minSize: p.minSize,
    maxSize: p.maxSize,
    monthlyMax: p.monthlyMax,
  }));

  const result = scoreLandDemand(
    {
      potentialApartments: land.potentialApartments,
      targetSizeMin: estimate.targetSizeMin,
      targetSizeMax: estimate.targetSizeMax,
      estimatedMonthlyPayment: estimate.estimatedMonthlyPayment,
    },
    slices
  );

  return { land, estimate, result };
}

export async function getAllLandsWithScore() {
  const lands = await db.land.findMany({ include: { location: true }, orderBy: { createdAt: "desc" } });
  const results = await Promise.all(lands.map((l) => getLandDemandMatch(l.id)));
  return results;
}
