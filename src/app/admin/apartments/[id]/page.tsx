import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ApartmentFeesForm } from "@/components/admin/apartment-fees-form";
import { formatCurrency } from "@/lib/currency";
import { APARTMENT_STATUS_STYLE } from "@/lib/apartments";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const apartment = await db.apartment.findUnique({ where: { id } });
  return { title: apartment ? `Apartment ${apartment.code}` : "Apartment" };
}

export default async function AdminApartmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const apartment = await db.apartment.findUnique({
    where: { id },
    include: { project: { include: { location: true } } },
  });
  if (!apartment) notFound();

  const style = APARTMENT_STATUS_STYLE[apartment.status] ?? APARTMENT_STATUS_STYLE.UNAVAILABLE;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href={`/admin/projects/${apartment.projectId}`} className="hover:underline">
              {apartment.project.name}
            </Link>{" "}
            · {apartment.project.location.name}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Apartment {apartment.code}</h1>
        </div>
        <Badge className={style.className} variant="outline">
          {style.label}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unit specs</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          <Stat label="Floor" value={String(apartment.floor)} />
          <Stat label="Area" value={`${apartment.area} m²`} />
          <Stat label="Bedrooms" value={String(apartment.bedrooms)} />
          <Stat label="Bathrooms" value={String(apartment.bathrooms)} />
          <Stat label="Current price" value={formatCurrency(apartment.price)} />
          <Stat label="Current down payment" value={formatCurrency(apartment.downPayment)} />
          <Stat label="Current monthly" value={formatCurrency(apartment.monthlyPayment)} />
          <Stat label="Current annual fees" value={formatCurrency(apartment.serviceFeeAnnual + apartment.managementFeeAnnual + apartment.maintenanceFeeAnnual)} />
        </CardContent>
      </Card>

      <ApartmentFeesForm
        apartment={{
          id: apartment.id,
          price: apartment.price,
          downPayment: apartment.downPayment,
          monthlyPayment: apartment.monthlyPayment,
          durationMonths: apartment.durationMonths,
          status: apartment.status,
          serviceFeeAnnual: apartment.serviceFeeAnnual,
          managementFeeAnnual: apartment.managementFeeAnnual,
          maintenanceFeeAnnual: apartment.maintenanceFeeAnnual,
        }}
      />
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
