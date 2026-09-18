import { Handshake, Landmark, PencilRuler, HardHat, KeyRound } from "lucide-react";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n";

const ICONS = [Handshake, Landmark, PencilRuler, HardHat, KeyRound];

export function GroupDevelopment() {
  const locale = getLocale();
  const t = getDictionary(locale).landing.groupDevelopment;

  return (
    <section className="border-b border-border bg-primary py-20 text-primary-foreground sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t.title}</h2>
          <p className="mt-4 text-primary-foreground/70">{t.subtitle}</p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-5">
          {t.stages.map((label, i) => {
            const Icon = ICONS[i];
            return (
              <div key={label} className="flex flex-col items-center gap-3 text-center">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                  <Icon className="h-6 w-6" />
                  <span className="absolute -end-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                    {i + 1}
                  </span>
                </div>
                <p className="text-sm font-medium">{label}</p>
              </div>
            );
          })}
        </div>

        <p className="mx-auto mt-12 max-w-2xl text-center text-xs text-primary-foreground/50">{t.disclaimer}</p>
      </div>
    </section>
  );
}
