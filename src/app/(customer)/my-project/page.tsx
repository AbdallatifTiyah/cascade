import type { Metadata } from "next";
import { MapPin, Megaphone } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ConstructionTimeline } from "@/components/projects/construction-timeline";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { PROJECT_STATUS_LABEL } from "@/lib/constants";
import { Building2 } from "lucide-react";

export const metadata: Metadata = { title: "My Project" };

export default async function MyProjectPage() {
  const user = await requireUser();

  const reservations = await db.reservation.findMany({
    where: { userId: user.id, status: "CONFIRMED" },
    include: {
      apartment: true,
      project: { include: { location: true, constructionStages: { orderBy: { sequence: "asc" } }, updates: { orderBy: { publishedAt: "desc" }, take: 3 } } },
      paymentPlan: { include: { payments: { orderBy: { dueDate: "asc" } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (reservations.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="You haven't joined a project yet"
        description="Once you reserve an apartment, you'll be able to track construction and payments here."
        action={
          <LinkButton href="/projects" size="sm">
            Explore projects
          </LinkButton>
        }
      />
    );
  }

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">My Project</h1>

      {reservations.map((reservation) => {
        const stages = reservation.project.constructionStages;
        const completedStages = stages.filter((s) => s.status === "COMPLETE").length;
        const constructionProgress = stages.length > 0 ? (completedStages / stages.length) * 100 : 0;

        const payments = reservation.paymentPlan?.payments ?? [];
        const paidAmount = payments.filter((p) => p.status === "PAID").reduce((sum, p) => sum + p.amount, 0);
        const totalAmount = reservation.paymentPlan?.totalAmount ?? 0;
        const paymentProgress = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;
        const nextPayment = payments.find((p) => p.status === "UPCOMING" || p.status === "OVERDUE");

        return (
          <div key={reservation.id} className="space-y-6">
            <Card>
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle>{reservation.project.name}</CardTitle>
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {reservation.project.location.name} · Apartment {reservation.apartment.code}
                  </p>
                </div>
                <Badge variant="success">{PROJECT_STATUS_LABEL[reservation.project.status]}</Badge>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Construction progress</span>
                      <span className="font-tabular text-muted-foreground">{Math.round(constructionProgress)}%</span>
                    </div>
                    <Progress value={constructionProgress} className="mt-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Payment progress</span>
                      <span className="font-tabular text-muted-foreground">{Math.round(paymentProgress)}%</span>
                    </div>
                    <Progress value={paymentProgress} className="mt-2" indicatorClassName="bg-accent" />
                  </div>
                </div>

                {nextPayment && (
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-secondary/50 p-4">
                    <div>
                      <p className="text-sm font-medium">Next payment</p>
                      <p className="text-xs text-muted-foreground">Due {formatDate(nextPayment.dueDate)}</p>
                    </div>
                    <p className="font-tabular text-lg font-semibold">{formatCurrency(nextPayment.amount)}</p>
                  </div>
                )}

                <div className="mt-4 flex gap-3">
                  <LinkButton href="/payments" variant="outline" size="sm">
                    View payment plan
                  </LinkButton>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Construction timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <ConstructionTimeline stages={stages} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex-row items-center gap-2 space-y-0">
                  <Megaphone className="h-4 w-4 text-muted-foreground" />
                  <CardTitle>Project announcements</CardTitle>
                </CardHeader>
                <CardContent>
                  {reservation.project.updates.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No announcements yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {reservation.project.updates.map((update) => (
                        <div key={update.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                          <p className="text-sm font-medium">{update.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{update.body}</p>
                          <p className="mt-1.5 text-xs text-muted-foreground">{formatDate(update.publishedAt)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );
      })}
    </div>
  );
}
