import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { calculateProjectDemandCoverage } from "@/lib/demand/coverage";
import { calculateProjectFeasibility } from "@/lib/feasibility/engine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProjectStatusControl } from "@/components/admin/project-status-control";
import { ConstructionStageEditor } from "@/components/admin/construction-stage-editor";
import { AnnouncementForm } from "@/components/admin/announcement-form";
import { formatCurrency, formatPercent } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { APARTMENT_STATUS_STYLE } from "@/lib/apartments";
import { PROJECT_STATUS_LABEL } from "@/lib/constants";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const project = await db.project.findUnique({ where: { id } });
  return { title: project?.name ?? "Project" };
}

export default async function AdminProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await db.project.findUnique({
    where: { id },
    include: {
      location: true,
      land: true,
      apartments: { orderBy: [{ floor: "desc" }, { code: "asc" }] },
      participants: { include: { user: true, apartment: true }, orderBy: { joinedAt: "desc" } },
      reservations: { include: { user: true, apartment: true }, orderBy: { createdAt: "desc" } },
      constructionStages: { orderBy: { sequence: "asc" } },
      updates: { orderBy: { publishedAt: "desc" } },
    },
  });
  if (!project) notFound();

  const coverage = await calculateProjectDemandCoverage(project.id);
  const totalRevenue = project.apartments.reduce((s, a) => s + a.price, 0);
  const avgPrice = project.apartments.length ? totalRevenue / project.apartments.length : 0;
  const feasibility = calculateProjectFeasibility({
    landCost: project.landCostEstimate,
    constructionCost: project.constructionCostEstimate,
    otherCosts: project.otherCostsEstimate,
    numApartments: project.totalApartments,
    avgApartmentPrice: avgPrice,
    potentialParticipants: coverage.highlyMatchedUsers,
  });

  const plans = await db.paymentPlan.findMany({
    where: { reservation: { projectId: project.id } },
    include: { payments: true, reservation: { include: { user: true, apartment: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{project.location.name}</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{project.name}</h1>
        </div>
        <ProjectStatusControl projectId={project.id} currentStatus={project.status} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="apartments">Apartments</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="construction">Construction</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Demand</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="font-tabular text-2xl font-semibold">{coverage.requiredParticipants}</p>
                  <p className="text-xs text-muted-foreground">Apartments</p>
                </div>
                <div>
                  <p className="font-tabular text-2xl font-semibold">{coverage.highlyMatchedUsers}</p>
                  <p className="text-xs text-muted-foreground">Highly matched</p>
                </div>
                <div>
                  <p className="font-tabular text-2xl font-semibold text-accent">{formatPercent(coverage.demandCoveragePercent)}</p>
                  <p className="text-xs text-muted-foreground">Coverage</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Financial overview (estimated)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Row label="Total cost" value={formatCurrency(feasibility.totalCost)} />
                <Row label="Total revenue" value={formatCurrency(feasibility.totalRevenue)} />
                <Row label="Gross margin" value={`${formatCurrency(feasibility.grossMargin)} (${formatPercent(feasibility.grossMarginPercent, 1)})`} />
                <Badge variant={feasibility.marginIndicator === "Strong" ? "success" : feasibility.marginIndicator === "Moderate" ? "warning" : "destructive"}>
                  {feasibility.marginIndicator} margin
                </Badge>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Project details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-5 sm:grid-cols-4">
                <Stat label="Status" value={PROJECT_STATUS_LABEL[project.status]} />
                <Stat label="Floors" value={String(project.totalFloors)} />
                <Stat label="Apartments" value={String(project.totalApartments)} />
                <Stat label="Est. delivery" value={formatDate(project.estimatedDeliveryDate, { month: "long", year: "numeric" })} />
                <Stat label="Land" value={project.land?.name ?? "Not linked"} />
                <Stat label="Participants" value={String(project.participants.length)} />
                <Stat label="Reservations" value={String(project.reservations.length)} />
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apartments" className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Bedrooms</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Annual fees</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {project.apartments.map((a) => {
                const style = APARTMENT_STATUS_STYLE[a.status] ?? APARTMENT_STATUS_STYLE.UNAVAILABLE;
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-tabular font-medium">
                      <Link href={`/admin/apartments/${a.id}`} className="hover:underline">
                        {a.code}
                      </Link>
                    </TableCell>
                    <TableCell>{a.floor}</TableCell>
                    <TableCell className="font-tabular">{a.area} m²</TableCell>
                    <TableCell>{a.bedrooms}</TableCell>
                    <TableCell className="font-tabular">{formatCurrency(a.price)}</TableCell>
                    <TableCell className="font-tabular text-muted-foreground">
                      {formatCurrency(a.serviceFeeAnnual + a.managementFeeAnnual + a.maintenanceFeeAnnual)}/yr
                    </TableCell>
                    <TableCell>
                      <Badge className={style.className} variant="outline">
                        {style.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="participants" className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participant</TableHead>
                <TableHead>Apartment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {project.participants.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    {p.user.firstName} {p.user.lastName}
                  </TableCell>
                  <TableCell className="font-tabular">{p.apartment?.code ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{p.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(p.joinedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="payments" className="mt-6 space-y-4">
          {plans.map((plan) => {
            const paid = plan.payments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
            return (
              <Card key={plan.id}>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base">
                    {plan.reservation.user.firstName} {plan.reservation.user.lastName} · {plan.reservation.apartment.code}
                  </CardTitle>
                  <span className="font-tabular text-sm text-muted-foreground">
                    {formatCurrency(paid)} / {formatCurrency(plan.totalAmount)} paid
                  </span>
                </CardHeader>
              </Card>
            );
          })}
          {plans.length === 0 && <p className="text-sm text-muted-foreground">No payment plans yet.</p>}
        </TabsContent>

        <TabsContent value="construction" className="mt-6">
          <ConstructionStageEditor stages={project.constructionStages} />
        </TabsContent>

        <TabsContent value="announcements" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post an announcement</CardTitle>
            </CardHeader>
            <CardContent>
              <AnnouncementForm projectId={project.id} />
            </CardContent>
          </Card>
          <div className="space-y-3">
            {project.updates.map((u) => (
              <Card key={u.id} className="p-4">
                <p className="text-sm font-medium">{u.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{u.body}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">{formatDate(u.publishedAt)}</p>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-semibold">{value}</dd>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-tabular text-sm font-semibold">{value}</span>
    </div>
  );
}
