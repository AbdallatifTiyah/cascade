import type { Metadata } from "next";
import { Bell, CalendarClock, Megaphone, HardHat, Building2, CreditCard } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { MarkAllReadButton } from "@/components/notifications/mark-all-read-button";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = { title: "Notifications" };

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  RESERVATION: Building2,
  PAYMENT_REMINDER: CreditCard,
  PROJECT_UPDATE: Megaphone,
  CONSTRUCTION_UPDATE: HardHat,
  AVAILABILITY: CalendarClock,
  ANNOUNCEMENT: Megaphone,
};

export default async function NotificationsPage() {
  const user = await requireUser();
  const locale = getLocale();
  const t = getDictionary(locale).notificationsPage;
  const notifications = await db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t.title}</h1>
        <MarkAllReadButton disabled={notifications.every((n) => n.isRead)} locale={locale} />
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title={t.emptyTitle} description={t.emptyDesc} />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const Icon = ICONS[n.type] ?? Bell;
            return (
              <Card key={n.id} className={cn("flex items-start gap-3 p-4", !n.isRead && "border-accent/40 bg-accent/5")}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{n.title}</p>
                    {!n.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDate(n.createdAt, { hour: "numeric", minute: "2-digit" })}</p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
