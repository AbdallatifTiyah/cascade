import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/api-guards";
import { db } from "@/lib/db";
import { projectCreateSchema } from "@/lib/validation/project";
import { generateApartmentPlan } from "@/lib/projects/generate";
import { CONSTRUCTION_STAGE_TEMPLATE } from "@/lib/constants";
import { slugify } from "@/lib/utils";
import { recordAudit } from "@/lib/audit";

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if ("error" in guard) return guard.error;

  const body = await request.json().catch(() => null);
  const parsed = projectCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const data = parsed.data;

  let baseSlug = slugify(data.name);
  let slug = baseSlug;
  let suffix = 1;
  while (await db.project.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  const apartments = generateApartmentPlan({
    totalFloors: data.totalFloors,
    unitsPerFloor: data.unitsPerFloor,
    pricePerSqm: data.pricePerSqm,
    downPaymentAmount: data.downPaymentAmount,
    durationMonths: data.durationMonths,
    serviceFeeRate: data.serviceFeeRate,
    managementFeeRate: data.managementFeeRate,
    maintenanceFeeRate: data.maintenanceFeeRate,
    expectedYieldRate: data.expectedYieldRate,
  });

  const project = await db.project.create({
    data: {
      name: data.name,
      slug,
      descriptionEn: data.descriptionEn,
      descriptionAr: data.descriptionAr,
      locationId: data.locationId,
      landId: data.landId || null,
      status: data.status,
      totalFloors: data.totalFloors,
      totalApartments: apartments.length,
      parkingAvailable: true,
      elevatorAvailable: data.amenities.includes("elevator"),
      amenities: JSON.stringify(data.amenities),
      coverTheme: data.coverTheme,
      estimatedDeliveryDate: new Date(data.estimatedDeliveryDate),
      landCostEstimate: data.landCostEstimate,
      constructionCostEstimate: data.constructionCostEstimate,
      otherCostsEstimate: data.otherCostsEstimate,
      apartments: {
        create: apartments.map((a) => ({ ...a, features: JSON.stringify(a.features) })),
      },
      constructionStages: {
        create: CONSTRUCTION_STAGE_TEMPLATE.map((name, i) => ({ name, sequence: i, status: "PENDING" as const })),
      },
    },
  });

  await recordAudit({ actorId: guard.user.id, action: "PROJECT_CREATED", entityType: "Project", entityId: project.id });

  return NextResponse.json({ id: project.id, slug: project.slug });
}
