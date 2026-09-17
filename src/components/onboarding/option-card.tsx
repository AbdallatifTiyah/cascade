"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function OptionCard({
  selected,
  onClick,
  title,
  description,
  icon: Icon,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "relative flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected ? "border-primary bg-primary text-primary-foreground shadow-elevated" : "border-border bg-card hover:border-foreground/30",
        className
      )}
    >
      {selected && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Check className="h-3 w-3" />
        </span>
      )}
      {Icon && <Icon className={cn("h-5 w-5", selected ? "text-primary-foreground" : "text-muted-foreground")} />}
      <span className="font-medium">{title}</span>
      {description && <span className={cn("text-xs", selected ? "text-primary-foreground/70" : "text-muted-foreground")}>{description}</span>}
    </button>
  );
}

export function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-foreground/30"
      )}
    >
      {children}
    </button>
  );
}
