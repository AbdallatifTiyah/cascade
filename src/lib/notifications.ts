import { db } from "@/lib/db";

export type NotificationType =
  | "RESERVATION"
  | "PAYMENT_REMINDER"
  | "PROJECT_UPDATE"
  | "CONSTRUCTION_UPDATE"
  | "AVAILABILITY"
  | "ANNOUNCEMENT";

export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
}) {
  return db.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      metadata: JSON.stringify(params.metadata ?? {}),
    },
  });
}
