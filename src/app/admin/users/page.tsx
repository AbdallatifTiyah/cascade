import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { bedroomLabel } from "@/lib/constants";
import { LEAD_STATUSES } from "@/lib/constants";

export const metadata: Metadata = { title: "Users" };

const LEAD_VARIANT: Record<string, "default" | "warning" | "success" | "outline"> = {
  NEW: "outline",
  INTERESTED: "default",
  MATCHED: "warning",
  RESERVED: "success",
  COMPLETED: "success",
};

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string; leadStatus?: string }> }) {
  const { q, leadStatus } = await searchParams;

  const users = await db.user.findMany({
    where: {
      role: "CUSTOMER",
      ...(leadStatus ? { leadStatus } : {}),
      ...(q
        ? {
            OR: [
              { firstName: { contains: q } },
              { lastName: { contains: q } },
              { email: { contains: q } },
            ],
          }
        : {}),
    },
    include: { preference: { include: { locations: { include: { location: true } } } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const funnel = await db.user.groupBy({ by: ["leadStatus"], where: { role: "CUSTOMER" }, _count: { leadStatus: true } });
  const funnelMap = Object.fromEntries(funnel.map((f) => [f.leadStatus, f._count.leadStatus]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">Every customer and their journey through the Cascade funnel.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {LEAD_STATUSES.map((status) => (
          <StatCard key={status} label={status} value={String(funnelMap[status] ?? 0)} />
        ))}
      </div>

      <Card>
        <CardContent className="p-5">
          <form method="GET" className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="q">Search</Label>
              <Input id="q" name="q" defaultValue={q ?? ""} placeholder="Name or email" className="w-56" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="leadStatus">Lead status</Label>
              <Select id="leadStatus" name="leadStatus" defaultValue={leadStatus ?? ""} className="w-48">
                <option value="">Any status</option>
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Bedrooms</TableHead>
            <TableHead>Lead status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell>
                <Link href={`/admin/users/${u.id}`} className="font-medium hover:underline">
                  {u.firstName} {u.lastName}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{u.email}</TableCell>
              <TableCell>{u.preference?.locations.map((l) => l.location.name).join(", ") || "—"}</TableCell>
              <TableCell>{u.preference ? bedroomLabel(u.preference.bedrooms) : "—"}</TableCell>
              <TableCell>
                <Badge variant={LEAD_VARIANT[u.leadStatus] ?? "outline"}>{u.leadStatus}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
