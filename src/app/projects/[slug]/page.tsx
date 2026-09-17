import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, Layers, Building2, Car, ArrowUpDown, Calendar, Sparkles } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getMatchForProject } from "@/lib/matching/service";
import { calculateProjectDemandCoverage } from "@/lib/demand/coverage";
import { ProjectCover } from "@/components/ui/cover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { MatchBadge } from "@/components/ui/match-badge";
import { MatchExplanation } from "@/components/projects/match-explanation";
import { FinancialPlanCard } from "@/components/projects/financial-plan-card";
import { amenityLabel, PROJECT_STATUS_LABEL } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { trackEvent } from "@/lib/audit";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await db.project.findUnique({ where: { slug } });
  return { title: project?.name ?? "Project" };
}

const STEPS = [
  { title: "Join the project", description: "Reserve an apartment and become a project participant." },
  { title: "Land acquisition", description: "Cascade secures the land for the development." },
  { title: "Design", description: "Architectural and engineering design is finalized." },
  { title: "Construction", description: "The building is constructed in stages, tracked in real time." },
  { title: "Apartment handover", description: "Once complete, apartments are handed over to participants." },
];

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await db.project.findUnique({
    where: { slug },
    include: { location: true, land: true, apartments: true, _count: { select: { participants: true } } },
  });
  if (!project) notFound();

  const session = await auth();
  const match = session?.user?.id ? await getMatchForProject(session.user.id, project.id) : null;
  const coverage = await calculateProjectDemandCoverage(project.id);
  await trackEvent({ userId: session?.user?.id, name: "project_viewed", metadata: { projectId: project.id } });

  const available = project.apartments.filter((a) => a.status === "AVAILABLE");
  const cheapest = [...available].sort((a, b) => a.price - b.price)[0] ?? project.apartments[0];
  const amenities: string[] = JSON.parse(project.amenities || "[]");

  return (
    <div className="space-y-8">
      <ProjectCover theme={project.coverTheme} className="h-56 rounded-2xl sm:h-72">
        <div className="absolute left-4 top-4">
          <Badge variant="dark">{PROJECT_STATUS_LABEL[project.status]}</Badge>
        </div>
        {match && (
          <div className="absolute right-4 top-4">
            <MatchBadge score={match.overallScore} />
          </div>
        )}
      </ProjectCover>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{project.name}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-4 w-4" /> {project.location.name}
          </p>
        </div>
        <LinkButton href={`/projects/${project.slug}/apartments`} size="lg">
          View Apartments
        </LinkButton>
      </div>

      <p className="max-w-3xl leading-relaxed text-muted-foreground">{project.description}</p>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Project overview</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-5 sm:grid-cols-3">
                <Stat icon={Layers} label="Land size" value={project.land ? `${project.land.area} m²` : "TBD"} />
                <Stat icon={Building2} label="Apartments" value={`${project.totalApartments}`} />
                <Stat icon={ArrowUpDown} label="Floors" value={`${project.totalFloors}`} />
                <Stat icon={Car} label="Parking" value={project.parkingAvailable ? "Available" : "Not included"} />
                <Stat icon={Building2} label="Elevator" value={project.elevatorAvailable ? "Yes" : "No"} />
                <Stat icon={Calendar} label="Est. delivery" value={formatDate(project.estimatedDeliveryDate, { month: "long", year: "numeric" })} />
              </dl>

              {amenities.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-5">
                  {amenities.map((a) => (
                    <Badge key={a} variant="outline">
                      {amenityLabel(a)}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How this project works</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-5">
                {STEPS.map((step, i) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary font-tabular text-sm font-semibold">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium">{step.title}</p>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project demand coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="font-tabular text-2xl font-semibold">{coverage.requiredParticipants}</p>
                  <p className="text-xs text-muted-foreground">Apartments</p>
                </div>
                <div>
                  <p className="font-tabular text-2xl font-semibold">{coverage.highlyMatchedUsers}</p>
                  <p className="text-xs text-muted-foreground">Highly matched users</p>
                </div>
                <div>
                  <p className="font-tabular text-2xl font-semibold text-accent">{Math.round(coverage.demandCoveragePercent)}%</p>
                  <p className="text-xs text-muted-foreground">Demand coverage</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {match && (
            <Card>
              <CardHeader className="flex-row items-center gap-2 space-y-0">
                <Sparkles className="h-4 w-4 text-accent" />
                <CardTitle>Why this matches you</CardTitle>
              </CardHeader>
              <CardContent>
                <MatchExplanation breakdown={match.breakdown} />
              </CardContent>
            </Card>
          )}

          {cheapest && (
            <FinancialPlanCard
              title="Financial plan (from)"
              totalPrice={cheapest.price}
              downPayment={cheapest.downPayment}
              durationMonths={cheapest.durationMonths}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </dt>
      <dd className="mt-1 font-tabular text-sm font-semibold">{value}</dd>
    </div>
  );
}
