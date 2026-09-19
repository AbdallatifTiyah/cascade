import { z } from "zod";
import { PROJECT_STATUSES } from "@/lib/constants";

const statusValues = PROJECT_STATUSES as unknown as [string, ...string[]];

export const projectCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  descriptionEn: z.string().trim().min(1).max(2000),
  descriptionAr: z.string().trim().min(1).max(2000),
  locationId: z.string().min(1),
  landId: z.string().optional().or(z.literal("")),
  status: z.enum(statusValues).default("PLANNING"),
  totalFloors: z.number().int().positive().max(60),
  unitsPerFloor: z.number().int().positive().max(4),
  amenities: z.array(z.string()).default([]),
  coverTheme: z.string().default("slate"),
  estimatedDeliveryDate: z.string().min(1),
  landCostEstimate: z.number().nonnegative(),
  constructionCostEstimate: z.number().nonnegative(),
  otherCostsEstimate: z.number().nonnegative(),
  pricePerSqm: z.number().positive(),
  downPaymentAmount: z.number().positive(),
  durationMonths: z.number().int().positive().max(240),
  serviceFeeRate: z.number().min(0).max(0.2).default(0.015),
  managementFeeRate: z.number().min(0).max(0.2).default(0.01),
  maintenanceFeeRate: z.number().min(0).max(0.2).default(0.005),
  expectedYieldRate: z.number().min(0).max(0.3).default(0.07),
});
export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
