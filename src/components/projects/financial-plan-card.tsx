import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { calculateMonthlyPayment } from "@/lib/finance";
import { getDictionary, type Locale } from "@/lib/i18n";

export function FinancialPlanCard({
  totalPrice,
  downPayment,
  durationMonths,
  confirmed = false,
  title,
  locale = "en",
}: {
  totalPrice: number;
  downPayment: number;
  durationMonths: number;
  confirmed?: boolean;
  title?: string;
  locale?: Locale;
}) {
  const plan = calculateMonthlyPayment({ totalPrice, downPayment, durationMonths });
  const t = getDictionary(locale).financialPlanCard;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>{title ?? t.title}</CardTitle>
        <Badge variant={confirmed ? "success" : "warning"}>{confirmed ? t.confirmed : t.estimated}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <Row label={t.totalPrice} value={formatCurrency(plan.totalPrice)} />
        <Row label={t.initialPayment} value={formatCurrency(plan.downPayment)} />
        <Row label={t.remaining} value={formatCurrency(plan.remaining)} />
        <Row label={t.duration} value={`${durationMonths} ${locale === "ar" ? "شهراً" : "months"} (${Math.round(durationMonths / 12)} ${locale === "ar" ? "سنوات" : "years"})`} />
        <div className="border-t border-border pt-3">
          <Row label={t.monthlyPayment} value={`${formatCurrency(plan.monthlyPaymentDisplay, true)}${t.perMonth}`} emphasize />
        </div>
        {!confirmed && (
          <p className="pt-1 text-xs text-muted-foreground">
            {t.estimateNote}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Row({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={emphasize ? "font-tabular text-lg font-semibold text-accent" : "font-tabular text-sm font-medium"}>{value}</span>
    </div>
  );
}
