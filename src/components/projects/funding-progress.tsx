import { Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { getDictionary, type Locale } from "@/lib/i18n";

export function FundingProgress({
  fundedPercent,
  investorCount,
  apartmentsLeft,
  locale = "en",
  compact = false,
}: {
  fundedPercent: number;
  investorCount: number;
  apartmentsLeft?: number;
  locale?: Locale;
  compact?: boolean;
}) {
  const t = getDictionary(locale).fundingProgress;
  const clamped = Math.min(100, Math.max(0, Math.round(fundedPercent)));

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className={compact ? "font-tabular font-semibold" : "font-tabular text-lg font-semibold text-accent"}>{clamped}% {t.funded}</span>
        <span className="flex items-center gap-1 text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          {investorCount} {t.investors}
        </span>
      </div>
      <Progress value={clamped} className={compact ? "mt-1.5" : "mt-2"} indicatorClassName="bg-success" />
      {!compact && apartmentsLeft !== undefined && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          {apartmentsLeft} {t.apartmentsLeft}
        </p>
      )}
    </div>
  );
}
