import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Payments" };

const STATUS_VARIANT: Record<string, "success" | "warning" | "destructive"> = {
  PAID: "success",
  UPCOMING: "warning",
  OVERDUE: "destructive",
};

export default async function AdminPaymentsPage() {
  const payments = await db.payment.findMany({
    include: { paymentPlan: { include: { reservation: { include: { user: true, project: true, apartment: true } } } } },
    orderBy: { dueDate: "asc" },
  });

  const collected = payments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
  const upcoming = payments.filter((p) => p.status === "UPCOMING").reduce((s, p) => s + p.amount, 0);
  const overdue = payments.filter((p) => p.status === "OVERDUE");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Payments</h1>
        <p className="mt-1 text-sm text-muted-foreground">Structured payment ledger across every reservation.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Total collected" value={formatCurrency(collected)} />
        <StatCard label="Upcoming" value={formatCurrency(upcoming)} />
        <StatCard label="Overdue" value={`${overdue.length} payments`} hint={formatCurrency(overdue.reduce((s, p) => s + p.amount, 0))} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Installment</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Due date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.slice(0, 200).map((p) => (
            <TableRow key={p.id}>
              <TableCell>
                <Link href={`/admin/users/${p.paymentPlan.reservation.userId}`} className="hover:underline">
                  {p.paymentPlan.reservation.user.firstName} {p.paymentPlan.reservation.user.lastName}
                </Link>
              </TableCell>
              <TableCell>{p.paymentPlan.reservation.project.name}</TableCell>
              <TableCell>{p.label}</TableCell>
              <TableCell className="font-tabular">{formatCurrency(p.amount)}</TableCell>
              <TableCell className="text-muted-foreground">{formatDate(p.dueDate)}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[p.status] ?? "outline"}>{p.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
