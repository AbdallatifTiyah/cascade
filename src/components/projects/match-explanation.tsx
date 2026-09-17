import { CheckCircle2, MinusCircle, XCircle } from "lucide-react";
import type { CriterionScore } from "@/lib/matching/types";
import { cn } from "@/lib/utils";

function IconFor({ score }: { score: number }) {
  if (score >= 70) return <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />;
  if (score >= 40) return <MinusCircle className="h-4 w-4 shrink-0 text-accent" />;
  return <XCircle className="h-4 w-4 shrink-0 text-muted-foreground" />;
}

export function MatchExplanation({ breakdown, className }: { breakdown: CriterionScore[]; className?: string }) {
  const sorted = [...breakdown].sort((a, b) => b.weight - a.weight);
  return (
    <ul className={cn("space-y-2.5", className)}>
      {sorted.map((c) => (
        <li key={c.key} className="flex items-start gap-2.5 text-sm">
          <IconFor score={c.score} />
          <span>
            <span className="font-medium text-foreground">{c.label}:</span>{" "}
            <span className="text-muted-foreground">{c.explanation}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
