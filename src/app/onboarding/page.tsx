import type { Metadata } from "next";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { OnboardingWizard, type OnboardingDraft } from "@/components/onboarding/onboarding-wizard";
import { getLocale } from "@/lib/i18n/get-locale";

export const metadata: Metadata = { title: "Build My Property Plan" };

export default async function OnboardingPage() {
  const user = await requireUser();
  const locale = getLocale();

  const [locations, preference] = await Promise.all([
    db.location.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    db.propertyPreference.findUnique({ where: { userId: user.id }, include: { locations: true } }),
  ]);

  let initialDraft: OnboardingDraft | undefined;
  if (preference) {
    initialDraft = {
      locationIds: preference.locations.map((l) => l.locationId),
      propertyType: preference.propertyType,
      bedrooms: preference.bedrooms,
      minSize: preference.minSize,
      maxSize: preference.maxSize,
      downPaymentMin: preference.downPaymentMin,
      downPaymentMax: preference.downPaymentMax,
      monthlyMin: preference.monthlyMin,
      monthlyMax: preference.monthlyMax,
      durationMinYears: preference.durationMinYears,
      durationMaxYears: preference.durationMaxYears,
      amenities: JSON.parse(preference.amenities || "[]"),
      timeline: preference.timeline,
      employmentStatus: user.employmentStatus ?? "",
      jobTitle: user.jobTitle ?? "",
      employerName: user.employerName ?? "",
      industry: user.industry ?? "",
      monthlyIncome: user.monthlyIncome ?? "",
      yearsExperience: user.yearsExperience ?? "",
    };
  }

  return (
    <div className="min-h-screen bg-background">
      <OnboardingWizard
        locations={locations.map((l) => ({ id: l.id, name: l.name, region: l.region }))}
        initialDraft={initialDraft}
        mode={preference ? "edit" : "create"}
        locale={locale}
      />
    </div>
  );
}
