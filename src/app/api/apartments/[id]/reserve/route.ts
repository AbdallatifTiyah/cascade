import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { buildPaymentSchedule, calculateMonthlyPayment } from "@/lib/finance";
import { recordAudit, trackEvent } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";

function reservationCode() {
  return `CSC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

/**
 * Reserving an apartment is a compare-and-swap on Apartment.status, not a
 * client-trusted flag. `updateMany` with `status: "AVAILABLE"` in the WHERE
 * clause only ever affects a row that is still available; if two requests
 * race for the same unit, exactly one `updateMany` reports count === 1 and
 * the other reports 0 and is rejected. This holds under SQLite (demo) and
 * Postgres (production) alike — no ORM-level locking required (spec #61).
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const { id: apartmentId } = await params;
  const userId = session.user.id;

  try {
    const reservation = await db.$transaction(async (tx) => {
      const apartment = await tx.apartment.findUnique({ where: { id: apartmentId } });
      if (!apartment) throw new Error("APARTMENT_NOT_FOUND");

      const existingParticipation = await tx.projectParticipant.findUnique({
        where: { projectId_userId: { projectId: apartment.projectId, userId } },
      });
      if (existingParticipation) throw new Error("ALREADY_JOINED");

      const claim = await tx.apartment.updateMany({
        where: { id: apartmentId, status: "AVAILABLE" },
        data: { status: "RESERVED" },
      });
      if (claim.count === 0) throw new Error("APARTMENT_UNAVAILABLE");

      const code = reservationCode();
      const startDate = new Date();

      const created = await tx.reservation.create({
        data: {
          code,
          userId,
          projectId: apartment.projectId,
          apartmentId: apartment.id,
          status: "CONFIRMED",
          confirmedAt: startDate,
        },
      });

      await tx.projectParticipant.create({
        data: { projectId: apartment.projectId, userId, apartmentId: apartment.id, status: "ALLOCATED" },
      });

      const schedule = buildPaymentSchedule({
        totalPrice: apartment.price,
        downPayment: apartment.downPayment,
        durationMonths: apartment.durationMonths,
        startDate,
      });
      const { monthlyPaymentDisplay } = calculateMonthlyPayment({
        totalPrice: apartment.price,
        downPayment: apartment.downPayment,
        durationMonths: apartment.durationMonths,
      });

      const plan = await tx.paymentPlan.create({
        data: {
          reservationId: created.id,
          totalAmount: apartment.price,
          downPayment: apartment.downPayment,
          remainingAmount: apartment.price - apartment.downPayment,
          monthlyAmount: monthlyPaymentDisplay,
          durationMonths: apartment.durationMonths,
          startDate,
        },
      });

      await tx.payment.createMany({
        data: schedule.map((entry) => ({
          paymentPlanId: plan.id,
          label: entry.label,
          amount: entry.amount,
          dueDate: entry.dueDate,
          status: "UPCOMING" as const,
        })),
      });

      await tx.user.update({ where: { id: userId }, data: { leadStatus: "RESERVED" } });

      return created;
    });

    await createNotification({
      userId,
      type: "RESERVATION",
      title: "Reservation confirmed",
      body: `Your reservation ${reservation.code} is confirmed. Welcome to the project!`,
    });
    await recordAudit({ actorId: userId, action: "APARTMENT_RESERVED", entityType: "Reservation", entityId: reservation.id });
    await trackEvent({ userId, name: "reservation_completed", metadata: { apartmentId } });

    return NextResponse.json({ reservationId: reservation.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "UNKNOWN";
    const responses: Record<string, { status: number; error: string }> = {
      APARTMENT_NOT_FOUND: { status: 404, error: "This apartment could not be found." },
      ALREADY_JOINED: { status: 409, error: "You've already joined this project with another apartment." },
      APARTMENT_UNAVAILABLE: { status: 409, error: "This apartment was just reserved by someone else. Please choose another unit." },
    };
    const response = responses[message] ?? { status: 500, error: "Something went wrong. Please try again." };
    return NextResponse.json({ error: response.error }, { status: response.status });
  }
}
