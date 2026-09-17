import { db } from "@/lib/db";
import { midpoint } from "@/lib/finance";
import { TIMELINE_OPTIONS, timelineLabel } from "@/lib/constants";
import type { Prisma } from "@prisma/client";

export interface DemandFilters {
  locationId?: string;
  bedrooms?: string;
  minBudget?: number;
  maxBudget?: number;
  minSize?: number;
  maxSize?: number;
  timeline?: string;
}

export interface DemandSegmentStats {
  userCount: number;
  avgMonthlyBudget: number;
  avgDownPayment: number;
  avgSize: number;
  avgDurationYears: number;
  preferredTimeline: string;
  preferredTimelineLabel: string;
  topAmenities: { key: string; count: number }[];
}

export async function getDemandSegment(filters: DemandFilters): Promise<DemandSegmentStats> {
  const where: Prisma.PropertyPreferenceWhereInput = {};

  if (filters.locationId) {
    where.locations = { some: { locationId: filters.locationId } };
  }
  if (filters.bedrooms) {
    where.bedrooms = filters.bedrooms;
  }
  if (filters.timeline) {
    where.timeline = filters.timeline;
  }
  if (filters.minBudget !== undefined) {
    where.monthlyMax = { gte: filters.minBudget };
  }
  if (filters.maxBudget !== undefined) {
    where.monthlyMin = { lte: filters.maxBudget };
  }
  if (filters.minSize !== undefined) {
    where.maxSize = { gte: filters.minSize };
  }
  if (filters.maxSize !== undefined) {
    where.minSize = { lte: filters.maxSize };
  }

  const preferences = await db.propertyPreference.findMany({ where });

  const userCount = preferences.length;
  if (userCount === 0) {
    return {
      userCount: 0,
      avgMonthlyBudget: 0,
      avgDownPayment: 0,
      avgSize: 0,
      avgDurationYears: 0,
      preferredTimeline: "FLEXIBLE",
      preferredTimelineLabel: timelineLabel("FLEXIBLE"),
      topAmenities: [],
    };
  }

  const sum = (fn: (p: (typeof preferences)[number]) => number) =>
    preferences.reduce((acc, p) => acc + fn(p), 0);

  const avgMonthlyBudget = sum((p) => midpoint(p.monthlyMin, p.monthlyMax)) / userCount;
  const avgDownPayment = sum((p) => midpoint(p.downPaymentMin, p.downPaymentMax)) / userCount;
  const avgSize = sum((p) => midpoint(p.minSize, p.maxSize)) / userCount;
  const avgDurationYears = sum((p) => midpoint(p.durationMinYears, p.durationMaxYears)) / userCount;

  const timelineCounts = new Map<string, number>();
  const amenityCounts = new Map<string, number>();
  for (const p of preferences) {
    timelineCounts.set(p.timeline, (timelineCounts.get(p.timeline) ?? 0) + 1);
    const amenities: string[] = JSON.parse(p.amenities || "[]");
    for (const a of amenities) amenityCounts.set(a, (amenityCounts.get(a) ?? 0) + 1);
  }

  const preferredTimeline =
    [...timelineCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ??
    TIMELINE_OPTIONS[0].value;

  const topAmenities = [...amenityCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key, count]) => ({ key, count }));

  return {
    userCount,
    avgMonthlyBudget,
    avgDownPayment,
    avgSize,
    avgDurationYears,
    preferredTimeline,
    preferredTimelineLabel: timelineLabel(preferredTimeline),
    topAmenities,
  };
}

export async function getDemandOverview() {
  const [byLocation, byBedrooms, byTimeline, all] = await Promise.all([
    db.location.findMany({
      include: { _count: { select: { preferences: true } } },
      orderBy: { name: "asc" },
    }),
    db.propertyPreference.groupBy({ by: ["bedrooms"], _count: { bedrooms: true } }),
    db.propertyPreference.groupBy({ by: ["timeline"], _count: { timeline: true } }),
    db.propertyPreference.findMany(),
  ]);

  const budgetBuckets = [
    { label: "< $250", min: 0, max: 250 },
    { label: "$250–350", min: 250, max: 350 },
    { label: "$350–450", min: 350, max: 450 },
    { label: "$450–600", min: 450, max: 600 },
    { label: "$600+", min: 600, max: Infinity },
  ].map((bucket) => ({
    label: bucket.label,
    count: all.filter((p) => {
      const mid = midpoint(p.monthlyMin, p.monthlyMax);
      return mid >= bucket.min && mid < bucket.max;
    }).length,
  }));

  const sizeBuckets = [
    { label: "< 100 m²", min: 0, max: 100 },
    { label: "100–130 m²", min: 100, max: 130 },
    { label: "130–160 m²", min: 130, max: 160 },
    { label: "160–200 m²", min: 160, max: 200 },
    { label: "200+ m²", min: 200, max: Infinity },
  ].map((bucket) => ({
    label: bucket.label,
    count: all.filter((p) => {
      const mid = midpoint(p.minSize, p.maxSize);
      return mid >= bucket.min && mid < bucket.max;
    }).length,
  }));

  return {
    totalUsers: all.length,
    byLocation: byLocation.map((l) => ({ name: l.name, count: l._count.preferences })),
    byBedrooms: byBedrooms.map((b) => ({ bedrooms: b.bedrooms, count: b._count.bedrooms })),
    byTimeline: byTimeline.map((t) => ({ timeline: t.timeline, count: t._count.timeline })),
    budgetBuckets,
    sizeBuckets,
  };
}
