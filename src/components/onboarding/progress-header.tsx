import { Progress } from "@/components/ui/progress";

export function OnboardingProgressHeader({ step, total, title }: { step: number; total: number; title: string }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Step {step} / {total}
        </span>
        <span>{Math.round((step / total) * 100)}%</span>
      </div>
      <Progress value={(step / total) * 100} className="mt-2" />
      <h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
    </div>
  );
}
