import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { Scale } from "lucide-react";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = { title: "Compare Apartments" };

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const { ids } = await searchParams;
  const locale = getLocale();
  const t = getDictionary(locale).comparePage;
  const idList = (ids ?? "").split(",").filter(Boolean).slice(0, 3);

  const apartments = idList.length
    ? await db.apartment.findMany({ where: { id: { in: idList } }, include: { project: true } })
    : [];

  if (apartments.length === 0) {
    return (
      <EmptyState
        icon={Scale}
        title={t.emptyTitle}
        description={t.emptyDesc}
        action={
          <LinkButton href="/projects" size="sm">
            {t.exploreProjects}
          </LinkButton>
        }
      />
    );
  }

  const rows: { label: string; render: (a: (typeof apartments)[number]) => React.ReactNode }[] = [
    { label: t.project, render: (a) => a.project.name },
    { label: t.area, render: (a) => `${a.area} m²` },
    { label: t.floor, render: (a) => a.floor },
    { label: t.bedrooms, render: (a) => a.bedrooms },
    { label: t.bathrooms, render: (a) => a.bathrooms },
    { label: t.view, render: (a) => a.view },
    { label: t.balcony, render: (a) => (a.hasBalcony ? t.yes : t.no) },
    { label: t.parking, render: (a) => (a.parkingIncluded ? t.included : t.notIncluded) },
    { label: t.price, render: (a) => formatCurrency(a.price) },
    { label: t.initialPayment, render: (a) => formatCurrency(a.downPayment) },
    { label: t.monthlyPayment, render: (a) => `${formatCurrency(a.monthlyPayment)}/mo` },
    { label: t.duration, render: (a) => `${a.durationMonths} ${locale === "ar" ? "شهراً" : "months"}` },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t.title}</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.spec}</TableHead>
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
