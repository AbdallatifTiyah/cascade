import { Target, ShieldCheck, LineChart, Building } from "lucide-react";

const REASONS = [
  {
    icon: Target,
    title: "Built around your budget",
    description: "Every recommendation is scored against your actual affordability — not a generic listing feed.",
  },
  {
    icon: LineChart,
    title: "Transparent, explainable matching",
    description: "See exactly why a project matches: location, budget, size, timeline — no black-box percentages.",
  },
  {
    icon: Building,
    title: "Real development, real data",
    description: "Projects are shaped by aggregated demand — Cascade only pursues land where the demand already exists.",
  },
  {
    icon: ShieldCheck,
    title: "Clarity from day one",
    description: "Estimated vs. confirmed pricing is always labeled clearly. No hidden terms, no surprise numbers.",
  },
];

export function WhyCascade() {
  return (
    <section className="border-b border-border bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Why Cascade</h2>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {REASONS.map((reason) => (
            <div key={reason.title} className="flex gap-4 rounded-xl border border-border bg-card p-6 shadow-card">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <reason.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">{reason.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{reason.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
