"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { APARTMENT_STATUSES } from "@/lib/constants";

export interface ApartmentEditable {
  id: string;
  price: number;
  downPayment: number;
  monthlyPayment: number;
  durationMonths: number;
  status: string;
  serviceFeeAnnual: number;
  managementFeeAnnual: number;
  maintenanceFeeAnnual: number;
  expectedYieldAnnual: number;
}

export function ApartmentFeesForm({ apartment }: { apartment: ApartmentEditable }) {
  const router = useRouter();
  const [form, setForm] = useState({
    price: apartment.price,
    downPayment: apartment.downPayment,
    monthlyPayment: apartment.monthlyPayment,
    durationMonths: apartment.durationMonths,
    status: apartment.status,
    serviceFeeAnnual: apartment.serviceFeeAnnual,
    managementFeeAnnual: apartment.managementFeeAnnual,
    maintenanceFeeAnnual: apartment.maintenanceFeeAnnual,
    expectedYieldAnnual: apartment.expectedYieldAnnual,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/apartments/${apartment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Something went wrong" });
        return;
      }
      setMessage({ type: "success", text: "Apartment updated" });
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pricing &amp; payment plan</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <NumField label="Price ($)" value={form.price} onChange={(v) => setForm({ ...form, price: v })} />
          <NumField label="Down payment ($)" value={form.downPayment} onChange={(v) => setForm({ ...form, downPayment: v })} />
          <NumField label="Monthly payment ($)" value={form.monthlyPayment} onChange={(v) => setForm({ ...form, monthlyPayment: v })} />
          <NumField label="Duration (months)" value={form.durationMonths} onChange={(v) => setForm({ ...form, durationMonths: v })} />
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {APARTMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Annual ownership fees</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <p className="text-xs text-muted-foreground sm:col-span-3">
            Independent of the project defaults — overrides only this apartment.
          </p>
          <NumField label="Service fee ($/yr)" value={form.serviceFeeAnnual} onChange={(v) => setForm({ ...form, serviceFeeAnnual: v })} />
          <NumField label="Management fee ($/yr)" value={form.managementFeeAnnual} onChange={(v) => setForm({ ...form, managementFeeAnnual: v })} />
          <NumField label="Maintenance fee ($/yr)" value={form.maintenanceFeeAnnual} onChange={(v) => setForm({ ...form, maintenanceFeeAnnual: v })} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expected investment return</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <NumField label="Expected annual return ($/yr)" value={form.expectedYieldAnnual} onChange={(v) => setForm({ ...form, expectedYieldAnnual: v })} />
        </CardContent>
      </Card>

      {message && <p className={message.type === "error" ? "text-sm text-destructive" : "text-sm text-success"}>{message.text}</p>}
      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Save changes
      </Button>
    </form>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type="number" min={0} step={0.01} value={value} onChange={(e) => onChange(Number(e.target.value))} required />
    </div>
  );
}
