import { LinkButton } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_hsl(var(--accent)/0.08),_transparent_60%)]" />
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <span className="inline-flex items-center rounded-full border border-border bg-secondary px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
          Demand-driven real estate development
        </span>
        <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
          Your path to <span className="text-accent">owning a home.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">
          Tell us what you need, what you can afford, and where you want to live. Cascade matches you with real
          estate development opportunities designed around your plan.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <LinkButton href="/signup" size="lg" className="w-full sm:w-auto">
            Build My Property Plan
            <ArrowRight className="h-4 w-4" />
          </LinkButton>
          <LinkButton href="/projects" variant="outline" size="lg" className="w-full sm:w-auto">
            Explore Projects
          </LinkButton>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Demo accounts available — no commitment required to explore.
        </p>
      </div>
    </section>
  );
}
