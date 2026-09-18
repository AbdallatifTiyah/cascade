import { z } from "zod";
import { BEDROOM_OPTIONS, PROPERTY_TYPES, TIMELINE_OPTIONS, EMPLOYMENT_STATUSES } from "@/lib/constants";

const bedroomValues = BEDROOM_OPTIONS.map((b) => b.value) as [string, ...string[]];
const propertyTypeValues = PROPERTY_TYPES.map((p) => p.value) as [string, ...string[]];
const timelineValues = TIMELINE_OPTIONS.map((t) => t.value) as [string, ...string[]];
const employmentStatusValues = EMPLOYMENT_STATUSES.map((e) => e.value) as [string, ...string[]];

export const propertyPreferenceSchema = z
  .object({
    locationIds: z.array(z.string()).min(1, "Select at least one location"),
    propertyType: z.enum(propertyTypeValues).default("APARTMENT"),
    bedrooms: z.enum(bedroomValues),
    minSize: z.number().positive(),
    maxSize: z.number().positive(),
    downPaymentMin: z.number().nonnegative(),
    downPaymentMax: z.number().positive(),
    monthlyMin: z.number().nonnegative(),
    monthlyMax: z.number().positive(),
    durationMinYears: z.number().int().min(1).max(30),
    durationMaxYears: z.number().int().min(1).max(30),
    amenities: z.array(z.string()).default([]),
    timeline: z.enum(timelineValues),
    employmentStatus: z.enum(employmentStatusValues),
    jobTitle: z.string().trim().max(120).optional().or(z.literal("")),
    employerName: z.string().trim().max(120).optional().or(z.literal("")),
    industry: z.string().trim().max(120).optional().or(z.literal("")),
    monthlyIncome: z.number().nonnegative().optional(),
    yearsExperience: z.number().int().nonnegative().max(80).optional(),
  })
  .refine((data) => data.maxSize >= data.minSize, {
    message: "Maximum size must be greater than minimum size",
    path: ["maxSize"],
  })
  .refine((data) => data.monthlyMax >= data.monthlyMin, {
    message: "Maximum monthly budget must be greater than minimum",
    path: ["monthlyMax"],
  })
  .refine((data) => data.downPaymentMax >= data.downPaymentMin, {
    message: "Maximum down payment must be greater than minimum",
    path: ["downPaymentMax"],
  })
  .refine((data) => data.durationMaxYears >= data.durationMinYears, {
    message: "Maximum duration must be greater than minimum",
    path: ["durationMaxYears"],
  });

export type PropertyPreferenceInput = z.infer<typeof propertyPreferenceSchema>;
