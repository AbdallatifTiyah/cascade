import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { calculateMonthlyPayment } from "@/lib/finance";

export function FinancialPlanning() {
  const example = calculateMonthlyPayment({ totalPrice: 38000, downPayment: 8000, durationMonths: 84 });

  return (
    <section id="financial-planning" className="border-b border-border py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Financial planning you can trust</h2>
          <p className="mt-4 text-muted-foreground">
            Every project shows a clear breakdown of initial payment, monthly installments, and duration —
            calculated the same way, every time, and always labeled as an estimate until a reservation is confirmed.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span className="text-muted-foreground">No assumed interest — your remaining balance is simply split across your payment duration.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span className="text-muted-foreground">Estimated figures are always distinguished from confirmed, contractual amounts.</span>
            </li>
          </ul>
        </div>

        <Card className="p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Example — 135 m² apartment</p>
          <div className="mt-5 space-y-4">
            <Row label="Estimated total price" value={formatCurrency(example.totalPrice)} />
            <Row label="Initial payment" value={formatCurrency(example.downPayment)} />
            <Row label="Remaining balance" value={formatCurrency(example.remaining)} />
            <Row label="Duration" value="84 months" />
            <div className="border-t border-border pt-4">
              <Row label="Monthly payment" value={`${formatCurrency(example.monthlyPaymentDisplay, true)}/mo`} emphasize />
            </div>
          </div>
        </Card>
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
