import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { propertyPreferenceSchema } from "@/lib/validation/onboarding";
import { recordAudit, trackEvent } from "@/lib/audit";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = propertyPreferenceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const data = parsed.data;
  const userId = session.user.id;

  await db.propertyPreference.upsert({
    where: { userId },
    create: {
      userId,
      propertyType: data.propertyType,
      bedrooms: data.bedrooms,
      minSize: data.minSize,
      maxSize: data.maxSize,
      downPaymentMin: data.downPaymentMin,
      downPaymentMax: data.downPaymentMax,
      monthlyMin: data.monthlyMin,
      monthlyMax: data.monthlyMax,
      durationMinYears: data.durationMinYears,
      durationMaxYears: data.durationMaxYears,
      timeline: data.timeline,
      amenities: JSON.stringify(data.amenities),
      locations: { create: data.locationIds.map((locationId) => ({ locationId })) },
    },
    update: {
      propertyType: data.propertyType,
      bedrooms: data.bedrooms,
      minSize: data.minSize,
      maxSize: data.maxSize,
      downPaymentMin: data.downPaymentMin,
      downPaymentMax: data.downPaymentMax,
      monthlyMin: data.monthlyMin,
      monthlyMax: data.monthlyMax,
      durationMinYears: data.durationMinYears,
      durationMaxYears: data.durationMaxYears,
      timeline: data.timeline,
      amenities: JSON.stringify(data.amenities),
      locations: {
        deleteMany: {},
        create: data.locationIds.map((locationId) => ({ locationId })),
      },
    },
  });

  await db.user.update({
    where: { id: userId },
    data: {
      onboardingDone: true,
      onboardingStep: 7,
      leadStatus: "MATCHED",
      employmentStatus: data.employmentStatus,
      jobTitle: data.jobTitle || null,
      employerName: data.employerName || null,
      industry: data.industry || null,
      monthlyIncome: data.monthlyIncome ?? null,
      yearsExperience: data.yearsExperience ?? null,
    },
  });

  await recordAudit({ actorId: userId, action: "PROPERTY_PROFILE_SAVED", entityType: "PropertyPreference", entityId: userId });
  await trackEvent({ userId, name: "property_profile_created" });
  await trackEvent({ userId, name: "onboarding_completed" });

  return NextResponse.json({ ok: true });
}
