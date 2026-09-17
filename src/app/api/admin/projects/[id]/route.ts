import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/api-guards";
import { db } from "@/lib/db";
import { PROJECT_STATUSES } from "@/lib/constants";
import { recordAudit } from "@/lib/audit";

const schema = z.object({ status: z.enum(PROJECT_STATUSES as unknown as [string, ...string[]]) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminApi();
  if ("error" in guard) return guard.error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  await db.project.update({ where: { id }, data: { status: parsed.data.status } });
  await recordAudit({ actorId: guard.user.id, action: "PROJECT_STATUS_UPDATED", entityType: "Project", entityId: id, metadata: parsed.data });

  return NextResponse.json({ ok: true });
}
