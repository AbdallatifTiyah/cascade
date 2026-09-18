// Arabic labels for the enum-like vocabularies in src/lib/constants.ts and
// src/lib/apartments.ts. Kept separate from those files so business logic
// (values, matching math) stays untouched while presentation gets a
// locale-aware layer. Values not found fall back to the English label.
import type { Locale } from "./index";

const propertyType: Record<string, string> = {
  APARTMENT: "شقة",
  VILLA: "فيلا",
  INVESTMENT: "عقار استثماري",
};

const bedrooms: Record<string, string> = {
  "1": "1",
  "2": "2",
  "3": "3",
  "4_PLUS": "+4",
};

const timeline: Record<string, string> = {
  ASAP: "في أقرب وقت",
  WITHIN_1_YEAR: "خلال سنة",
  Y2_3: "2–3 سنوات",
  Y3_5: "3–5 سنوات",
  FLEXIBLE: "مرن",
};

const amenity: Record<string, string> = {
  parking: "موقف سيارات",
  elevator: "مصعد",
  balcony: "شرفة",
  master_bedroom: "غرفة نوم رئيسية",
  storage: "مخزن",
  garden: "حديقة",
  smart_home: "منزل ذكي",
};

const projectStatus: Record<string, string> = {
  DRAFT: "مسودة",
  PLANNING: "تخطيط",
  FUNDRAISING: "تمويل",
  LAND_SECURED: "تملّك الأرض",
  CONSTRUCTION: "قيد الإنشاء",
  FINISHING: "تشطيبات",
  COMPLETED: "مكتمل",
  HANDOVER: "تسليم",
};

const apartmentStatus: Record<string, string> = {
  AVAILABLE: "متاحة",
  RESERVED: "محجوزة",
  ALLOCATED: "مخصصة",
  UNAVAILABLE: "غير متاحة",
  COMPLETED: "مكتملة",
};

const paymentStatus: Record<string, string> = {
  UPCOMING: "قادمة",
  PAID: "مدفوعة",
  OVERDUE: "متأخرة",
};

function pick(map: Record<string, string>, value: string, locale: Locale, fallback: string): string {
  if (locale === "ar") return map[value] ?? fallback;
  return fallback;
}

export function localizedPropertyType(value: string, locale: Locale, fallback: string) {
  return pick(propertyType, value, locale, fallback);
}
export function localizedBedroom(value: string, locale: Locale, fallback: string) {
  return pick(bedrooms, value, locale, fallback);
}
export function localizedTimeline(value: string, locale: Locale, fallback: string) {
  return pick(timeline, value, locale, fallback);
}
export function localizedAmenity(key: string, locale: Locale, fallback: string) {
  return pick(amenity, key, locale, fallback);
}
export function localizedProjectStatus(value: string, locale: Locale, fallback: string) {
  return pick(projectStatus, value, locale, fallback);
}
export function localizedApartmentStatus(value: string, locale: Locale, fallback: string) {
  return pick(apartmentStatus, value, locale, fallback);
}
export function localizedPaymentStatus(value: string, locale: Locale, fallback: string) {
  return pick(paymentStatus, value, locale, fallback);
}
