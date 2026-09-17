import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getRecommendedProjects } from "@/lib/matching/service";
import { summarizeProject } from "@/lib/projects/summary";
import { ProjectCard } from "@/components/projects/project-card";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Building2 } from "lucide-react";

export const metadata: Metadata = { title: "Explore Projects" };

export default async function ProjectsPage() {
  const session = await auth();

  const participantCounts = await db.projectParticipant.groupBy({ by: ["projectId"], _count: { projectId: true } });
  const countByProject = Object.fromEntries(participantCounts.map((p) => [p.projectId, p._count.projectId]));

  if (session?.user?.id) {
    const preference = await db.propertyPreference.findUnique({ where: { userId: session.user.id } });

    if (preference) {
      const recommendations = await getRecommendedProjects(session.user.id);
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Projects matched to your plan</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sorted by how well each project fits your property profile.</p>
          </div>
          {recommendations.length === 0 ? (
            <EmptyState icon={Building2} title="No projects available yet" description="Check back soon as new projects launch." />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recommendations.map(({ project, match }) => (
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
                />
              ))}
            </div>
          )}
        </div>
      );
    }
  }

  const projects = await db.project.findMany({
    where: { status: { not: "DRAFT" } },
    include: { location: true, apartments: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-accent/30 bg-accent/10 p-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
          <div>
            <p className="font-medium">See your personalized match score</p>
            <p className="text-sm text-muted-foreground">Build your property plan to find out which of these projects fit your budget and timeline.</p>
          </div>
        </div>
        <LinkButton href="/signup" className="w-full shrink-0 sm:w-auto">
          Build My Property Plan
        </LinkButton>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">All projects</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
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
          />
        ))}
      </div>
    </div>
  );
}
