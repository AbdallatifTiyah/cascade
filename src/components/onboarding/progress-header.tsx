import { Progress } from "@/components/ui/progress";
import { getDictionary, type Locale } from "@/lib/i18n";

export function OnboardingProgressHeader({ step, total, title, locale = "en" }: { step: number; total: number; title: string; locale?: Locale }) {
  const t = getDictionary(locale).onboarding;
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{t.stepOf.replace("{step}", String(step)).replace("{total}", String(total))}</span>
        <span>{Math.round((step / total) * 100)}%</span>
      </div>
      <Progress value={(step / total) * 100} className="mt-2" />
      <h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
    </div>
  );
}
