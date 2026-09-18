import Link from "next/link";
import { MapPin, BedDouble, Ruler } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectCover } from "@/components/ui/cover";
import { MatchBadge } from "@/components/ui/match-badge";
import { FundingProgress } from "@/components/projects/funding-progress";
import { formatCurrency } from "@/lib/currency";
import { PROJECT_STATUS_LABEL } from "@/lib/constants";
import type { ProjectSummary } from "@/lib/projects/summary";
import { getDictionary, type Locale } from "@/lib/i18n";
import { localizedProjectStatus } from "@/lib/i18n/labels";

export function ProjectCard({
  id,
  slug,
  name,
  locationName,
  coverTheme,
  status,
  participantCount,
  summary,
  matchScore,
  locale = "en",
}: {
  id: string;
  slug: string;
  name: string;
  locationName: string;
  coverTheme: string;
  status: string;
  participantCount: number;
  summary: ProjectSummary;
  matchScore?: number;
  locale?: Locale;
}) {
  const t = getDictionary(locale).projectCard;
  const fundedPercent = summary.totalCount > 0 ? ((summary.totalCount - summary.availableCount) / summary.totalCount) * 100 : 0;
  return (
    <Card className="group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated">
      <Link href={`/projects/${slug}`} className="flex flex-1 flex-col">
        <ProjectCover theme={coverTheme} className="h-40 w-full transition-transform duration-500 group-hover:scale-105">
          <div className="absolute right-3 top-3">
            {matchScore !== undefined ? (
              <MatchBadge score={matchScore} locale={locale} />
            ) : (
              <Badge variant="dark">{localizedProjectStatus(status, locale, PROJECT_STATUS_LABEL[status])}</Badge>
            )}
          </div>
        </ProjectCover>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-semibold leading-tight transition-colors group-hover:text-accent">{name}</h3>
          </div>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> {locationName}
          </p>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Ruler className="h-3.5 w-3.5" />
              {summary.sizeMin === summary.sizeMax ? `${Math.round(summary.sizeMin)} m²` : `${Math.round(summary.sizeMin)}–${Math.round(summary.sizeMax)} m²`}
            </span>
            <span className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5" />
              {locale === "ar"
                ? (summary.bedroomsMin === summary.bedroomsMax ? `${summary.bedroomsMin} غرف` : `${summary.bedroomsMin}–${summary.bedroomsMax} غرف`)
                : (summary.bedroomsMin === summary.bedroomsMax ? `${summary.bedroomsMin} bed` : `${summary.bedroomsMin}–${summary.bedroomsMax} bed`)}
            </span>
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <FundingProgress fundedPercent={fundedPercent} investorCount={participantCount} locale={locale} compact />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
            <div>
              <p className="font-tabular text-sm font-semibold">{formatCurrency(summary.minDownPayment)}</p>
              <p className="text-[11px] text-muted-foreground">{t.initial}</p>
            </div>
            <div>
              <p className="font-tabular text-sm font-semibold">{formatCurrency(summary.minMonthlyPayment)}{locale === "ar" ? "/شهرياً" : "/mo"}</p>
              <p className="text-[11px] text-muted-foreground">{t.monthly}</p>
            </div>
            <div>
              <p className="font-tabular text-sm font-semibold">{summary.deliveryYear}</p>
              <p className="text-[11px] text-muted-foreground">{t.estDelivery}</p>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
}
