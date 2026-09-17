import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { PROJECT_STATUS_LABEL } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Projects" };

export default async function AdminProjectsPage() {
  const projects = await db.project.findMany({
    include: { location: true, _count: { select: { apartments: true, participants: true, reservations: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage active and upcoming Cascade developments.</p>
        </div>
        <LinkButton href="/admin/projects/new">
          <Plus className="h-4 w-4" />
          New Project
        </LinkButton>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Apartments</TableHead>
            <TableHead>Reservations</TableHead>
            <TableHead>Est. delivery</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((p) => (
            <TableRow key={p.id}>
              <TableCell>
                <Link href={`/admin/projects/${p.id}`} className="font-medium hover:underline">
                  {p.name}
                </Link>
              </TableCell>
              <TableCell>{p.location.name}</TableCell>
              <TableCell>
                <Badge variant="outline">{PROJECT_STATUS_LABEL[p.status]}</Badge>
              </TableCell>
              <TableCell className="font-tabular">{p._count.apartments}</TableCell>
              <TableCell className="font-tabular">{p._count.reservations}</TableCell>
              <TableCell className="text-muted-foreground">{formatDate(p.estimatedDeliveryDate, { month: "short", year: "numeric" })}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
