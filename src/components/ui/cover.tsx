import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Cascade doesn't hotlink external property photography for the demo build
// (no image pipeline configured yet) — instead every project gets a
// deterministic, premium abstract cover derived from its theme. This keeps
// the UI fast, offline-safe, and consistent with the minimal brand
// direction rather than looking like a broken-image placeholder.
const GRADIENTS: Record<string, string> = {
  slate: "from-slate-700 via-slate-800 to-slate-950",
  emerald: "from-emerald-700 via-emerald-800 to-slate-950",
  amber: "from-amber-600 via-stone-800 to-slate-950",
  indigo: "from-indigo-700 via-indigo-900 to-slate-950",
  rose: "from-rose-700 via-stone-800 to-slate-950",
  teal: "from-teal-700 via-slate-800 to-slate-950",
};

export function ProjectCover({ theme = "slate", className, children }: { theme?: string; className?: string; children?: React.ReactNode }) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br",
        GRADIENTS[theme] ?? GRADIENTS.slate,
        className
      )}
    >
      <svg className="absolute inset-0 h-full w-full opacity-[0.15]" preserveAspectRatio="none" viewBox="0 0 400 300" fill="none">
        <path d="M0 300 L60 180 L110 220 L170 100 L230 190 L280 130 L340 210 L400 150 V300 Z" fill="white" />
        <line x1="0" y1="300" x2="400" y2="300" stroke="white" strokeWidth="1" />
      </svg>
      <Building2 className="relative h-9 w-9 text-white/70" strokeWidth={1.25} />
      {children}
    </div>
  );
}
