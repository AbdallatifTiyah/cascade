import { db } from "@/lib/db";

export async function recordAudit(params: {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  await db.auditLog.create({
    data: {
      actorId: params.actorId ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId ?? null,
      metadata: JSON.stringify(params.metadata ?? {}),
    },
  });
}

export async function trackEvent(params: { userId?: string | null; name: string; metadata?: Record<string, unknown> }) {
  await db.analyticsEvent.create({
    data: {
      userId: params.userId ?? null,
      name: params.name,
      metadata: JSON.stringify(params.metadata ?? {}),
    },
  });
}
