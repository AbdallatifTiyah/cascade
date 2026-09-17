// Central enum-like vocabularies. Kept here (not scattered across
// components) so the database, matching engine, and UI all agree on the
// same set of values, and so Arabic labels can be added later without
// touching business logic.

export const ROLES = ["CUSTOMER", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const PROPERTY_TYPES = [
  { value: "APARTMENT", label: "Apartment" },
  { value: "VILLA", label: "Villa" },
  { value: "INVESTMENT", label: "Investment property" },
] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number]["value"];

export const BEDROOM_OPTIONS = [
  { value: "1", label: "1", numeric: 1 },
  { value: "2", label: "2", numeric: 2 },
  { value: "3", label: "3", numeric: 3 },
  { value: "4_PLUS", label: "4+", numeric: 4 },
] as const;
export type BedroomOption = (typeof BEDROOM_OPTIONS)[number]["value"];

export function bedroomNumeric(value: string): number {
  return BEDROOM_OPTIONS.find((b) => b.value === value)?.numeric ?? 1;
}

export function bedroomLabel(value: string): string {
  return BEDROOM_OPTIONS.find((b) => b.value === value)?.label ?? value;
}

export const TIMELINE_OPTIONS = [
  { value: "ASAP", label: "ASAP", monthsFromNow: 6 },
  { value: "WITHIN_1_YEAR", label: "Within 1 year", monthsFromNow: 12 },
  { value: "Y2_3", label: "2–3 years", monthsFromNow: 30 },
  { value: "Y3_5", label: "3–5 years", monthsFromNow: 48 },
  { value: "FLEXIBLE", label: "Flexible", monthsFromNow: 36 },
] as const;
export type TimelineOption = (typeof TIMELINE_OPTIONS)[number]["value"];

export function timelineLabel(value: string): string {
  return TIMELINE_OPTIONS.find((t) => t.value === value)?.label ?? value;
}

export const AMENITIES = [
  { key: "parking", label: "Parking" },
  { key: "elevator", label: "Elevator" },
  { key: "balcony", label: "Balcony" },
  { key: "master_bedroom", label: "Master bedroom" },
  { key: "storage", label: "Storage" },
  { key: "garden", label: "Garden" },
  { key: "smart_home", label: "Smart home" },
] as const;
export type AmenityKey = (typeof AMENITIES)[number]["key"];

export function amenityLabel(key: string): string {
  return AMENITIES.find((a) => a.key === key)?.label ?? key;
}

export const PROJECT_STATUSES = [
  "DRAFT",
  "PLANNING",
  "FUNDRAISING",
  "LAND_SECURED",
  "CONSTRUCTION",
  "FINISHING",
  "COMPLETED",
  "HANDOVER",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  PLANNING: "Planning",
  FUNDRAISING: "Fundraising",
  LAND_SECURED: "Land secured",
  CONSTRUCTION: "Construction",
  FINISHING: "Finishing",
  COMPLETED: "Completed",
  HANDOVER: "Handover",
};

export const APARTMENT_STATUSES = [
  "AVAILABLE",
  "RESERVED",
  "ALLOCATED",
  "UNAVAILABLE",
  "COMPLETED",
] as const;
export type ApartmentStatus = (typeof APARTMENT_STATUSES)[number];

export const LAND_STATUSES = ["AVAILABLE", "UNDER_REVIEW", "ACQUIRED", "ARCHIVED"] as const;

export const RESERVATION_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED", "EXPIRED"] as const;

export const PAYMENT_STATUSES = ["UPCOMING", "PAID", "OVERDUE"] as const;

export const CONSTRUCTION_STAGE_TEMPLATE = [
  "Project confirmed",
  "Land acquired",
  "Design approved",
  "Construction started",
  "Structure completed",
  "Finishing",
  "Handover",
] as const;

export const LEAD_STATUSES = ["NEW", "INTERESTED", "MATCHED", "RESERVED", "COMPLETED"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const COVER_THEMES = [
  "slate",
  "emerald",
  "amber",
  "indigo",
  "rose",
  "teal",
] as const;
