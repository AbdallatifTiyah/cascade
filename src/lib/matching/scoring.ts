import { bedroomNumeric, TIMELINE_OPTIONS } from "@/lib/constants";

/** Symmetric fit against a [min,max] range: 100 inside it, decaying to 0
 * once you're a full range-width away on either side. */
export function rangeScore(value: number, min: number, max: number): number {
  if (max < min) [min, max] = [max, min];
  if (value >= min && value <= max) return 100;
  const width = Math.max(max - min, 1);
  const distance = value < min ? min - value : value - max;
  return Math.max(0, Math.round(100 - (distance / width) * 100));
}

/** Affordability is asymmetric: cheaper than the budget is still fully
 * affordable, but going over budget is penalized (steeply past +50%). */
export function affordabilityScore(value: number, min: number, max: number): number {
  if (value <= max) return 100;
  const over = (value - max) / Math.max(max, 1);
  return Math.max(0, Math.round(100 - over * 200));
}

export function bedroomScore(userBedroom: string, apartmentBedrooms: number): number {
  const desired = bedroomNumeric(userBedroom);
  if (userBedroom === "4_PLUS") {
    if (apartmentBedrooms >= 4) return 100;
    if (apartmentBedrooms === 3) return 55;
    return 20;
  }
  const diff = Math.abs(apartmentBedrooms - desired);
  if (diff === 0) return 100;
  if (diff === 1) return 55;
  return 20;
}

export function monthsBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
}

export function timelineScore(userTimeline: string, deliveryDate: Date, now = new Date()): number {
  const desired = TIMELINE_OPTIONS.find((t) => t.value === userTimeline)?.monthsFromNow ?? 30;
  const actual = monthsBetween(now, deliveryDate);
  const diff = Math.abs(actual - desired);
  return Math.max(0, Math.round(100 - (diff / 36) * 100));
}

export function amenitiesScore(userAmenities: string[], projectAmenities: string[]): number {
  if (userAmenities.length === 0) return 100;
  const matched = userAmenities.filter((a) => projectAmenities.includes(a)).length;
  return Math.round((matched / userAmenities.length) * 100);
}

export function locationScore(userLocationIds: string[], projectLocationId: string): number {
  if (userLocationIds.length === 0) return 60;
  return userLocationIds.includes(projectLocationId) ? 100 : 15;
}
