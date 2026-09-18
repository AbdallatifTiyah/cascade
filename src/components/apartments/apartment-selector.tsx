"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BedDouble, Ruler, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { APARTMENT_STATUS_STYLE } from "@/lib/apartments";
import { Button } from "@/components/ui/button";
import { getDictionary, type Locale } from "@/lib/i18n";
import { localizedApartmentStatus } from "@/lib/i18n/labels";

export interface ApartmentListItem {
  id: string;
  code: string;
  floor: number;
  area: number;
  bedrooms: number;
  price: number;
  monthlyPayment: number;
  status: string;
}

export function ApartmentSelector({ projectSlug, apartments, locale = "en" }: { projectSlug: string; apartments: ApartmentListItem[]; locale?: Locale }) {
  const router = useRouter();
  const t = getDictionary(locale).apartmentSelector;
  const floors = useMemo(() => [...new Set(apartments.map((a) => a.floor))].sort((a, b) => b - a), [apartments]);
  const [activeFloor, setActiveFloor] = useState<number>(floors[0]);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const unitsOnFloor = apartments.filter((a) => a.floor === activeFloor);

  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  return (
    <div>
      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        {floors.map((floor) => (
          <button
            key={floor}
            onClick={() => setActiveFloor(floor)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              activeFloor === floor ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-foreground/30"
            )}
          >
            {t.floor} {floor}
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {unitsOnFloor.map((apt) => {
          const style = APARTMENT_STATUS_STYLE[apt.status] ?? APARTMENT_STATUS_STYLE.UNAVAILABLE;
          const clickable = apt.status === "AVAILABLE";
          const compareChecked = compareIds.includes(apt.id);
          return (
            <div
              key={apt.id}
              className={cn(
                "relative rounded-xl border p-4 transition-all",
                style.className,
                clickable ? "cursor-pointer hover:shadow-elevated" : "opacity-70"
              )}
              onClick={() => clickable && router.push(`/projects/${projectSlug}/apartments/${apt.id}`)}
              role={clickable ? "link" : undefined}
              tabIndex={clickable ? 0 : undefined}
              onKeyDown={(e) => {
                if (clickable && (e.key === "Enter" || e.key === " ")) router.push(`/projects/${projectSlug}/apartments/${apt.id}`);
              }}
            >
              <div className="flex items-start justify-between">
                <p className="font-tabular text-base font-semibold">{apt.code}</p>
                {clickable && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCompare(apt.id);
                    }}
                    aria-pressed={compareChecked}
                    aria-label={`Add ${apt.code} to comparison`}
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full border transition-colors",
                      compareChecked ? "border-primary bg-primary text-primary-foreground" : "border-border bg-white text-muted-foreground"
                    )}
                  >
                    <Scale className="h-3 w-3" />
                  </button>
                )}
              </div>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide">{localizedApartmentStatus(apt.status, locale, style.label)}</p>
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center gap-1">
                  <Ruler className="h-3 w-3" /> {apt.area} m²
                </p>
                <p className="flex items-center gap-1">
                  <BedDouble className="h-3 w-3" /> {apt.bedrooms} {locale === "ar" ? "غرف" : "bed"}
                </p>
              </div>
              {clickable && (
                <p className="mt-3 font-tabular text-sm font-semibold">
                  {formatCurrency(apt.monthlyPayment)}
                  <span className="text-xs font-normal text-muted-foreground">/mo</span>
                </p>
              )}
            </div>
          );
        })}
      </div>

      {compareIds.length > 0 && (
        <div className="fixed inset-x-0 bottom-16 z-30 flex justify-center px-4 md:bottom-6">
          <div className="flex items-center gap-4 rounded-full border border-border bg-card px-5 py-3 shadow-elevated">
            <span className="text-sm font-medium">{compareIds.length} {t.selected}</span>
            <Button size="sm" onClick={() => router.push(`/compare?ids=${compareIds.join(",")}`)} disabled={compareIds.length < 2}>
              {t.compare}
            </Button>
            <button onClick={() => setCompareIds([])} className="text-sm text-muted-foreground underline underline-offset-2">
              {t.clear}
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <Legend colorClass="border-success/40 bg-success/10" label={t.available} />
        <Legend colorClass="border-accent/40 bg-accent/10" label={t.reservedAllocated} />
        <Legend colorClass="border-border bg-muted" label={t.unavailable} />
      </div>
    </div>
  );
}

function Legend({ colorClass, label }: { colorClass: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("h-3 w-3 rounded-full border", colorClass)} />
      {label}
    </span>
  );
}
