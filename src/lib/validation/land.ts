import { z } from "zod";
import { LAND_STATUSES } from "@/lib/constants";

const statusValues = LAND_STATUSES as unknown as [string, ...string[]];

export const landSchema = z.object({
  name: z.string().trim().min(1).max(120),
  locationId: z.string().min(1),
  area: z.number().positive(),
  price: z.number().positive(),
  expectedBuildableArea: z.number().positive(),
  allowedFloors: z.number().int().positive(),
  potentialApartments: z.number().int().positive(),
  parkingSpaces: z.number().int().nonnegative().default(0),
  notes: z.string().max(2000).optional().or(z.literal("")),
  status: z.enum(statusValues).default("AVAILABLE"),
});
export type LandInput = z.infer<typeof landSchema>;
