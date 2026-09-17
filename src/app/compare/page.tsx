import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { Scale } from "lucide-react";

export const metadata: Metadata = { title: "Compare Apartments" };

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const { ids } = await searchParams;
  const idList = (ids ?? "").split(",").filter(Boolean).slice(0, 3);

  const apartments = idList.length
    ? await db.apartment.findMany({ where: { id: { in: idList } }, include: { project: true } })
    : [];

  if (apartments.length === 0) {
    return (
      <EmptyState
        icon={Scale}
        title="Nothing to compare yet"
        description="Select up to 3 apartments from a project's apartment list to compare them side by side."
        action={
          <LinkButton href="/projects" size="sm">
            Explore projects
          </LinkButton>
        }
      />
    );
  }

  const rows: { label: string; render: (a: (typeof apartments)[number]) => React.ReactNode }[] = [
    { label: "Project", render: (a) => a.project.name },
    { label: "Area", render: (a) => `${a.area} m²` },
    { label: "Floor", render: (a) => a.floor },
    { label: "Bedrooms", render: (a) => a.bedrooms },
    { label: "Bathrooms", render: (a) => a.bathrooms },
    { label: "View", render: (a) => a.view },
    { label: "Balcony", render: (a) => (a.hasBalcony ? "Yes" : "No") },
    { label: "Parking", render: (a) => (a.parkingIncluded ? "Included" : "Not included") },
    { label: "Price", render: (a) => formatCurrency(a.price) },
    { label: "Initial payment", render: (a) => formatCurrency(a.downPayment) },
    { label: "Monthly payment", render: (a) => `${formatCurrency(a.monthlyPayment)}/mo` },
    { label: "Duration", render: (a) => `${a.durationMonths} months` },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Compare apartments</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Spec</TableHead>
            {apartments.map((a) => (
              <TableHead key={a.id}>
                <Link href={`/projects/${a.project.slug}/apartments/${a.id}`} className="font-tabular text-sm font-semibold text-foreground hover:underline">
                  {a.code}
                </Link>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.label}>
              <TableCell className="font-medium text-muted-foreground">{row.label}</TableCell>
              {apartments.map((a) => (
                <TableCell key={a.id} className="font-tabular">
                  {row.render(a)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
