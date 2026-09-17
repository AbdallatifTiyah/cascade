import type { Metadata } from "next";
import { Users, TrendingUp, Target, Landmark, Building2, ClipboardCheck, Wallet, PiggyBank } from "lucide-react";
import { db } from "@/lib/db";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SimpleBarChart } from "@/components/charts/simple-bar-chart";
import { getDemandOverview, getDemandSegment } from "@/lib/demand/segments";
import { getAllLandsWithScore } from "@/lib/land/matching";
import { formatCurrency, formatCompactCurrency } from "@/lib/currency";
import { bedroomLabel, timelineLabel } from "@/lib/constants";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const [totalUsers, qualifiedLeads, activeProjects, reservationsCount, priceAgg, overview, overallSegment, landScores] = await Promise.all([
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.user.count({ where: { role: "CUSTOMER", leadStatus: { in: ["INTERESTED", "MATCHED", "RESERVED", "COMPLETED"] } } }),
    db.project.count({ where: { status: { not: "DRAFT" } } }),
    db.reservation.count({ where: { status: "CONFIRMED" } }),
    db.apartment.aggregate({ _sum: { price: true } }),
    getDemandOverview(),
    getDemandSegment({}),
    getAllLandsWithScore(),
  ]);

  const potentialProjects = landScores.filter((l) => l.land.status !== "ACQUIRED" && l.result.score >= 50).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Overview of demand, projects, and pipeline health.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Total users" value={formatNumberLike(totalUsers)} icon={Users} />
        <StatCard label="Active demand" value={formatNumberLike(overview.totalUsers)} icon={TrendingUp} hint="Users with a property profile" />
        <StatCard label="Qualified leads" value={formatNumberLike(qualifiedLeads)} icon={Target} />
        <StatCard label="Potential projects" value={formatNumberLike(potentialProjects)} icon={Landmark} hint="Lands with strong demand" />
        <StatCard label="Active projects" value={formatNumberLike(activeProjects)} icon={Building2} />
        <StatCard label="Reservations" value={formatNumberLike(reservationsCount)} icon={ClipboardCheck} />
        <StatCard label="Avg. monthly budget" value={formatCurrency(overallSegment.avgMonthlyBudget)} icon={Wallet} />
        <StatCard label="Avg. down payment" value={formatCurrency(overallSegment.avgDownPayment)} icon={PiggyBank} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total pipeline value</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-tabular text-3xl font-semibold">{formatCompactCurrency(priceAgg._sum.price ?? 0)}</p>
          <p className="mt-1 text-sm text-muted-foreground">Combined listed value of all apartment inventory across active projects.</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Demand by location</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={overview.byLocation.map((l) => ({ label: l.name, value: l.count }))} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Budget distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={overview.budgetBuckets.map((b) => ({ label: b.label, value: b.count }))} color="hsl(var(--primary))" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Bedrooms distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={overview.byBedrooms.map((b) => ({ label: bedroomLabel(b.bedrooms), value: b.count }))} color="hsl(var(--success))" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Apartment size demand</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={overview.sizeBuckets.map((b) => ({ label: b.label, value: b.count }))} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Timeline demand</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={overview.byTimeline.map((t) => ({ label: timelineLabel(t.timeline), value: t.count }))} color="hsl(var(--primary))" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function formatNumberLike(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}
