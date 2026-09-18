import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { getDictionary, type Locale } from "@/lib/i18n";

export interface AnnualFees {
  serviceFeeAnnual: number;
  managementFeeAnnual: number;
  maintenanceFeeAnnual: number;
}

export function AnnualFeesCard({ fees, locale = "en" }: { fees: AnnualFees; locale?: Locale }) {
  const t = getDictionary(locale).annualFees;
  const total = fees.serviceFeeAnnual + fees.managementFeeAnnual + fees.maintenanceFeeAnnual;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Row label={t.serviceFee} value={`${formatCurrency(fees.serviceFeeAnnual)}${t.perYear}`} />
        <Row label={t.managementFee} value={`${formatCurrency(fees.managementFeeAnnual)}${t.perYear}`} />
        <Row label={t.maintenanceFee} value={`${formatCurrency(fees.maintenanceFeeAnnual)}${t.perYear}`} />
        <div className="border-t border-border pt-3">
          <Row label={t.total} value={`${formatCurrency(total)}${t.perYear}`} emphasize />
        </div>
        <p className="pt-1 text-xs text-muted-foreground">{t.note}</p>
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
