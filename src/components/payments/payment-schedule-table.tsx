"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";

export interface PaymentRow {
  id: string;
  label: string;
  dueDate: Date;
  amount: number;
  status: string;
}

const STATUS_VARIANT: Record<string, "success" | "warning" | "destructive"> = {
  PAID: "success",
  UPCOMING: "warning",
  OVERDUE: "destructive",
};

export function PaymentScheduleTable({ payments }: { payments: PaymentRow[] }) {
  const [expanded, setExpanded] = useState(false);

  const notPaid = payments.filter((p) => p.status !== "PAID");
  const paid = payments.filter((p) => p.status === "PAID");
  const collapsedView = [...paid.slice(-2), ...notPaid.slice(0, 6)].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  const rows = expanded ? payments : collapsedView;
  const hiddenCount = payments.length - collapsedView.length;

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Installment</TableHead>
            <TableHead>Due date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className="font-medium">{payment.label}</TableCell>
              <TableCell className="font-tabular text-muted-foreground">{formatDate(payment.dueDate)}</TableCell>
              <TableCell className="font-tabular">{formatCurrency(payment.amount)}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[payment.status] ?? "default"}>{payment.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {hiddenCount > 0 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" /> Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" /> Show full schedule ({hiddenCount} more)
            </>
          )}
        </button>
      )}
    </div>
  );
}
