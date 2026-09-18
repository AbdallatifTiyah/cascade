import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Cascade doesn't hotlink external property photography for the demo build
// (no image pipeline configured yet) — instead every project gets a
// deterministic, premium abstract cover derived from its theme: a layered
// mesh gradient + grain texture + skyline silhouette, so it reads as
// designed brand art rather than a placeholder.
const GRADIENTS: Record<string, string> = {
  slate: "from-slate-700 via-slate-800 to-slate-950",
  emerald: "from-emerald-700 via-emerald-800 to-slate-950",
  amber: "from-amber-600 via-stone-800 to-slate-950",
  indigo: "from-indigo-700 via-indigo-900 to-slate-950",
  rose: "from-rose-700 via-stone-800 to-slate-950",
  teal: "from-teal-700 via-slate-800 to-slate-950",
};

const GLOWS: Record<string, string> = {
  slate: "rgb(148 163 184 / 0.35)",
  emerald: "rgb(52 211 153 / 0.35)",
  amber: "rgb(251 191 36 / 0.35)",
  indigo: "rgb(129 140 248 / 0.35)",
  rose: "rgb(251 113 133 / 0.35)",
  teal: "rgb(45 212 191 / 0.35)",
};

export function ProjectCover({ theme = "slate", className, children }: { theme?: string; className?: string; children?: React.ReactNode }) {
  const glow = GLOWS[theme] ?? GLOWS.slate;
  return (
    <div
      className={cn(
        "bg-grain relative flex items-center justify-center overflow-hidden bg-gradient-to-br",
        GRADIENTS[theme] ?? GRADIENTS.slate,
        className
      )}
    >
      <div
        className="absolute -top-10 start-1/4 h-40 w-40 rounded-full blur-3xl"
        style={{ backgroundColor: glow }}
      />
      <svg className="absolute inset-0 h-full w-full opacity-[0.18]" preserveAspectRatio="none" viewBox="0 0 400 300" fill="none">
        <path d="M0 300 L60 180 L110 220 L170 100 L230 190 L280 130 L340 210 L400 150 V300 Z" fill="white" />
        <line x1="0" y1="300" x2="400" y2="300" stroke="white" strokeWidth="1" />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/5" />
      <Building2 className="relative h-9 w-9 text-white/80 drop-shadow-lg" strokeWidth={1.25} />
      {children}
    </div>
  );
}
