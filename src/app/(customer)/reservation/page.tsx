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

export const metadata: Metadata = { title: "Confirm Reservation" };

export default async function ReservationReviewPage({ searchParams }: { searchParams: Promise<{ apartmentId?: string }> }) {
  const user = await requireUser();
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
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Confirm your reservation</h1>
        <p className="mt-1 text-sm text-muted-foreground">Review the details below before reserving this apartment.</p>
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
            <span className="text-sm text-muted-foreground">Apartment</span>
            <span className="font-tabular font-semibold">
              {apartment.code} · {apartment.area} m² · {apartment.bedrooms} bed
            </span>
          </div>
          <Row label="Initial payment" value={formatCurrency(plan.downPayment)} />
          <Row label="Monthly payment" value={`${formatCurrency(plan.monthlyPaymentDisplay, true)}/mo`} />
          <Row label="Duration" value={`${apartment.durationMonths} months`} />
          <div className="border-t border-border pt-4">
            <Row label="Estimated total" value={formatCurrency(plan.totalPrice)} emphasize />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant={apartment.status === "AVAILABLE" ? "success" : "destructive"}>{apartment.status}</Badge>
          </div>
        </CardContent>
      </Card>

      {alreadyJoined ? (
        <p className="rounded-xl border border-border bg-secondary p-4 text-sm text-muted-foreground">
          You've already joined this project. View your progress in{" "}
          <a href="/my-project" className="font-medium text-foreground underline underline-offset-4">
            My Project
          </a>
          .
        </p>
      ) : apartment.status !== "AVAILABLE" ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          This apartment is no longer available. Please choose a different unit.
        </p>
      ) : (
        <ConfirmReservationButton apartmentId={apartment.id} />
      )}

      <p className="text-center text-xs text-muted-foreground">
        Pricing shown reflects current project figures and becomes your confirmed plan upon reservation.
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
