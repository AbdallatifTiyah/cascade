"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { LAND_STATUSES } from "@/lib/constants";

export function LandFormDialog({ locations }: { locations: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    locationId: locations[0]?.id ?? "",
    area: "",
    price: "",
    expectedBuildableArea: "",
    allowedFloors: "",
    potentialApartments: "",
    parkingSpaces: "",
    status: "AVAILABLE",
    notes: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/lands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          area: Number(form.area),
          price: Number(form.price),
          expectedBuildableArea: Number(form.expectedBuildableArea),
          allowedFloors: Number(form.allowedFloors),
          potentialApartments: Number(form.potentialApartments),
          parkingSpaces: Number(form.parkingSpaces || 0),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add Land
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Add land opportunity" className="sm:max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
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
              <Label htmlFor="status">Status</Label>
              <Select id="status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {LAND_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
            <Field label="Area (m²)" value={form.area} onChange={(v) => setForm({ ...form, area: v })} />
            <Field label="Price ($)" value={form.price} onChange={(v) => setForm({ ...form, price: v })} />
            <Field label="Expected buildable area (m²)" value={form.expectedBuildableArea} onChange={(v) => setForm({ ...form, expectedBuildableArea: v })} />
            <Field label="Allowed floors" value={form.allowedFloors} onChange={(v) => setForm({ ...form, allowedFloors: v })} />
            <Field label="Potential apartments" value={form.potentialApartments} onChange={(v) => setForm({ ...form, potentialApartments: v })} />
            <Field label="Parking spaces" value={form.parkingSpaces} onChange={(v) => setForm({ ...form, parkingSpaces: v })} />
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Save land opportunity
          </Button>
        </form>
      </Dialog>
    </>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type="number" required min={0} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
