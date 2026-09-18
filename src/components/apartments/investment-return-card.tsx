import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { getDictionary, type Locale } from "@/lib/i18n";

export function InvestmentReturnCard({
  price,
  expectedYieldAnnual,
  locale = "en",
}: {
  price: number;
  expectedYieldAnnual: number;
  locale?: Locale;
}) {
  const t = getDictionary(locale).investmentReturn;
  const yieldPercent = price > 0 ? (expectedYieldAnnual / price) * 100 : 0;

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <TrendingUp className="h-4 w-4 text-success" />
        <CardTitle>{t.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{t.yieldLabel}</span>
          <span className="font-tabular text-lg font-semibold text-success">{yieldPercent.toFixed(1)}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{t.annualReturnLabel}</span>
          <span className="font-tabular text-sm font-medium">
            {formatCurrency(expectedYieldAnnual)}
            {t.perYear}
          </span>
        </div>
        <p className="pt-1 text-xs text-muted-foreground">{t.note}</p>
      </CardContent>
    </Card>
  );
}
