import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BedDouble, Bath, Ruler, Building2, Car, Eye, Layers } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ProjectCover } from "@/components/ui/cover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { FinancialPlanCard } from "@/components/projects/financial-plan-card";
import { APARTMENT_STATUS_STYLE } from "@/lib/apartments";
import { amenityLabel } from "@/lib/constants";
import { trackEvent } from "@/lib/audit";

export async function generateMetadata({ params }: { params: Promise<{ slug: string; unitId: string }> }): Promise<Metadata> {
  const { unitId } = await params;
  const apartment = await db.apartment.findUnique({ where: { id: unitId } });
  return { title: apartment ? `Apartment ${apartment.code}` : "Apartment" };
}

export default async function ApartmentDetailPage({ params }: { params: Promise<{ slug: string; unitId: string }> }) {
  const { slug, unitId } = await params;
  const apartment = await db.apartment.findUnique({
    where: { id: unitId },
    include: { project: { include: { location: true } } },
  });
  if (!apartment || apartment.project.slug !== slug) notFound();

  const session = await auth();
  await trackEvent({ userId: session?.user?.id, name: "apartment_viewed", metadata: { apartmentId: apartment.id } });
  const features: string[] = JSON.parse(apartment.features || "[]");
  const style = APARTMENT_STATUS_STYLE[apartment.status] ?? APARTMENT_STATUS_STYLE.UNAVAILABLE;
  const isAvailable = apartment.status === "AVAILABLE";

  const reserveHref = `/reservation?apartmentId=${apartment.id}`;
  const ctaHref = session?.user ? reserveHref : `/login?callbackUrl=${encodeURIComponent(reserveHref)}`;

  const specs = [
    { icon: Layers, label: "Floor", value: `${apartment.floor}` },
    { icon: Ruler, label: "Area", value: `${apartment.area} m²` },
    { icon: BedDouble, label: "Bedrooms", value: `${apartment.bedrooms}` },
    { icon: Bath, label: "Bathrooms", value: `${apartment.bathrooms}` },
    { icon: Building2, label: "Balcony", value: apartment.hasBalcony ? "Yes" : "No" },
    { icon: Eye, label: "View", value: apartment.view },
    { icon: Car, label: "Parking", value: apartment.parkingIncluded ? "Included" : "Not included" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          {apartment.project.name} · {apartment.project.location.name}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Apartment {apartment.code}</h1>
          <Badge className={style.className} variant="outline">
            {style.label}
          </Badge>
        </div>
      </div>

      <ProjectCover theme={apartment.project.coverTheme} className="h-48 rounded-2xl sm:h-64" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Apartment details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-5 sm:grid-cols-4">
                {specs.map((s) => (
                  <div key={s.label}>
                    <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <s.icon className="h-3.5 w-3.5" /> {s.label}
                    </dt>
                    <dd className="mt-1 font-tabular text-sm font-semibold">{s.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6 border-t border-border pt-5">
                <p className="mb-2 text-sm font-medium">Included</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Open-plan living &amp; dining</Badge>
                  <Badge variant="outline">Fully fitted kitchen</Badge>
                  {features.map((f) => (
                    <Badge key={f} variant="outline">
                      {amenityLabel(f)}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <FinancialPlanCard totalPrice={apartment.price} downPayment={apartment.downPayment} durationMonths={apartment.durationMonths} />

          {isAvailable ? (
            <LinkButton href={ctaHref} size="lg" className="w-full">
              Reserve This Apartment
            </LinkButton>
          ) : (
            <div className="rounded-xl border border-border bg-secondary p-4 text-center text-sm text-muted-foreground">
              This apartment is {style.label.toLowerCase()} and can't be reserved right now.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
