import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getAllLandsWithScore } from "@/lib/land/matching";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LandFormDialog } from "@/components/admin/land-form-dialog";
import { formatCurrency } from "@/lib/currency";

export const metadata: Metadata = { title: "Lands" };

const STATUS_VARIANT: Record<string, "success" | "warning" | "default" | "outline"> = {
  AVAILABLE: "success",
  UNDER_REVIEW: "warning",
  ACQUIRED: "default",
  ARCHIVED: "outline",
};

const DEMAND_VARIANT: Record<string, "success" | "warning" | "default"> = {
  "High demand": "success",
  "Moderate demand": "warning",
  "Low demand": "default",
};

export default async function LandsPage() {
  const [lands, locations] = await Promise.all([
    getAllLandsWithScore(),
    db.location.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Lands</h1>
          <p className="mt-1 text-sm text-muted-foreground">Land opportunities scored against real demand.</p>
        </div>
        <LandFormDialog locations={locations} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Area</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Units</TableHead>
            <TableHead>Demand match</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lands.map(({ land, result }) => (
            <TableRow key={land.id} className="cursor-pointer">
              <TableCell>
                <Link href={`/admin/lands/${land.id}`} className="font-medium hover:underline">
                  {land.name}
                </Link>
              </TableCell>
              <TableCell>{land.location.name}</TableCell>
              <TableCell className="font-tabular">{land.area} m²</TableCell>
              <TableCell className="font-tabular">{formatCurrency(land.price)}</TableCell>
              <TableCell className="font-tabular">{land.potentialApartments}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-tabular font-semibold">{result.score}%</span>
                  <Badge variant={DEMAND_VARIANT[result.status]}>{result.status}</Badge>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[land.status]}>{land.status.replace("_", " ")}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
