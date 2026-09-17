import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/api-guards";
import { db } from "@/lib/db";
import { recordAudit } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";

const schema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETE"]),
  description: z.string().max(2000).optional().or(z.literal("")),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminApi();
  if ("error" in guard) return guard.error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const stage = await db.constructionStage.update({
    where: { id },
    data: {
      status: parsed.data.status,
      description: parsed.data.description || null,
      actualDate: parsed.data.status !== "PENDING" ? new Date() : null,
    },
    include: { project: { include: { participants: true } } },
  });

  await recordAudit({ actorId: guard.user.id, action: "CONSTRUCTION_STAGE_UPDATED", entityType: "ConstructionStage", entityId: id, metadata: parsed.data });

  if (parsed.data.status !== "PENDING") {
    const participants = await db.projectParticipant.findMany({ where: { projectId: stage.projectId }, select: { userId: true } });
    await Promise.all(
      participants.map((p) =>
        createNotification({
          userId: p.userId,
          type: "CONSTRUCTION_UPDATE",
          title: `${stage.name} — ${stage.project.name}`,
          body: parsed.data.description || `${stage.name} is now ${parsed.data.status.replace("_", " ").toLowerCase()}.`,
        })
      )
    );
  }

  return NextResponse.json({ ok: true });
}
