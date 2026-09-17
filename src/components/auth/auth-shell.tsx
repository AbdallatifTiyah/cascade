import { Logo } from "@/components/layout/logo";
import { CheckCircle2 } from "lucide-react";

const POINTS = [
  "Matched against your real budget and timeline",
  "Explainable match scores — never a black box",
  "Track construction and payments in one place",
];

export function AuthShell({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <Logo dark />
        <div className="max-w-sm">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">
            Real estate development, shaped by real demand.
          </h2>
          <ul className="mt-8 space-y-4">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm text-primary-foreground/80">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-primary-foreground/40">Cascade Real Estate Investment &amp; Development</p>
      </div>

      <div className="flex flex-col items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
