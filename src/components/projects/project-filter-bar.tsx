import { SlidersHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label, Select, Input } from "@/components/ui/input";
import { Button, LinkButton } from "@/components/ui/button";
import { BEDROOM_OPTIONS } from "@/lib/constants";
import { getDictionary, type Locale } from "@/lib/i18n";
import { localizedBedroom } from "@/lib/i18n/labels";
import type { ProjectFilterValues } from "@/lib/projects/filters";

export function ProjectFilterBar({
  locations,
  filters,
  hasActive,
  locale = "en",
}: {
  locations: { id: string; name: string }[];
  filters: ProjectFilterValues;
  hasActive: boolean;
  locale?: Locale;
}) {
  const t = getDictionary(locale).projectFilters;

  return (
    <Card>
      <CardContent className="p-5">
        <form method="GET" className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-1.5 self-center text-sm font-medium text-muted-foreground">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div className="min-w-[10rem] flex-1 space-y-1.5">
            <Label htmlFor="locationId">{t.locationLabel}</Label>
            <Select id="locationId" name="locationId" defaultValue={filters.locationId ?? ""}>
              <option value="">{t.allLocations}</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="min-w-[8rem] flex-1 space-y-1.5">
            <Label htmlFor="bedrooms">{t.bedroomsLabel}</Label>
            <Select id="bedrooms" name="bedrooms" defaultValue={filters.bedrooms ?? ""}>
              <option value="">{t.anyBedrooms}</option>
              {BEDROOM_OPTIONS.map((b) => (
                <option key={b.value} value={b.value}>
                  {localizedBedroom(b.value, locale, b.label)}
                </option>
              ))}
            </Select>
          </div>
          <div className="min-w-[10rem] flex-1 space-y-1.5">
            <Label htmlFor="maxMonthly">{t.maxMonthlyLabel}</Label>
            <Input
              id="maxMonthly"
              name="maxMonthly"
              type="number"
              min={0}
              placeholder={t.maxMonthlyPlaceholder}
              defaultValue={filters.maxMonthly ?? ""}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit">{t.apply}</Button>
            {hasActive && (
              <LinkButton href="/projects" variant="ghost" size="md">
                {t.clear}
              </LinkButton>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
