import { ClipboardList, Sparkles, Users, KeyRound } from "lucide-react";

const STEPS = [
  {
    icon: ClipboardList,
    title: "Share your plan",
    description: "Tell Cascade where you want to live, what you need, and what you can afford — down payment, monthly budget, and timeline.",
  },
  {
    icon: Sparkles,
    title: "Get matched",
    description: "Our matching engine scores real development opportunities against your plan and explains exactly why each one fits.",
  },
  {
    icon: Users,
    title: "Join the project",
    description: "Reserve your apartment within a group development project — participants join together to bring a project to life.",
  },
  {
    icon: KeyRound,
    title: "Track to handover",
    description: "Follow construction progress and your payment plan from land acquisition through apartment handover.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-border py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">How Cascade works</h2>
          <p className="mt-4 text-muted-foreground">
            A different starting point: your demand shapes what gets built, not the other way around.
          </p>
        </div>
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <step.icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Step {i + 1}</p>
              <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
