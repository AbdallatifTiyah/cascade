import type { Metadata } from "next";
import { db } from "@/lib/db";
import { ProjectBuilderForm } from "@/components/admin/project-builder-form";

export const metadata: Metadata = { title: "New Project" };

export default async function NewProjectPage() {
  const [locations, lands] = await Promise.all([
    db.location.findMany({ orderBy: { name: "asc" } }),
    db.land.findMany({ where: { status: { in: ["AVAILABLE", "ACQUIRED", "UNDER_REVIEW"] } }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">New project</h1>
        <p className="mt-1 text-sm text-muted-foreground">Set up a project and Cascade will generate its apartment inventory automatically.</p>
      </div>
      <ProjectBuilderForm locations={locations} lands={lands} />
    </div>
  );
}
