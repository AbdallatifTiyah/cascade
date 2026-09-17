"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/input";
import { WEIGHT_LABELS, DEFAULT_WEIGHTS } from "@/lib/matching/weights";
import type { MatchWeights } from "@/lib/matching/types";

export function MatchingConfigForm({ initialWeights }: { initialWeights: MatchWeights }) {
  const router = useRouter();
  const [weights, setWeights] = useState<Record<keyof MatchWeights, number>>(
    Object.fromEntries(Object.entries(initialWeights).map(([k, v]) => [k, Math.round(v * 100)])) as Record<keyof MatchWeights, number>
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const total = useMemo(() => Object.values(weights).reduce((s, v) => s + v, 0), [weights]);

  function setWeight(key: keyof MatchWeights, value: number) {
    setSaved(false);
    setWeights((w) => ({ ...w, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/admin/matching-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(weights),
      });
      setSaved(true);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setWeights(Object.fromEntries(Object.entries(DEFAULT_WEIGHTS).map(([k, v]) => [k, Math.round(v * 100)])) as Record<keyof MatchWeights, number>);
    setSaved(false);
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Matching weights</CardTitle>
        <span className={`font-tabular text-sm font-semibold ${total === 100 ? "text-success" : "text-accent"}`}>{total}% total</span>
      </CardHeader>
      <CardContent className="space-y-5">
        {(Object.keys(WEIGHT_LABELS) as (keyof MatchWeights)[]).map((key) => (
          <div key={key}>
            <div className="flex items-center justify-between text-sm">
              <Label>{WEIGHT_LABELS[key]}</Label>
              <span className="font-tabular font-medium">{weights[key]}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={60}
              value={weights[key]}
              onChange={(e) => setWeight(key, Number(e.target.value))}
              className="mt-2 w-full accent-[hsl(var(--primary))]"
            />
          </div>
        ))}
        <p className="text-xs text-muted-foreground">
          Weights are normalized to 100% automatically when saved, so they don't need to add up exactly as you adjust them.
        </p>
        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saved ? "Saved" : "Save weights"}
          </Button>
          <Button variant="outline" onClick={handleReset} type="button">
            <RotateCcw className="h-4 w-4" />
            Reset to default
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
