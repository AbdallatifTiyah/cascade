import { z } from "zod";
import { APARTMENT_STATUSES } from "@/lib/constants";

const apartmentStatusValues = APARTMENT_STATUSES as unknown as [string, ...string[]];

export const apartmentUpdateSchema = z.object({
  price: z.number().positive(),
  downPayment: z.number().nonnegative(),
  monthlyPayment: z.number().nonnegative(),
  durationMonths: z.number().int().positive().max(240),
  status: z.enum(apartmentStatusValues),
  serviceFeeAnnual: z.number().nonnegative(),
  managementFeeAnnual: z.number().nonnegative(),
  maintenanceFeeAnnual: z.number().nonnegative(),
});
export type ApartmentUpdateInput = z.infer<typeof apartmentUpdateSchema>;
