import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Reservations" };

export default async function AdminReservationsPage() {
  const reservations = await db.reservation.findMany({
    include: { user: true, project: true, apartment: true },
    orderBy: { createdAt: "desc" },
  });

  const confirmed = reservations.filter((r) => r.status === "CONFIRMED").length;
  const totalValue = reservations.reduce((s, r) => s + r.apartment.price, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Reservations</h1>
        <p className="mt-1 text-sm text-muted-foreground">Every apartment reservation across all projects.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Total reservations" value={String(reservations.length)} />
        <StatCard label="Confirmed" value={String(confirmed)} />
        <StatCard label="Combined value" value={formatCurrency(totalValue)} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Apartment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-tabular font-medium">{r.code}</TableCell>
              <TableCell>
                <Link href={`/admin/users/${r.userId}`} className="hover:underline">
                  {r.user.firstName} {r.user.lastName}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/admin/projects/${r.projectId}`} className="hover:underline">
                  {r.project.name}
                </Link>
              </TableCell>
              <TableCell className="font-tabular">{r.apartment.code}</TableCell>
              <TableCell>
                <Badge variant={r.status === "CONFIRMED" ? "success" : "outline"}>{r.status}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDate(r.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
