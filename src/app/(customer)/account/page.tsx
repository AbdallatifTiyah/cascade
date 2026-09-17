import type { Metadata } from "next";
import { FileText, CreditCard } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PersonalInfoForm } from "@/components/account/personal-info-form";
import { PasswordForm } from "@/components/account/password-form";
import { LogoutButton } from "@/components/account/logout-button";
import { PropertyProfileCard } from "@/components/projects/property-profile-card";
import { Avatar } from "@/components/ui/avatar";

export const metadata: Metadata = { title: "Profile" };

export default async function AccountPage() {
  const user = await requireUser();
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
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="property">Property Profile</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal information</CardTitle>
            </CardHeader>
            <CardContent>
              <PersonalInfoForm user={{ firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone }} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="property" className="mt-6 space-y-6">
          {preference ? (
            <PropertyProfileCard
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
            <EmptyState title="No property profile yet" description="Complete onboarding to build your property plan." />
          )}

          <Card>
            <CardHeader className="flex-row items-center gap-2 space-y-0">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <CardTitle>Payment methods</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Cascade currently tracks your payment plan as a structured ledger. Card and bank payment methods aren't connected yet.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <EmptyState icon={FileText} title="No documents yet" description="Reservation and payment documents will appear here once available." />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change password</CardTitle>
            </CardHeader>
            <CardContent>
              <PasswordForm />
            </CardContent>
          </Card>
          <LogoutButton />
        </TabsContent>
      </Tabs>
    </div>
  );
}
