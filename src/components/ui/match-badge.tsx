import { cn } from "@/lib/utils";

function tone(score: number) {
  if (score >= 85) return "text-success bg-success/10";
  if (score >= 65) return "text-accent bg-accent/15";
  return "text-muted-foreground bg-muted";
}

export function MatchBadge({ score, className }: { score: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold font-tabular",
        tone(score),
        className
      )}
    >
      {Math.round(score)}% Match
    </span>
  );
}

export function MatchRing({ score, size = 64 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const colorClass = score >= 85 ? "stroke-success" : score >= 65 ? "stroke-accent" : "stroke-muted-foreground";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={6} className="stroke-muted" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={6}
          strokeLinecap="round"
          fill="none"
          className={cn("transition-all duration-700", colorClass)}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute font-tabular text-sm font-semibold">{Math.round(score)}%</span>
    </div>
  );
}
