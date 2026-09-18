import type { Metadata } from "next";
import { Wallet } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";
import { PaymentScheduleTable } from "@/components/payments/payment-schedule-table";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { trackEvent } from "@/lib/audit";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = { title: "Payments" };

export default async function PaymentsPage() {
  const user = await requireUser();
  const locale = getLocale();
  const t = getDictionary(locale).paymentsPage;

  const plans = await db.paymentPlan.findMany({
    where: { reservation: { userId: user.id } },
    include: { payments: { orderBy: { dueDate: "asc" } }, reservation: { include: { project: true, apartment: true } } },
  });

  await trackEvent({ userId: user.id, name: "payment_viewed" });

  if (plans.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title={t.emptyTitle}
        description={t.emptyDesc}
        action={
          <LinkButton href="/projects" size="sm">
            {t.exploreProjects}
          </LinkButton>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t.title}</h1>

      {plans.map((plan) => {
        const paid = plan.payments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
        const remaining = plan.totalAmount - paid;
        const progress = plan.totalAmount > 0 ? (paid / plan.totalAmount) * 100 : 0;
        const next = plan.payments.find((p) => p.status !== "PAID");

        return (
          <Card key={plan.id}>
            <CardHeader>
              <CardTitle>
                {plan.reservation.project.name} · {locale === "ar" ? "شقة" : "Apartment"} {plan.reservation.apartment.code}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Stat label={t.total} value={formatCurrency(plan.totalAmount)} />
                <Stat label={t.paid} value={formatCurrency(paid)} />
                <Stat label={t.remaining} value={formatCurrency(remaining)} />
                <Stat label={t.nextDue} value={next ? formatDate(next.dueDate) : "—"} />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{t.paymentProgress}</span>
                  <span className="font-tabular text-muted-foreground">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="mt-2" indicatorClassName="bg-accent" />
              </div>

              <PaymentScheduleTable payments={plan.payments} locale={locale} />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-tabular text-sm font-semibold">{value}</p>
    </div>
  );
}
