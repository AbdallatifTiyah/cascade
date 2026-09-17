import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/api-guards";
import { db } from "@/lib/db";
import { LEAD_STATUSES } from "@/lib/constants";
import { recordAudit } from "@/lib/audit";

const schema = z.object({ leadStatus: z.enum(LEAD_STATUSES as unknown as [string, ...string[]]) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminApi();
  if ("error" in guard) return guard.error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  await db.user.update({ where: { id }, data: { leadStatus: parsed.data.leadStatus } });
  await recordAudit({ actorId: guard.user.id, action: "LEAD_STATUS_UPDATED", entityType: "User", entityId: id, metadata: parsed.data });

  return NextResponse.json({ ok: true });
}
