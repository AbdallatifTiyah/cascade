import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ApartmentSelector } from "@/components/apartments/apartment-selector";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await db.project.findUnique({ where: { slug } });
  return { title: project ? `Apartments · ${project.name}` : "Apartments" };
}

export default async function ApartmentsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await db.project.findUnique({
    where: { slug },
    include: { apartments: { orderBy: [{ floor: "desc" }, { code: "asc" }] } },
  });
  if (!project) notFound();
  const locale = getLocale();
  const t = getDictionary(locale).apartmentsListPage;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">{project.name}</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t.selectApartment}</h1>
      </div>
      <ApartmentSelector projectSlug={project.slug} apartments={project.apartments} locale={locale} />
    </div>
  );
}
