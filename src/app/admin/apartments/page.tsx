import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { APARTMENT_STATUS_STYLE } from "@/lib/apartments";
import { APARTMENT_STATUSES } from "@/lib/constants";

export const metadata: Metadata = { title: "Apartments" };

export default async function AdminApartmentsPage({ searchParams }: { searchParams: Promise<{ projectId?: string; status?: string }> }) {
  const { projectId, status } = await searchParams;
  const projects = await db.project.findMany({ orderBy: { name: "asc" } });

  const apartments = await db.apartment.findMany({
    where: { ...(projectId ? { projectId } : {}), ...(status ? { status } : {}) },
    include: { project: true },
    orderBy: [{ project: { name: "asc" } }, { floor: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Apartments</h1>
        <p className="mt-1 text-sm text-muted-foreground">Full inventory across every project.</p>
      </div>

      <Card>
        <CardContent className="p-5">
          <form method="GET" className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="projectId">Project</Label>
              <Select id="projectId" name="projectId" defaultValue={projectId ?? ""} className="w-56">
                <option value="">All projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select id="status" name="status" defaultValue={status ?? ""} className="w-48">
                <option value="">Any status</option>
                {APARTMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
            <Button type="submit">Filter</Button>
          </form>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Floor</TableHead>
            <TableHead>Area</TableHead>
            <TableHead>Bedrooms</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Annual fees</TableHead>
            <TableHead>Status</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apartments.map((a) => {
            const style = APARTMENT_STATUS_STYLE[a.status] ?? APARTMENT_STATUS_STYLE.UNAVAILABLE;
            return (
              <TableRow key={a.id}>
                <TableCell>
                  <Link href={`/admin/projects/${a.projectId}`} className="hover:underline">
                    {a.project.name}
                  </Link>
                </TableCell>
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
                <TableCell>
                  <Link href={`/admin/apartments/${a.id}`} className="text-sm font-medium text-accent hover:underline">
                    Edit
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
