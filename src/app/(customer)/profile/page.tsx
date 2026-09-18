import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { getRecommendedProjects } from "@/lib/matching/service";
import { summarizeProject } from "@/lib/projects/summary";
import { PropertyProfileCard } from "@/components/projects/property-profile-card";
import { ProjectCard } from "@/components/projects/project-card";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Building2 } from "lucide-react";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = { title: "Your Property Profile" };

export default async function ProfileHomePage() {
  const user = await requireUser();
  const locale = getLocale();
  const t = getDictionary(locale);

  const preference = await db.propertyPreference.findUnique({
    where: { userId: user.id },
    include: { locations: { include: { location: true } } },
  });

  if (!preference) redirect("/onboarding");

  const recommendations = await getRecommendedProjects(user.id);
  const top = recommendations.slice(0, 6);

  const participantCounts = await db.projectParticipant.groupBy({
    by: ["projectId"],
    _count: { projectId: true },
  });
  const countByProject = Object.fromEntries(participantCounts.map((p) => [p.projectId, p._count.projectId]));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">{t.profileHome.welcomeBack}</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{user.firstName} {user.lastName}</h1>
      </div>

      <PropertyProfileCard
        locale={locale}
        profile={{
          locationNames: preference.locations.map((l) => l.location.name),
          propertyType: preference.propertyType,
          bedrooms: preference.bedrooms,
          minSize: preference.minSize,
          maxSize: preference.maxSize,
          downPaymentMin: preference.downPaymentMin,
          downPaymentMax: preference.downPaymentMax,
          monthlyMin: preference.monthlyMin,
          monthlyMax: preference.monthlyMax,
          durationMinYears: preference.durationMinYears,
          durationMaxYears: preference.durationMaxYears,
          timeline: preference.timeline,
        }}
      />

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">{t.profileHome.recommendedForYou}</h2>
          <LinkButton href="/projects" variant="ghost" size="sm">
            {t.profileHome.findMyProjects}
            <ArrowRight className="h-4 w-4" />
          </LinkButton>
        </div>

        {top.length === 0 ? (
          <EmptyState
            icon={Building2}
            title={t.profileHome.noMatchingTitle}
            description={t.profileHome.noMatchingDesc}
            action={
              <LinkButton href="/projects" size="sm">
                {t.profileHome.exploreAllProjects}
              </LinkButton>
            }
            className="mt-4"
          />
        ) : (
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {top.map(({ project, match }) => (
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
    </div>
  );
}
