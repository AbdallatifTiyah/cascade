import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { MapPin } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { calculateMonthlyPayment } from "@/lib/finance";
import { ConfirmReservationButton } from "@/components/reservation/confirm-reservation-button";
import { trackEvent } from "@/lib/audit";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n";
import { localizedApartmentStatus } from "@/lib/i18n/labels";
import { APARTMENT_STATUS_STYLE } from "@/lib/apartments";

export const metadata: Metadata = { title: "Confirm Reservation" };

export default async function ReservationReviewPage({ searchParams }: { searchParams: Promise<{ apartmentId?: string }> }) {
  const user = await requireUser();
  const locale = getLocale();
  const t = getDictionary(locale).reservationReview;
  const { apartmentId } = await searchParams;
  if (!apartmentId) redirect("/projects");

  const apartment = await db.apartment.findUnique({
    where: { id: apartmentId },
    include: { project: { include: { location: true } } },
  });
  if (!apartment) notFound();

  await trackEvent({ userId: user.id, name: "reservation_started", metadata: { apartmentId: apartment.id } });

  const alreadyJoined = await db.projectParticipant.findUnique({
    where: { projectId_userId: { projectId: apartment.projectId, userId: user.id } },
  });

  const plan = calculateMonthlyPayment({
    totalPrice: apartment.price,
    downPayment: apartment.downPayment,
    durationMonths: apartment.durationMonths,
  });

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{apartment.project.name}</CardTitle>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> {apartment.project.location.name}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">{t.apartment}</span>
            <span className="font-tabular font-semibold">
              {apartment.code} · {apartment.area} m² · {apartment.bedrooms} {locale === "ar" ? "غرف" : "bed"}
            </span>
          </div>
          <Row label={t.initialPayment} value={formatCurrency(plan.downPayment)} />
          <Row label={t.monthlyPayment} value={`${formatCurrency(plan.monthlyPaymentDisplay, true)}/mo`} />
          <Row label={t.duration} value={`${apartment.durationMonths} ${t.monthsSuffix}`} />
          <div className="border-t border-border pt-4">
            <Row label={t.estimatedTotal} value={formatCurrency(plan.totalPrice)} emphasize />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t.status}</span>
            <Badge variant={apartment.status === "AVAILABLE" ? "success" : "destructive"}>
              {localizedApartmentStatus(apartment.status, locale, APARTMENT_STATUS_STYLE[apartment.status]?.label ?? apartment.status)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {alreadyJoined ? (
        <p className="rounded-xl border border-border bg-secondary p-4 text-sm text-muted-foreground">
          {t.alreadyJoined}{" "}
          <a href="/my-project" className="font-medium text-foreground underline underline-offset-4">
            {locale === "ar" ? "مشروعي" : "My Project"}
          </a>
        </p>
      ) : apartment.status !== "AVAILABLE" ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {t.unavailable}
        </p>
      ) : (
        <ConfirmReservationButton apartmentId={apartment.id} locale={locale} />
      )}

      <p className="text-center text-xs text-muted-foreground">
        {t.disclaimer}
      </p>
    </div>
  );
}

function Row({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={emphasize ? "font-tabular text-lg font-semibold text-accent" : "font-tabular text-sm font-medium"}>{value}</span>
    </div>
  );
}
