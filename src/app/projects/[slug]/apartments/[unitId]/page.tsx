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
import { AnnualFeesCard } from "@/components/apartments/annual-fees-card";
import { InvestmentReturnCard } from "@/components/apartments/investment-return-card";
import { APARTMENT_STATUS_STYLE } from "@/lib/apartments";
import { amenityLabel } from "@/lib/constants";
import { trackEvent } from "@/lib/audit";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n";
import { localizedAmenity, localizedApartmentStatus } from "@/lib/i18n/labels";

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
  const locale = getLocale();
  const t = getDictionary(locale).apartmentDetailPage;
  await trackEvent({ userId: session?.user?.id, name: "apartment_viewed", metadata: { apartmentId: apartment.id } });
  const features: string[] = JSON.parse(apartment.features || "[]");
  const style = APARTMENT_STATUS_STYLE[apartment.status] ?? APARTMENT_STATUS_STYLE.UNAVAILABLE;
  const statusLabel = localizedApartmentStatus(apartment.status, locale, style.label);
  const isAvailable = apartment.status === "AVAILABLE";

  const reserveHref = `/reservation?apartmentId=${apartment.id}`;
  const ctaHref = session?.user ? reserveHref : `/login?callbackUrl=${encodeURIComponent(reserveHref)}`;

  const specs = [
    { icon: Layers, label: t.floor, value: `${apartment.floor}` },
    { icon: Ruler, label: t.area, value: `${apartment.area} m²` },
    { icon: BedDouble, label: t.bedrooms, value: `${apartment.bedrooms}` },
    { icon: Bath, label: t.bathrooms, value: `${apartment.bathrooms}` },
    { icon: Building2, label: t.balcony, value: apartment.hasBalcony ? t.yes : t.no },
    { icon: Eye, label: t.view, value: apartment.view },
    { icon: Car, label: t.parking, value: apartment.parkingIncluded ? t.included : t.notIncluded },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          {apartment.project.name} · {apartment.project.location.name}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t.titlePrefix} {apartment.code}</h1>
          <Badge className={style.className} variant="outline">
            {statusLabel}
          </Badge>
        </div>
      </div>

      <ProjectCover theme={apartment.project.coverTheme} className="h-48 rounded-2xl sm:h-64" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{locale === "ar" ? "تفاصيل الشقة" : "Apartment details"}</CardTitle>
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
                <p className="mb-2 text-sm font-medium">{t.includedTitle}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{t.openPlan}</Badge>
                  <Badge variant="outline">{t.fittedKitchen}</Badge>
                  {features.map((f) => (
                    <Badge key={f} variant="outline">
                      {localizedAmenity(f, locale, amenityLabel(f))}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <FinancialPlanCard totalPrice={apartment.price} downPayment={apartment.downPayment} durationMonths={apartment.durationMonths} locale={locale} />

          <InvestmentReturnCard price={apartment.price} expectedYieldAnnual={apartment.expectedYieldAnnual} locale={locale} />

          <AnnualFeesCard
            fees={{
              serviceFeeAnnual: apartment.serviceFeeAnnual,
              managementFeeAnnual: apartment.managementFeeAnnual,
              maintenanceFeeAnnual: apartment.maintenanceFeeAnnual,
            }}
            locale={locale}
          />

          {isAvailable ? (
            <LinkButton href={ctaHref} size="lg" className="w-full">
              {t.reserveButton}
            </LinkButton>
          ) : (
            <div className="rounded-xl border border-border bg-secondary p-4 text-center text-sm text-muted-foreground">
              {t.notAvailable}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
