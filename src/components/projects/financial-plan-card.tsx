import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { calculateMonthlyPayment } from "@/lib/finance";

export function FinancialPlanCard({
  totalPrice,
  downPayment,
  durationMonths,
  confirmed = false,
  title = "Financial Plan",
}: {
  totalPrice: number;
  downPayment: number;
  durationMonths: number;
  confirmed?: boolean;
  title?: string;
}) {
  const plan = calculateMonthlyPayment({ totalPrice, downPayment, durationMonths });

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>{title}</CardTitle>
        <Badge variant={confirmed ? "success" : "warning"}>{confirmed ? "Confirmed" : "Estimated"}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <Row label="Total price" value={formatCurrency(plan.totalPrice)} />
        <Row label="Initial payment" value={formatCurrency(plan.downPayment)} />
        <Row label="Remaining" value={formatCurrency(plan.remaining)} />
        <Row label="Duration" value={`${durationMonths} months (${Math.round(durationMonths / 12)} years)`} />
        <div className="border-t border-border pt-3">
          <Row label="Monthly payment" value={`${formatCurrency(plan.monthlyPaymentDisplay, true)}/mo`} emphasize />
        </div>
        {!confirmed && (
          <p className="pt-1 text-xs text-muted-foreground">
            This is an estimate based on current project pricing. Final figures are confirmed at reservation.
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
