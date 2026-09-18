import { Target, ShieldCheck, LineChart, Building } from "lucide-react";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n";
import { Reveal } from "@/components/ui/reveal";

const ICONS = [Target, LineChart, Building, ShieldCheck];

export function WhyCascade() {
  const locale = getLocale();
  const t = getDictionary(locale).landing.whyCascade;

  return (
    <section className="border-b border-border bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t.title}</h2>
        </Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {t.reasons.map((reason, i) => {
            const Icon = ICONS[i];
            return (
              <Reveal
                key={reason.title}
                delay={i * 100}
                className="flex gap-4 rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{reason.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{reason.description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
