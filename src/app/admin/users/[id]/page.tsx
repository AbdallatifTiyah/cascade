import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getRecommendedProjects } from "@/lib/matching/service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { MatchBadge } from "@/components/ui/match-badge";
import { LeadStatusControl } from "@/components/admin/lead-status-control";
import { PropertyProfileCard } from "@/components/projects/property-profile-card";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { employmentStatusLabel } from "@/lib/constants";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const user = await db.user.findUnique({ where: { id } });
  return { title: user ? `${user.firstName} ${user.lastName}` : "User" };
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await db.user.findUnique({
    where: { id },
    include: { preference: { include: { locations: { include: { location: true } } } } },
  });
  if (!user) notFound();

  const [reservations, events, matches] = await Promise.all([
    db.reservation.findMany({ where: { userId: id }, include: { project: true, apartment: true, paymentPlan: { include: { payments: true } } } }),
    db.analyticsEvent.findMany({ where: { userId: id }, orderBy: { createdAt: "desc" }, take: 15 }),
    user.preference ? getRecommendedProjects(id) : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar firstName={user.firstName} lastName={user.lastName} className="h-12 w-12 text-base" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{user.firstName} {user.lastName}</h1>
            <p className="text-sm text-muted-foreground">{user.email}{user.phone ? ` · ${user.phone}` : ""}</p>
          </div>
        </div>
        <LeadStatusControl userId={user.id} currentStatus={user.leadStatus} />
      </div>

      {user.preference ? (
        <PropertyProfileCard
          profile={{
            locationNames: user.preference.locations.map((l) => l.location.name),
            propertyType: user.preference.propertyType,
            bedrooms: user.preference.bedrooms,
            minSize: user.preference.minSize,
            maxSize: user.preference.maxSize,
            downPaymentMin: user.preference.downPaymentMin,
            downPaymentMax: user.preference.downPaymentMax,
            monthlyMin: user.preference.monthlyMin,
            monthlyMax: user.preference.monthlyMax,
            durationMinYears: user.preference.durationMinYears,
            durationMaxYears: user.preference.durationMaxYears,
            timeline: user.preference.timeline,
          }}
        />
      ) : (
        <Card>
          <CardContent className="p-5 text-sm text-muted-foreground">This user hasn't completed onboarding yet.</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Employment &amp; business</CardTitle>
        </CardHeader>
        <CardContent>
          {user.employmentStatus ? (
            <dl className="grid grid-cols-2 gap-5 sm:grid-cols-3">
              <Stat label="Status" value={employmentStatusLabel(user.employmentStatus)} />
              <Stat label="Job title" value={user.jobTitle || "—"} />
              <Stat label="Company / business" value={user.employerName || "—"} />
              <Stat label="Industry" value={user.industry || "—"} />
              <Stat label="Years of experience" value={user.yearsExperience != null ? String(user.yearsExperience) : "—"} />
              <Stat label="Monthly income" value={user.monthlyIncome != null ? formatCurrency(user.monthlyIncome) : "—"} />
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">No employment information provided yet.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top matched projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {matches.slice(0, 5).map(({ project, match }) => (
              <div key={project.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="text-sm font-medium">{project.name}</span>
                <MatchBadge score={match.overallScore} />
              </div>
            ))}
            {matches.length === 0 && <p className="text-sm text-muted-foreground">No matches yet.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reservations &amp; payments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reservations.map((r) => {
              const paid = r.paymentPlan?.payments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0) ?? 0;
              return (
                <div key={r.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{r.project.name} · {r.apartment.code}</span>
                    <Badge variant="success">{r.status}</Badge>
                  </div>
                  {r.paymentPlan && (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {formatCurrency(paid)} / {formatCurrency(r.paymentPlan.totalAmount)} paid
                    </p>
                  )}
                </div>
              );
            })}
            {reservations.length === 0 && <p className="text-sm text-muted-foreground">No reservations yet.</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
          ) : (
            <ul className="space-y-2">
              {events.map((e) => (
                <li key={e.id} className="flex items-center justify-between text-sm">
                  <span>{e.name.replace(/_/g, " ")}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(e.createdAt, { hour: "numeric", minute: "2-digit" })}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
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
