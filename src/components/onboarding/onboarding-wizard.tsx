"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2, MapPin, Building2, Home, Warehouse, Landmark } from "lucide-react";
import { OnboardingProgressHeader } from "./progress-header";
import { OptionCard, Chip } from "./option-card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AMENITIES,
  BEDROOM_OPTIONS,
  PROPERTY_TYPES,
  TIMELINE_OPTIONS,
} from "@/lib/constants";

export interface OnboardingDraft {
  locationIds: string[];
  propertyType: string;
  bedrooms: string;
  minSize: number;
  maxSize: number;
  downPaymentMin: number;
  downPaymentMax: number;
  monthlyMin: number;
  monthlyMax: number;
  durationMinYears: number;
  durationMaxYears: number;
  amenities: string[];
  timeline: string;
}

const DEFAULT_DRAFT: OnboardingDraft = {
  locationIds: [],
  propertyType: "APARTMENT",
  bedrooms: "",
  minSize: 100,
  maxSize: 140,
  downPaymentMin: 6000,
  downPaymentMax: 9000,
  monthlyMin: 280,
  monthlyMax: 400,
  durationMinYears: 5,
  durationMaxYears: 7,
  amenities: [],
  timeline: "",
};

const STORAGE_KEY = "cascade.onboarding.draft";
const TOTAL_STEPS = 7;

const PROPERTY_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  APARTMENT: Building2,
  VILLA: Home,
  INVESTMENT: Landmark,
};

export function OnboardingWizard({
  locations,
  initialDraft,
  mode = "create",
}: {
  locations: { id: string; name: string; region: string | null }[];
  initialDraft?: OnboardingDraft;
  mode?: "create" | "edit";
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<OnboardingDraft>(initialDraft ?? DEFAULT_DRAFT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialDraft) return;
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved) {
      try {
        setDraft(JSON.parse(saved));
      } catch {
        /* ignore corrupt draft */
      }
    }
  }, [initialDraft]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    }
  }, [draft]);

  function update<K extends keyof OnboardingDraft>(key: K, value: OnboardingDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function toggleInArray(key: "locationIds" | "amenities", value: string) {
    setDraft((d) => {
      const current = d[key];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      return { ...d, [key]: next };
    });
  }

  const validators: Record<number, () => boolean> = {
    1: () => draft.locationIds.length > 0,
    2: () => !!draft.propertyType,
    3: () => !!draft.bedrooms,
    4: () => draft.minSize > 0 && draft.maxSize >= draft.minSize,
    5: () =>
      draft.downPaymentMax >= draft.downPaymentMin &&
      draft.monthlyMax >= draft.monthlyMin &&
      draft.durationMaxYears >= draft.durationMinYears,
    6: () => true,
    7: () => !!draft.timeline,
  };

  const isStepValid = validators[step]?.() ?? true;

  async function handleNext() {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please review your answers.");
        return;
      }
      localStorage.removeItem(STORAGE_KEY);
      router.push("/profile");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const titles: Record<number, string> = {
    1: "Where would you like to live?",
    2: "What are you looking for?",
    3: "How many bedrooms?",
    4: "What size fits your plan?",
    5: "What's your financial capacity?",
    6: "Which features matter to you?",
    7: "What's your ideal timeline?",
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:py-16">
      <OnboardingProgressHeader step={step} total={TOTAL_STEPS} title={titles[step]} />

      <div className="min-h-[280px]">
        {step === 1 && (
          <div>
            <p className="mb-5 text-sm text-muted-foreground">Select one or more areas you'd consider. You can change this anytime.</p>
            <div className="flex flex-wrap gap-2">
              {locations.map((loc) => (
                <Chip key={loc.id} selected={draft.locationIds.includes(loc.id)} onClick={() => toggleInArray("locationIds", loc.id)}>
                  <MapPin className="mr-1 inline h-3.5 w-3.5" />
                  {loc.name}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-3 sm:grid-cols-3">
            {PROPERTY_TYPES.map((type) => (
              <OptionCard
                key={type.value}
                selected={draft.propertyType === type.value}
                onClick={() => update("propertyType", type.value)}
                title={type.label}
                icon={PROPERTY_TYPE_ICONS[type.value] ?? Warehouse}
                description={type.value === "APARTMENT" ? "Primary focus for Cascade today" : undefined}
              />
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {BEDROOM_OPTIONS.map((b) => (
              <OptionCard key={b.value} selected={draft.bedrooms === b.value} onClick={() => update("bedrooms", b.value)} title={b.label} description="bedrooms" />
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">Set your preferred apartment size range in square meters.</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minSize">Minimum (m²)</Label>
                <Input id="minSize" type="number" min={20} value={draft.minSize} onChange={(e) => update("minSize", Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxSize">Maximum (m²)</Label>
                <Input id="maxSize" type="number" min={20} value={draft.maxSize} onChange={(e) => update("maxSize", Number(e.target.value))} />
              </div>
            </div>
            <p className="font-tabular text-lg font-semibold">
              {draft.minSize}–{draft.maxSize} m²
            </p>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium">Down payment</p>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <NumberField label="Minimum ($)" value={draft.downPaymentMin} onChange={(v) => update("downPaymentMin", v)} />
                <NumberField label="Maximum ($)" value={draft.downPaymentMax} onChange={(v) => update("downPaymentMax", v)} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Monthly payment</p>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <NumberField label="Minimum ($)" value={draft.monthlyMin} onChange={(v) => update("monthlyMin", v)} />
                <NumberField label="Maximum ($)" value={draft.monthlyMax} onChange={(v) => update("monthlyMax", v)} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Payment duration (years)</p>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <NumberField label="Minimum" value={draft.durationMinYears} onChange={(v) => update("durationMinYears", v)} />
                <NumberField label="Maximum" value={draft.durationMaxYears} onChange={(v) => update("durationMaxYears", v)} />
              </div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div>
            <p className="mb-5 text-sm text-muted-foreground">Optional — select any features that matter to you.</p>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((a) => (
                <Chip key={a.key} selected={draft.amenities.includes(a.key)} onClick={() => toggleInArray("amenities", a.key)}>
                  {a.label}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {TIMELINE_OPTIONS.map((t) => (
              <OptionCard key={t.value} selected={draft.timeline === t.value} onClick={() => update("timeline", t.value)} title={t.label} />
            ))}
          </div>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-10 flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1 || loading}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button type="button" onClick={handleNext} disabled={!isStepValid || loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {step === TOTAL_STEPS ? (mode === "edit" ? "Save profile" : "See My Property Profile") : "Continue"}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type="number" min={0} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}
