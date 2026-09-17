import { Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { bedroomLabel, timelineLabel, PROPERTY_TYPES } from "@/lib/constants";

export interface PropertyProfileData {
  locationNames: string[];
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
  timeline: string;
}

export function PropertyProfileCard({ profile, compact }: { profile: PropertyProfileData; compact?: boolean }) {
  const propertyTypeLabel = PROPERTY_TYPES.find((p) => p.value === profile.propertyType)?.label ?? profile.propertyType;

  const fields = [
    { label: "Location", value: profile.locationNames.join(", ") },
    { label: "Property", value: propertyTypeLabel },
    { label: "Bedrooms", value: bedroomLabel(profile.bedrooms) },
    { label: "Size", value: `${Math.round(profile.minSize)}–${Math.round(profile.maxSize)} m²` },
    { label: "Down payment", value: `${formatCurrency(profile.downPaymentMin)}–${formatCurrency(profile.downPaymentMax)}` },
    { label: "Monthly budget", value: `${formatCurrency(profile.monthlyMin)}–${formatCurrency(profile.monthlyMax)}` },
    { label: "Duration", value: `${profile.durationMinYears}–${profile.durationMaxYears} years` },
    { label: "Timeline", value: timelineLabel(profile.timeline) },
  ];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Your Property Profile</CardTitle>
        <LinkButton href="/onboarding" variant="outline" size="sm">
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </LinkButton>
      </CardHeader>
      <CardContent>
        <dl className={compact ? "grid grid-cols-2 gap-4 sm:grid-cols-4" : "grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4"}>
          {fields.map((f) => (
            <div key={f.label}>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{f.label}</dt>
              <dd className="mt-1 font-tabular text-sm font-semibold text-foreground">{f.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
