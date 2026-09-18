import { CheckCircle2, Circle, LoaderCircle } from "lucide-react";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n";
import { Reveal } from "@/components/ui/reveal";

export function ConstructionTransparency() {
  const locale = getLocale();
  const t = getDictionary(locale).landing.constructionTransparency;
  const currentIndex = 3;

  return (
    <section className="border-b border-border bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Reveal className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t.title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{t.subtitle}</p>
        </Reveal>

        <div className="mt-14 flex flex-col gap-0 sm:flex-row sm:items-start sm:justify-between">
          {t.stages.map((stage, i) => {
            const done = i < currentIndex;
            const current = i === currentIndex;
            return (
              <div key={stage} className="relative flex flex-1 flex-row items-center gap-3 py-3 sm:flex-col sm:gap-2 sm:py-0 sm:text-center">
                {i > 0 && <div className="absolute start-[15px] top-0 h-full w-px bg-border sm:start-0 sm:top-[15px] sm:h-px sm:w-full" />}
                <div
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    done ? "bg-success text-success-foreground" : current ? "bg-accent text-accent-foreground" : "bg-card border border-border text-muted-foreground"
                  }`}
                >
                  {done ? <CheckCircle2 className="h-4 w-4" /> : current ? <LoaderCircle className="h-4 w-4 animate-spin [animation-duration:3s]" /> : <Circle className="h-3 w-3" />}
                </div>
                <p className={`text-xs font-medium sm:mt-1 ${current ? "text-foreground" : "text-muted-foreground"}`}>{stage}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
