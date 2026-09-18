import { LinkButton } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary, isRtl } from "@/lib/i18n";
import { db } from "@/lib/db";

export async function Hero() {
  const locale = getLocale();
  const t = getDictionary(locale).landing;
  const rtl = isRtl(locale);

  const [activeProjects, investorCount, availableApartments] = await Promise.all([
    db.project.count({ where: { status: { notIn: ["DRAFT"] } } }),
    db.projectParticipant.count(),
    db.apartment.count({ where: { status: "AVAILABLE" } }),
  ]);

  const stats = [
    { value: activeProjects, label: t.heroStats.projects },
    { value: investorCount, label: t.heroStats.investors },
    { value: availableApartments, label: t.heroStats.apartments },
  ];

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_hsl(var(--accent)/0.08),_transparent_60%)]" />
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <span className="inline-flex items-center rounded-full border border-border bg-secondary px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
          {t.heroBadge}
        </span>
        <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
          {t.heroTitlePrefix} <span className="text-accent">{t.heroTitleAccent}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">{t.heroSubtitle}</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <LinkButton href="/signup" size="lg" className="w-full sm:w-auto">
            {t.heroCtaPrimary}
            <ArrowRight className={rtl ? "h-4 w-4 rotate-180" : "h-4 w-4"} />
          </LinkButton>
          <LinkButton href="/projects" variant="outline" size="lg" className="w-full sm:w-auto">
            {t.heroCtaSecondary}
          </LinkButton>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">{t.heroNote}</p>

        <div className="mx-auto mt-14 grid max-w-lg grid-cols-3 gap-4 border-t border-border pt-8">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-tabular text-2xl font-semibold sm:text-3xl">{s.value.toLocaleString(locale === "ar" ? "ar" : "en-US")}</p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
