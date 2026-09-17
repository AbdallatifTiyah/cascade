import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLandDemandMatch } from "@/lib/land/matching";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { LandStatusControl } from "@/components/admin/land-status-control";
import { formatCurrency, formatPercent } from "@/lib/currency";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const { land } = await getLandDemandMatch(id);
    return { title: land.name };
  } catch {
    return { title: "Land" };
  }
}

export default async function LandDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let data;
  try {
    data = await getLandDemandMatch(id);
  } catch {
    notFound();
  }
  const { land, estimate, result } = data;

  const components = [
    { label: "Demand coverage", value: result.components.coverage },
    { label: "Location popularity", value: result.components.locationPopularity },
    { label: "Size fit", value: result.components.sizeFit },
    { label: "Affordability fit", value: result.components.affordability },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{land.location.name}</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{land.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <LandStatusControl landId={land.id} currentStatus={land.status} />
          <LinkButton href={`/admin/feasibility?landId=${land.id}`}>Run Feasibility</LinkButton>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Land details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-5 sm:grid-cols-3">
              <Stat label="Area" value={`${land.area} m²`} />
              <Stat label="Price" value={formatCurrency(land.price)} />
              <Stat label="Buildable area" value={`${land.expectedBuildableArea} m²`} />
              <Stat label="Allowed floors" value={String(land.allowedFloors)} />
              <Stat label="Potential apartments" value={String(land.potentialApartments)} />
              <Stat label="Parking spaces" value={String(land.parkingSpaces)} />
            </dl>
            {land.notes && <p className="mt-5 border-t border-border pt-4 text-sm text-muted-foreground">{land.notes}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estimated product</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row label="Avg. apartment size" value={`${Math.round(estimate.avgApartmentSize)} m²`} />
            <Row label="Target size range" value={`${Math.round(estimate.targetSizeMin)}–${Math.round(estimate.targetSizeMax)} m²`} />
            <Row label="Est. apartment price" value={formatCurrency(estimate.estimatedApartmentPrice)} />
            <Row label="Est. down payment" value={formatCurrency(estimate.estimatedDownPayment)} />
            <Row label="Est. monthly payment" value={formatCurrency(estimate.estimatedMonthlyPayment)} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Land → demand match</CardTitle>
          <div className="flex items-center gap-2">
            <span className="font-tabular text-2xl font-semibold">{result.score}%</span>
            <Badge variant={result.status === "High demand" ? "success" : result.status === "Moderate demand" ? "warning" : "default"}>{result.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Potential users" value={String(result.potentialUsers)} />
            <Stat label="Total interested in area" value={String(result.totalLocationUsers)} />
          </div>
          <div className="space-y-3">
            {components.map((c) => (
              <div key={c.label}>
                <div className="flex items-center justify-between text-sm">
                  <span>{c.label}</span>
                  <span className="font-tabular text-muted-foreground">{formatPercent(c.value)}</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, c.value)}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            Score = 35% demand coverage + 25% location popularity + 20% size fit + 20% affordability fit — see spec for the exact formula.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-tabular text-sm font-semibold">{value}</dd>
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
