import { LinkButton } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
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
    <section className="bg-mesh relative overflow-hidden border-b border-border">
      <div
        className="absolute start-[8%] top-10 h-64 w-64 animate-float rounded-full bg-accent/10 blur-3xl sm:h-80 sm:w-80"
        aria-hidden
      />
      <div
        className="absolute end-[8%] top-32 h-48 w-48 animate-float rounded-full bg-primary/5 blur-3xl [animation-delay:-3s] sm:h-64 sm:w-64"
        aria-hidden
      />
      <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 sm:py-32">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1.5 text-xs font-medium text-accent">
          <Sparkles className="h-3 w-3" />
          {t.heroBadge}
        </span>
        <h1 className="mt-7 text-5xl font-extrabold leading-[1.08] tracking-tight sm:text-7xl">
          {t.heroTitlePrefix} <span className="text-gradient-gold">{t.heroTitleAccent}</span>
        </h1>
        <p className="mx-auto mt-7 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">{t.heroSubtitle}</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <LinkButton href="/signup" variant="accent" size="lg" className="w-full font-semibold sm:w-auto">
            {t.heroCtaPrimary}
            <ArrowRight className={rtl ? "h-4 w-4 rotate-180" : "h-4 w-4"} />
          </LinkButton>
          <LinkButton href="/projects" variant="outline" size="lg" className="w-full border-2 sm:w-auto">
            {t.heroCtaSecondary}
          </LinkButton>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">{t.heroNote}</p>

        <div className="mx-auto mt-14 grid max-w-lg grid-cols-3 gap-4 border-t border-border/70 pt-8">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-tabular text-3xl font-extrabold sm:text-4xl">{s.value.toLocaleString(locale === "ar" ? "ar" : "en-US")}</p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
