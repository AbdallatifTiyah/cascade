import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = { title: "Reservation Confirmed" };

export default async function ReservationConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const locale = getLocale();
  const t = getDictionary(locale).reservationConfirmed;
  const { id } = await params;

  const reservation = await db.reservation.findUnique({
    where: { id },
    include: { apartment: true, project: { include: { location: true } } },
  });
  if (!reservation || reservation.userId !== user.id) notFound();

  return (
    <div className="mx-auto max-w-lg space-y-6 text-center">
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="h-9 w-9 text-success" />
        </div>
      </div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t.title}</h1>
        <p className="mt-1 text-muted-foreground">{t.welcomeTo} {reservation.project.name}.</p>
      </div>

      <Card>
        <CardContent className="space-y-3 p-6 text-left">
          <Row label={t.reservationId} value={reservation.code} />
          <Row label={t.project} value={`${reservation.project.name} · ${reservation.project.location.name}`} />
          <Row label={t.apartment} value={`${reservation.apartment.code} · ${reservation.apartment.area} m²`} />
          <Row label={t.reservationDate} value={formatDate(reservation.createdAt)} />
        </CardContent>
      </Card>

      <Card className="bg-secondary/50 text-left">
        <CardContent className="space-y-2 p-6">
          <p className="text-sm font-semibold">{t.nextSteps}</p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>· {t.step1}</li>
            <li>· {t.step2}</li>
            <li>· {t.step3}</li>
          </ul>
        </CardContent>
      </Card>

      <LinkButton href="/my-project" size="lg" className="w-full">
        {t.viewMyProject}
      </LinkButton>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right font-tabular text-sm font-semibold">{value}</span>
    </div>
  );
}
