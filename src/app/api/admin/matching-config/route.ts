import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/api-guards";
import { db } from "@/lib/db";
import { normalizeWeights } from "@/lib/matching/weights";
import { recordAudit } from "@/lib/audit";

const schema = z.object({
  location: z.number().min(0),
  monthly: z.number().min(0),
  initial: z.number().min(0),
  size: z.number().min(0),
  bedrooms: z.number().min(0),
  timeline: z.number().min(0),
  duration: z.number().min(0),
  amenities: z.number().min(0),
});

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if ("error" in guard) return guard.error;

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid weights" }, { status: 400 });

  const normalized = normalizeWeights(parsed.data);

  await db.matchingConfiguration.updateMany({ where: { isActive: true }, data: { isActive: false } });
  const config = await db.matchingConfiguration.create({
    data: { name: `Custom weights ${new Date().toISOString().slice(0, 10)}`, weights: JSON.stringify(normalized), isActive: true },
  });

  await recordAudit({ actorId: guard.user.id, action: "MATCHING_WEIGHTS_UPDATED", entityType: "MatchingConfiguration", entityId: config.id, metadata: { ...normalized } as Record<string, unknown> });

  return NextResponse.json({ ok: true, weights: normalized });
}
