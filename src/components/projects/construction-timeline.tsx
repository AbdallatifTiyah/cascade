import { CheckCircle2, Circle, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { getDictionary, type Locale } from "@/lib/i18n";

export interface ConstructionStageItem {
  id: string;
  name: string;
  status: string;
  plannedDate: Date | null;
  actualDate: Date | null;
  description: string | null;
}

export function ConstructionTimeline({ stages, locale = "en" }: { stages: ConstructionStageItem[]; locale?: Locale }) {
  const t = getDictionary(locale).constructionTimeline;
  return (
    <ol className="space-y-0">
      {stages.map((stage, i) => {
        const done = stage.status === "COMPLETE";
        const current = stage.status === "IN_PROGRESS";
        return (
          <li key={stage.id} className="relative flex gap-4 pb-8 last:pb-0">
            {i < stages.length - 1 && <span className="absolute left-[15px] top-8 h-full w-px bg-border" />}
            <span
              className={cn(
                "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                done ? "bg-success text-success-foreground" : current ? "bg-accent text-accent-foreground" : "border border-border bg-card text-muted-foreground"
              )}
            >
              {done ? <CheckCircle2 className="h-4 w-4" /> : current ? <LoaderCircle className="h-4 w-4 animate-spin [animation-duration:3s]" /> : <Circle className="h-3 w-3" />}
            </span>
            <div className="flex-1 pt-0.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className={cn("font-medium", !done && !current && "text-muted-foreground")}>{stage.name}</p>
                {(stage.actualDate || stage.plannedDate) && (
                  <span className="text-xs text-muted-foreground">
                    {done ? t.completedPrefix : current ? t.startedPrefix : t.plannedPrefix}
                    {formatDate((stage.actualDate ?? stage.plannedDate)!)}
                  </span>
                )}
              </div>
              {stage.description && <p className="mt-1 text-sm text-muted-foreground">{stage.description}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
