"use client";

import { useMemo, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateProjectFeasibility } from "@/lib/feasibility/engine";
import { formatCurrency, formatPercent } from "@/lib/currency";

export interface FeasibilityInitial {
  projectId?: string;
  landId?: string;
  landCost: number;
  constructionCost: number;
  otherCosts: number;
  numApartments: number;
  avgApartmentPrice: number;
  potentialParticipants: number;
  contextLabel?: string;
}

export function FeasibilityCalculator({ initial }: { initial: FeasibilityInitial }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const output = useMemo(() => calculateProjectFeasibility(form), [form]);

  function set<K extends keyof FeasibilityInitial>(key: K, value: number) {
    setSaved(false);
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/admin/feasibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Inputs</CardTitle>
          {initial.contextLabel && <p className="text-sm text-muted-foreground">{initial.contextLabel}</p>}
        </CardHeader>
        <CardContent className="space-y-4">
          <NumberField label="Land cost ($)" value={form.landCost} onChange={(v) => set("landCost", v)} />
          <NumberField label="Construction cost ($)" value={form.constructionCost} onChange={(v) => set("constructionCost", v)} />
          <NumberField label="Other costs ($)" value={form.otherCosts} onChange={(v) => set("otherCosts", v)} />
          <NumberField label="Number of apartments" value={form.numApartments} onChange={(v) => set("numApartments", v)} />
          <NumberField label="Average apartment price ($)" value={form.avgApartmentPrice} onChange={(v) => set("avgApartmentPrice", v)} />
          <NumberField
            label="Potential participants (highly matched users)"
            value={form.potentialParticipants}
            onChange={(v) => set("potentialParticipants", v)}
          />
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saved ? "Saved" : "Save this feasibility run"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estimated outputs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Row label="Total estimated cost" value={formatCurrency(output.totalCost)} />
          <Row label="Total estimated revenue" value={formatCurrency(output.totalRevenue)} />
          <Row label="Estimated gross margin" value={`${formatCurrency(output.grossMargin)} (${formatPercent(output.grossMarginPercent, 1)})`} />
          <Row label="Cost per unit" value={formatCurrency(output.costPerUnit)} />
          <Row label="Revenue per unit" value={formatCurrency(output.revenuePerUnit)} />
          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">Margin indicator</span>
            <Badge variant={output.marginIndicator === "Strong" ? "success" : output.marginIndicator === "Moderate" ? "warning" : "destructive"}>
              {output.marginIndicator}
            </Badge>
          </div>
          <Row label="Required participants" value={String(output.requiredParticipants)} />
          <Row label="Potential participants" value={String(output.potentialParticipants)} />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Demand coverage</span>
            <span className="font-tabular text-lg font-semibold">{formatPercent(output.demandCoveragePercent)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Demand indicator</span>
            <Badge variant={output.demandIndicator === "High demand" ? "success" : output.demandIndicator === "Adequate demand" ? "warning" : "destructive"}>
              {output.demandIndicator}
            </Badge>
          </div>
          <p className="border-t border-border pt-4 text-xs text-muted-foreground">
            All figures are estimates derived from the inputs above — not guaranteed investment returns.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type="number" min={0} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-tabular text-sm font-semibold">{value}</span>
    </div>
  );
}
