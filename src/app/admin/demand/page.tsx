import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getDemandSegment } from "@/lib/demand/segments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Label, Select, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { BEDROOM_OPTIONS, amenityLabel } from "@/lib/constants";

export const metadata: Metadata = { title: "Demand Analytics" };

interface Filters {
  location?: string;
  bedrooms?: string;
  minBudget?: string;
  maxBudget?: string;
}

export default async function DemandPage({ searchParams }: { searchParams: Promise<Filters> }) {
  const params = await searchParams;
  const locations = await db.location.findMany({ orderBy: { name: "asc" } });

  const filters = {
    locationId: params.location || undefined,
    bedrooms: params.bedrooms || undefined,
    minBudget: params.minBudget ? Number(params.minBudget) : undefined,
    maxBudget: params.maxBudget ? Number(params.maxBudget) : undefined,
  };
  const stats = await getDemandSegment(filters);
  const segments = await db.demandSegment.findMany({ include: { location: true } });

  const hasFilters = Boolean(params.location || params.bedrooms || params.minBudget || params.maxBudget);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Demand Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">Filter aggregated demand data to understand where and what to build.</p>
      </div>

      <Card>
        <CardContent className="p-5">
          <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" method="GET">
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Select id="location" name="location" defaultValue={params.location ?? ""}>
                <option value="">All locations</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Select id="bedrooms" name="bedrooms" defaultValue={params.bedrooms ?? ""}>
                <option value="">Any</option>
                {BEDROOM_OPTIONS.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="minBudget">Min monthly ($)</Label>
              <Input id="minBudget" name="minBudget" type="number" defaultValue={params.minBudget ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="maxBudget">Max monthly ($)</Label>
              <Input id="maxBudget" name="maxBudget" type="number" defaultValue={params.maxBudget ?? ""} />
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" className="w-full">
                Apply filters
              </Button>
            </div>
          </form>
          {hasFilters && (
            <Link href="/admin/demand" className="mt-3 inline-block text-xs text-muted-foreground underline underline-offset-2">
              Clear filters
            </Link>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Users" value={String(stats.userCount)} />
        <StatCard label="Avg. monthly budget" value={formatCurrency(stats.avgMonthlyBudget)} />
        <StatCard label="Avg. down payment" value={formatCurrency(stats.avgDownPayment)} />
        <StatCard label="Avg. desired size" value={`${Math.round(stats.avgSize)} m²`} />
        <StatCard label="Preferred timeline" value={stats.preferredTimelineLabel} />
      </div>

      {stats.topAmenities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top requested features</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {stats.topAmenities.map((a) => (
              <Badge key={a.key} variant="outline">
                {amenityLabel(a.key)} · {a.count}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Saved demand segments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {segments.map((s) => (
            <Link
              key={s.id}
              href={`/admin/demand?${new URLSearchParams({
                ...(s.locationId ? { location: s.locationId } : {}),
                ...(s.minBedrooms ? { bedrooms: s.minBedrooms } : {}),
                ...(s.minBudget ? { minBudget: String(s.minBudget) } : {}),
                ...(s.maxBudget ? { maxBudget: String(s.maxBudget) } : {}),
              }).toString()}`}
              className="flex items-center justify-between rounded-lg border border-border p-3 text-sm hover:bg-secondary"
            >
              <span className="font-medium">{s.name}</span>
              <span className="text-muted-foreground">{s.location?.name ?? "All locations"}</span>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
