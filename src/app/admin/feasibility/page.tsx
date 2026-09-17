import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getLandDemandMatch } from "@/lib/land/matching";
import { calculateProjectDemandCoverage } from "@/lib/demand/coverage";
import { FeasibilityCalculator, type FeasibilityInitial } from "@/components/admin/feasibility-calculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatPercent } from "@/lib/currency";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Feasibility" };

async function buildInitial(landId?: string, projectId?: string): Promise<FeasibilityInitial> {
  if (landId) {
    const { land, estimate, result } = await getLandDemandMatch(landId);
    return {
      landId,
      landCost: Math.round(estimate.estimatedLandCost),
      constructionCost: Math.round(estimate.estimatedConstructionCost),
      otherCosts: Math.round(estimate.estimatedOtherCosts),
      numApartments: land.potentialApartments,
      avgApartmentPrice: Math.round(estimate.estimatedApartmentPrice),
      potentialParticipants: result.potentialUsers,
      contextLabel: `Prefilled from ${land.name}`,
    };
  }
  if (projectId) {
    const project = await db.project.findUnique({ where: { id: projectId }, include: { apartments: true } });
    if (project) {
      const coverage = await calculateProjectDemandCoverage(projectId);
      const avgPrice = project.apartments.length
        ? project.apartments.reduce((s, a) => s + a.price, 0) / project.apartments.length
        : 0;
      return {
        projectId,
        landCost: Math.round(project.landCostEstimate),
        constructionCost: Math.round(project.constructionCostEstimate),
        otherCosts: Math.round(project.otherCostsEstimate),
        numApartments: project.totalApartments,
        avgApartmentPrice: Math.round(avgPrice),
        potentialParticipants: coverage.highlyMatchedUsers,
        contextLabel: `Prefilled from ${project.name}`,
      };
    }
  }
  return {
    landCost: 200000,
    constructionCost: 400000,
    otherCosts: 50000,
    numApartments: 16,
    avgApartmentPrice: 42000,
    potentialParticipants: 20,
  };
}

export default async function FeasibilityPage({ searchParams }: { searchParams: Promise<{ landId?: string; projectId?: string }> }) {
  const { landId, projectId } = await searchParams;
  const initial = await buildInitial(landId, projectId);

  const [lands, projects, recentRuns] = await Promise.all([
    db.land.findMany({ where: { status: { not: "ARCHIVED" } }, orderBy: { createdAt: "desc" } }),
    db.project.findMany({ orderBy: { createdAt: "desc" } }),
    db.projectFeasibility.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Project Feasibility</h1>
        <p className="mt-1 text-sm text-muted-foreground">Model cost, revenue, and demand coverage before committing to a project.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Load from</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {lands.map((l) => (
            <Link key={l.id} href={`/admin/feasibility?landId=${l.id}`} className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-secondary">
              {l.name}
            </Link>
          ))}
          {projects.map((p) => (
            <Link key={p.id} href={`/admin/feasibility?projectId=${p.id}`} className="rounded-full border border-accent/30 bg-accent/5 px-3 py-1.5 text-xs hover:bg-accent/10">
              {p.name}
            </Link>
          ))}
        </CardContent>
      </Card>

      <FeasibilityCalculator initial={initial} key={landId ?? projectId ?? "default"} />

      {recentRuns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent feasibility runs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Total cost</TableHead>
                  <TableHead>Total revenue</TableHead>
                  <TableHead>Margin</TableHead>
                  <TableHead>Demand coverage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRuns.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="text-muted-foreground">{formatDate(run.createdAt)}</TableCell>
                    <TableCell className="font-tabular">{run.numApartments}</TableCell>
                    <TableCell className="font-tabular">{formatCurrency(run.totalCost)}</TableCell>
                    <TableCell className="font-tabular">{formatCurrency(run.totalRevenue)}</TableCell>
                    <TableCell className="font-tabular">{formatCurrency(run.grossMargin)}</TableCell>
                    <TableCell className="font-tabular">{formatPercent(run.demandCoverage)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
