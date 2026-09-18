"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/onboarding/option-card";
import { AMENITIES, COVER_THEMES, PROJECT_STATUSES } from "@/lib/constants";

interface Option {
  id: string;
  name: string;
}

export function ProjectBuilderForm({ locations, lands }: { locations: Option[]; lands: Option[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    locationId: locations[0]?.id ?? "",
    landId: "",
    status: "PLANNING",
    totalFloors: 6,
    unitsPerFloor: 2,
    amenities: [] as string[],
    coverTheme: COVER_THEMES[0] as string,
    estimatedDeliveryDate: "",
    landCostEstimate: 200000,
    constructionCostEstimate: 400000,
    otherCostsEstimate: 50000,
    pricePerSqm: 300,
    downPaymentRatio: 0.2,
    durationMonths: 84,
    serviceFeeRate: 1.5,
    managementFeeRate: 1,
    maintenanceFeeRate: 0.5,
  });

  function toggleAmenity(key: string) {
    setForm((f) => ({ ...f, amenities: f.amenities.includes(key) ? f.amenities.filter((a) => a !== key) : [...f.amenities, key] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          serviceFeeRate: form.serviceFeeRate / 100,
          managementFeeRate: form.managementFeeRate / 100,
          maintenanceFeeRate: form.maintenanceFeeRate / 100,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.push(`/admin/projects/${data.id}`);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">Project name</Label>
            <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="locationId">Location</Label>
            <Select id="locationId" required value={form.locationId} onChange={(e) => setForm({ ...form, locationId: e.target.value })}>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="landId">Land (optional)</Label>
            <Select id="landId" value={form.landId} onChange={(e) => setForm({ ...form, landId: e.target.value })}>
              <option value="">No land linked yet</option>
              {lands.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select id="status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {PROJECT_STATUSES.filter((s) => s !== "HANDOVER" || true).map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="estimatedDeliveryDate">Estimated delivery date</Label>
            <Input id="estimatedDeliveryDate" type="date" required value={form.estimatedDeliveryDate} onChange={(e) => setForm({ ...form, estimatedDeliveryDate: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Building configuration</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <NumField label="Floors" value={form.totalFloors} onChange={(v) => setForm({ ...form, totalFloors: v })} />
          <NumField label="Units per floor" value={form.unitsPerFloor} onChange={(v) => setForm({ ...form, unitsPerFloor: v })} max={4} />
          <NumField label="Payment duration (months)" value={form.durationMonths} onChange={(v) => setForm({ ...form, durationMonths: v })} />
          <p className="text-xs text-muted-foreground sm:col-span-3">
            Cascade will generate {form.totalFloors * form.unitsPerFloor} apartments (2–4 bedrooms) automatically based on this configuration.
          </p>
          <div className="space-y-1.5">
            <Label>Cover theme</Label>
            <Select value={form.coverTheme} onChange={(e) => setForm({ ...form, coverTheme: e.target.value })}>
              {COVER_THEMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Costs &amp; pricing</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <NumField label="Land cost estimate ($)" value={form.landCostEstimate} onChange={(v) => setForm({ ...form, landCostEstimate: v })} />
          <NumField label="Construction cost estimate ($)" value={form.constructionCostEstimate} onChange={(v) => setForm({ ...form, constructionCostEstimate: v })} />
          <NumField label="Other costs estimate ($)" value={form.otherCostsEstimate} onChange={(v) => setForm({ ...form, otherCostsEstimate: v })} />
          <NumField label="Price per m² ($)" value={form.pricePerSqm} onChange={(v) => setForm({ ...form, pricePerSqm: v })} />
          <div className="space-y-1.5">
            <Label>Down payment ratio</Label>
            <Input type="number" min={0.05} max={0.9} step={0.05} value={form.downPaymentRatio} onChange={(e) => setForm({ ...form, downPaymentRatio: Number(e.target.value) })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Annual ownership fees</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <p className="text-xs text-muted-foreground sm:col-span-3">
            Recurring yearly costs shown to buyers alongside the purchase price, as a percentage of the apartment price.
          </p>
          <div className="space-y-1.5">
            <Label>Service fee (% / year)</Label>
            <Input type="number" min={0} max={20} step={0.1} value={form.serviceFeeRate} onChange={(e) => setForm({ ...form, serviceFeeRate: Number(e.target.value) })} />
          </div>
          <div className="space-y-1.5">
            <Label>Management fee (% / year)</Label>
            <Input type="number" min={0} max={20} step={0.1} value={form.managementFeeRate} onChange={(e) => setForm({ ...form, managementFeeRate: Number(e.target.value) })} />
          </div>
          <div className="space-y-1.5">
            <Label>Maintenance fee (% / year)</Label>
            <Input type="number" min={0} max={20} step={0.1} value={form.maintenanceFeeRate} onChange={(e) => setForm({ ...form, maintenanceFeeRate: Number(e.target.value) })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Amenities</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {AMENITIES.map((a) => (
            <Chip key={a.key} selected={form.amenities.includes(a.key)} onClick={() => toggleAmenity(a.key)}>
              {a.label}
            </Chip>
          ))}
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" size="lg" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Create project &amp; generate inventory
      </Button>
    </form>
  );
}

function NumField({ label, value, onChange, max }: { label: string; value: number; onChange: (v: number) => void; max?: number }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type="number" min={1} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} required />
    </div>
  );
}
