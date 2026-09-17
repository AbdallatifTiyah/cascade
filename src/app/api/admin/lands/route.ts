import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/api-guards";
import { db } from "@/lib/db";
import { landSchema } from "@/lib/validation/land";
import { recordAudit } from "@/lib/audit";

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if ("error" in guard) return guard.error;

  const body = await request.json().catch(() => null);
  const parsed = landSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const land = await db.land.create({ data: { ...parsed.data, notes: parsed.data.notes || null } });
  await recordAudit({ actorId: guard.user.id, action: "LAND_CREATED", entityType: "Land", entityId: land.id });

  return NextResponse.json({ id: land.id });
}
