import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getRecommendedProjects } from "@/lib/matching/service";
import { summarizeProject } from "@/lib/projects/summary";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectFilterBar } from "@/components/projects/project-filter-bar";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Building2, SearchX } from "lucide-react";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n";
import { matchesProjectFilters, parseProjectFilters, hasActiveFilters } from "@/lib/projects/filters";

export const metadata: Metadata = { title: "Explore Projects" };

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  const locale = getLocale();
  const t = getDictionary(locale).projectsListPage;
  const tf = getDictionary(locale).projectFilters;

  const filters = parseProjectFilters(await searchParams);
  const filtersActive = hasActiveFilters(filters);

  const [participantCounts, locations] = await Promise.all([
    db.projectParticipant.groupBy({ by: ["projectId"], _count: { projectId: true } }),
    db.location.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);
  const countByProject = Object.fromEntries(participantCounts.map((p) => [p.projectId, p._count.projectId]));

  const filterBar = (
    <ProjectFilterBar locations={locations.map((l) => ({ id: l.id, name: l.name }))} filters={filters} hasActive={filtersActive} locale={locale} />
  );

  if (session?.user?.id) {
    const preference = await db.propertyPreference.findUnique({ where: { userId: session.user.id } });

    if (preference) {
      const recommendations = await getRecommendedProjects(session.user.id);
      const filtered = recommendations.filter(({ project }) => matchesProjectFilters(project, filters));

      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t.matchedTitle}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t.matchedSubtitle}</p>
          </div>

          {filterBar}

          {recommendations.length === 0 ? (
            <EmptyState icon={Building2} title={t.emptyTitle} description={t.emptyDesc} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title={tf.noResultsTitle}
              description={tf.noResultsDesc}
              action={
                <LinkButton href="/projects" size="sm">
                  {tf.clear}
                </LinkButton>
              }
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(({ project, match }) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  slug={project.slug}
                  name={project.name}
                  locationName={project.location.name}
                  coverTheme={project.coverTheme}
                  status={project.status}
                  participantCount={countByProject[project.id] ?? 0}
                  summary={summarizeProject(project.apartments, project.estimatedDeliveryDate)}
                  matchScore={match.overallScore}
                  locale={locale}
                />
              ))}
            </div>
          )}
        </div>
      );
    }
  }

  const allProjects = await db.project.findMany({
    where: { status: { not: "DRAFT" } },
    include: { location: true, apartments: true },
    orderBy: { createdAt: "desc" },
  });
  const filteredProjects = allProjects.filter((project) => matchesProjectFilters(project, filters));

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-accent/30 bg-accent/10 p-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
          <div>
            <p className="font-medium">{t.promoTitle}</p>
            <p className="text-sm text-muted-foreground">{t.promoDesc}</p>
          </div>
        </div>
        <LinkButton href="/signup" className="w-full shrink-0 sm:w-auto">
          {t.buildPlan}
        </LinkButton>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t.allProjectsTitle}</h1>

      {filterBar}

      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={tf.noResultsTitle}
          description={tf.noResultsDesc}
          action={
            <LinkButton href="/projects" size="sm">
              {tf.clear}
            </LinkButton>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              slug={project.slug}
              name={project.name}
              locationName={project.location.name}
              coverTheme={project.coverTheme}
              status={project.status}
              participantCount={countByProject[project.id] ?? 0}
              summary={summarizeProject(project.apartments, project.estimatedDeliveryDate)}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  );
}
