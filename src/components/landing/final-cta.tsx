import { LinkButton } from "@/components/ui/button";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n";
import { Reveal } from "@/components/ui/reveal";

export function FinalCta() {
  const locale = getLocale();
  const t = getDictionary(locale).landing.finalCta;

  return (
    <section className="bg-mesh relative overflow-hidden py-20 sm:py-28">
      <Reveal className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t.title}</h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{t.subtitle}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <LinkButton href="/signup" variant="accent" size="lg" className="w-full font-semibold sm:w-auto">
            {t.ctaPrimary}
          </LinkButton>
          <LinkButton href="/login" variant="ghost" size="lg" className="w-full sm:w-auto">
            {t.ctaSecondary}
          </LinkButton>
        </div>
      </Reveal>
    </section>
  );
}
