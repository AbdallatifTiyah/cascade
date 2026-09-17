import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/api-guards";
import { db } from "@/lib/db";
import { calculateProjectFeasibility } from "@/lib/feasibility/engine";
import { recordAudit } from "@/lib/audit";

const schema = z.object({
  projectId: z.string().optional(),
  landId: z.string().optional(),
  landCost: z.number().nonnegative(),
  constructionCost: z.number().nonnegative(),
  otherCosts: z.number().nonnegative(),
  numApartments: z.number().int().positive(),
  avgApartmentPrice: z.number().positive(),
  potentialParticipants: z.number().int().nonnegative(),
});

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if ("error" in guard) return guard.error;

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const output = calculateProjectFeasibility(parsed.data);

  const saved = await db.projectFeasibility.create({
    data: {
      projectId: parsed.data.projectId || null,
      landId: parsed.data.landId || null,
      landCost: parsed.data.landCost,
      constructionCost: parsed.data.constructionCost,
      otherCosts: parsed.data.otherCosts,
      numApartments: parsed.data.numApartments,
      avgApartmentPrice: parsed.data.avgApartmentPrice,
      totalCost: output.totalCost,
      totalRevenue: output.totalRevenue,
      grossMargin: output.grossMargin,
      costPerUnit: output.costPerUnit,
      revenuePerUnit: output.revenuePerUnit,
      demandCoverage: output.demandCoveragePercent,
      requiredParticipants: output.requiredParticipants,
      potentialParticipants: parsed.data.potentialParticipants,
    },
  });

  await recordAudit({ actorId: guard.user.id, action: "FEASIBILITY_RUN", entityType: "ProjectFeasibility", entityId: saved.id });

  return NextResponse.json({ id: saved.id });
}
