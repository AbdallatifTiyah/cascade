import { LinkButton } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Ready to see what fits your plan?</h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          It takes about two minutes to build your property plan. From there, Cascade does the matching.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <LinkButton href="/signup" size="lg" className="w-full sm:w-auto">
            Build My Property Plan
          </LinkButton>
          <LinkButton href="/login" variant="ghost" size="lg" className="w-full sm:w-auto">
            I already have an account
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
