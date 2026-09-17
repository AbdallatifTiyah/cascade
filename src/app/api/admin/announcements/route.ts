import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/api-guards";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { recordAudit } from "@/lib/audit";

const schema = z.object({
  projectId: z.string().min(1),
  title: z.string().trim().min(1).max(160),
  body: z.string().trim().min(1).max(2000),
});

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if ("error" in guard) return guard.error;

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  const update = await db.projectUpdate.create({ data: parsed.data });
  await recordAudit({ actorId: guard.user.id, action: "ANNOUNCEMENT_CREATED", entityType: "ProjectUpdate", entityId: update.id });

  const participants = await db.projectParticipant.findMany({ where: { projectId: parsed.data.projectId }, select: { userId: true } });
  await Promise.all(
    participants.map((p) =>
      createNotification({ userId: p.userId, type: "ANNOUNCEMENT", title: parsed.data.title, body: parsed.data.body })
    )
  );

  return NextResponse.json({ id: update.id });
}
