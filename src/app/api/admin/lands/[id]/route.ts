import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/api-guards";
import { db } from "@/lib/db";
import { landSchema } from "@/lib/validation/land";
import { recordAudit } from "@/lib/audit";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminApi();
  if ("error" in guard) return guard.error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = landSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const land = await db.land.update({ where: { id }, data: parsed.data });
  await recordAudit({ actorId: guard.user.id, action: "LAND_UPDATED", entityType: "Land", entityId: land.id, metadata: parsed.data });

  return NextResponse.json({ ok: true });
}
