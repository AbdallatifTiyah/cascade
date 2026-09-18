import { db } from "@/lib/db";
import { summarizeProject } from "@/lib/projects/summary";
import { ProjectCard } from "@/components/projects/project-card";
import { LinkButton } from "@/components/ui/button";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n";
import { Reveal } from "@/components/ui/reveal";

export async function FeaturedProjects() {
  const locale = getLocale();
  const t = getDictionary(locale).landing.featuredProjects;
  const projects = await db.project.findMany({
    where: { status: { in: ["FUNDRAISING", "CONSTRUCTION", "LAND_SECURED", "FINISHING"] } },
    include: { location: true, apartments: true, _count: { select: { participants: true } } },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  if (projects.length === 0) return null;

  return (
    <section className="border-b border-border py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t.title}</h2>
            <p className="mt-3 max-w-xl text-muted-foreground">{t.subtitle}</p>
          </div>
          <LinkButton href="/projects" variant="outline" size="md" className="shrink-0">
            {t.viewAll}
          </LinkButton>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <Reveal key={project.id} delay={i * 100}>
              <ProjectCard
                id={project.id}
                slug={project.slug}
                name={project.name}
                locationName={project.location.name}
                coverTheme={project.coverTheme}
                status={project.status}
                participantCount={project._count.participants}
                summary={summarizeProject(project.apartments, project.estimatedDeliveryDate)}
                locale={locale}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
