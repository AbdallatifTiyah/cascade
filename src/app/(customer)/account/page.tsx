import type { Metadata } from "next";
import { FileText, CreditCard } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PersonalInfoForm } from "@/components/account/personal-info-form";
import { EmploymentInfoForm } from "@/components/account/employment-info-form";
import { PasswordForm } from "@/components/account/password-form";
import { LogoutButton } from "@/components/account/logout-button";
import { PropertyProfileCard } from "@/components/projects/property-profile-card";
import { Avatar } from "@/components/ui/avatar";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = { title: "Profile" };

export default async function AccountPage() {
  const user = await requireUser();
  const locale = getLocale();
  const t = getDictionary(locale).accountPage;
  const preference = await db.propertyPreference.findUnique({
    where: { userId: user.id },
    include: { locations: { include: { location: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar firstName={user.firstName} lastName={user.lastName} className="h-14 w-14 text-lg" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{user.firstName} {user.lastName}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <Tabs defaultValue="personal">
        <TabsList>
          <TabsTrigger value="personal">{t.tabPersonal}</TabsTrigger>
          <TabsTrigger value="property">{t.tabProperty}</TabsTrigger>
          <TabsTrigger value="documents">{t.tabDocuments}</TabsTrigger>
          <TabsTrigger value="security">{t.tabSecurity}</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.personalInfoTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <PersonalInfoForm user={{ firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone }} locale={locale} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.employmentInfoTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <EmploymentInfoForm
                user={{
                  employmentStatus: user.employmentStatus,
                  jobTitle: user.jobTitle,
                  employerName: user.employerName,
                  industry: user.industry,
                  monthlyIncome: user.monthlyIncome,
                  yearsExperience: user.yearsExperience,
                }}
                locale={locale}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="property" className="mt-6 space-y-6">
          {preference ? (
            <PropertyProfileCard
              locale={locale}
              profile={{
                locationNames: preference.locations.map((l) => l.location.name),
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
                timeline: preference.timeline,
              }}
            />
          ) : (
            <EmptyState title={t.noPropertyTitle} description={t.noPropertyDesc} />
          )}

          <Card>
            <CardHeader className="flex-row items-center gap-2 space-y-0">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <CardTitle>{t.paymentMethodsTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t.paymentMethodsDesc}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <EmptyState icon={FileText} title={t.noDocumentsTitle} description={t.noDocumentsDesc} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.changePasswordTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <PasswordForm locale={locale} />
            </CardContent>
          </Card>
          <LogoutButton locale={locale} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
