import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { calculateMonthlyPayment } from "@/lib/finance";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n";
import { Reveal } from "@/components/ui/reveal";

export function FinancialPlanning() {
  const locale = getLocale();
  const t = getDictionary(locale).landing.financialPlanning;
  const example = calculateMonthlyPayment({ totalPrice: 38000, downPayment: 8000, durationMonths: 84 });

  return (
    <section id="financial-planning" className="border-b border-border py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t.title}</h2>
          <p className="mt-4 text-muted-foreground">{t.subtitle}</p>
          <ul className="mt-6 space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span className="text-muted-foreground">{t.bullet1}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span className="text-muted-foreground">{t.bullet2}</span>
            </li>
          </ul>
        </Reveal>

        <Reveal delay={150}>
        <Card className="p-6 shadow-elevated sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.exampleLabel}</p>
          <div className="mt-5 space-y-4">
            <Row label={t.rowTotal} value={formatCurrency(example.totalPrice)} />
            <Row label={t.rowInitial} value={formatCurrency(example.downPayment)} />
            <Row label={t.rowRemaining} value={formatCurrency(example.remaining)} />
            <Row label={t.rowDuration} value={`84 ${t.monthsSuffix}`} />
            <div className="border-t border-border pt-4">
              <Row label={t.rowMonthly} value={`${formatCurrency(example.monthlyPaymentDisplay, true)}${t.perMonthSuffix}`} emphasize />
            </div>
          </div>
        </Card>
        </Reveal>
      </div>
    </section>
  );
}

function Row({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={emphasize ? "font-tabular text-xl font-semibold text-accent" : "font-tabular text-sm font-medium"}>{value}</span>
    </div>
  );
}
