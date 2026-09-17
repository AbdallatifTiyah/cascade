import { Handshake, Landmark, PencilRuler, HardHat, KeyRound } from "lucide-react";

const STAGES = [
  { icon: Handshake, label: "Join the project" },
  { icon: Landmark, label: "Land acquisition" },
  { icon: PencilRuler, label: "Design" },
  { icon: HardHat, label: "Construction" },
  { icon: KeyRound, label: "Apartment handover" },
];

export function GroupDevelopment() {
  return (
    <section className="border-b border-border bg-primary py-20 text-primary-foreground sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">How group development works</h2>
          <p className="mt-4 text-primary-foreground/70">
            A group of participants jointly takes part in a real estate development project — each participant is
            allocated an apartment as the project moves from land to handover.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-5">
          {STAGES.map((stage, i) => (
            <div key={stage.label} className="flex flex-col items-center gap-3 text-center">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                <stage.icon className="h-6 w-6" />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                  {i + 1}
                </span>
              </div>
              <p className="text-sm font-medium">{stage.label}</p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-12 max-w-2xl text-center text-xs text-primary-foreground/50">
          Cascade uses neutral terms like participation and allocation until a formal ownership structure is
          finalized for a given project — full legal terms are shared before any binding commitment.
        </p>
      </div>
    </section>
  );
}
