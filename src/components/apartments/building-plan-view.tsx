"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BedDouble, Ruler, DoorOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { getDictionary, type Locale } from "@/lib/i18n";
import { localizedApartmentStatus } from "@/lib/i18n/labels";
import type { ApartmentListItem } from "./apartment-selector";

const LABEL_W = 9;
const MARGIN = 2;
const FLOOR_H = 9;
const ROOF_H = 6;
const GROUND_H = 5;
const CANVAS_W = 100;
const BUILDING_X = LABEL_W + MARGIN;
const BUILDING_W = CANVAS_W - BUILDING_X - MARGIN;

interface LaidOutUnit extends ApartmentListItem {
  x: number;
  y: number;
  w: number;
  h: number;
}

function layoutBuilding(apartments: ApartmentListItem[]): { floors: number[]; units: LaidOutUnit[]; canvasH: number } {
  const floors = [...new Set(apartments.map((a) => a.floor))].sort((a, b) => b - a);
  const top = MARGIN + ROOF_H;
  const units: LaidOutUnit[] = [];

  floors.forEach((floor, floorIndex) => {
    const row = apartments.filter((a) => a.floor === floor).sort((a, b) => a.code.localeCompare(b.code));
    const y = top + floorIndex * FLOOR_H;
    if (row.length === 0) return;
    const minW = BUILDING_W / (row.length * 2.2);
    const totalArea = row.reduce((s, u) => s + u.area, 0) || 1;
    const rawWidths = row.map((u) => Math.max((u.area / totalArea) * BUILDING_W, minW));
    const rawTotal = rawWidths.reduce((s, w) => s + w, 0);
    const scale = BUILDING_W / rawTotal;
    let cursor = BUILDING_X;
    row.forEach((u, i) => {
      const w = rawWidths[i] * scale;
      units.push({ ...u, x: cursor, y, w, h: FLOOR_H });
      cursor += w;
    });
  });

  const canvasH = top + floors.length * FLOOR_H + GROUND_H + MARGIN;
  return { floors, units, canvasH };
}

const STATUS_FILL: Record<string, string> = {
  AVAILABLE: "fill-success/15 hover:fill-success/30",
  RESERVED: "fill-accent/20 hover:fill-accent/30",
  ALLOCATED: "fill-accent/20 hover:fill-accent/30",
  UNAVAILABLE: "fill-muted",
  COMPLETED: "fill-muted",
};

const STATUS_STROKE: Record<string, string> = {
  AVAILABLE: "stroke-success",
  RESERVED: "stroke-accent",
  ALLOCATED: "stroke-accent",
  UNAVAILABLE: "stroke-border",
  COMPLETED: "stroke-border",
};

const STATUS_BADGE: Record<string, string> = {
  AVAILABLE: "bg-success/10 text-success",
  RESERVED: "bg-accent/10 text-accent",
  ALLOCATED: "bg-accent/10 text-accent",
  UNAVAILABLE: "bg-muted text-muted-foreground",
  COMPLETED: "bg-muted text-muted-foreground",
};

export function BuildingPlanView({
  projectSlug,
  apartments,
  locale = "en",
}: {
  projectSlug: string;
  apartments: ApartmentListItem[];
  locale?: Locale;
}) {
  const router = useRouter();
  const t = getDictionary(locale).apartmentSelector;
  const [activeId, setActiveId] = useState<string | null>(null);

  const { floors, units, canvasH } = useMemo(() => layoutBuilding(apartments), [apartments]);
  const active = units.find((u) => u.id === activeId) ?? null;

  const roofTop = MARGIN;
  const buildingBottom = MARGIN + ROOF_H + floors.length * FLOOR_H;

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-border bg-card p-2">
        <svg viewBox={`0 0 ${CANVAS_W} ${canvasH}`} className="w-full select-none" role="img" aria-label={t.floorPlanView}>
          {/* roof */}
          <polygon
            points={`${BUILDING_X - 2},${roofTop + ROOF_H} ${BUILDING_X + BUILDING_W / 2},${roofTop} ${BUILDING_X + BUILDING_W + 2},${roofTop + ROOF_H}`}
            className="fill-foreground/80"
          />
          {/* building outline */}
          <rect
            x={BUILDING_X}
            y={MARGIN + ROOF_H}
            width={BUILDING_W}
            height={floors.length * FLOOR_H}
            className="fill-background stroke-border"
            strokeWidth={0.4}
          />
          {/* floor slab dividers + labels */}
          {floors.map((floor, i) => {
            const y = MARGIN + ROOF_H + i * FLOOR_H;
            return (
              <g key={floor}>
                {i > 0 && (
                  <line x1={BUILDING_X} y1={y} x2={BUILDING_X + BUILDING_W} y2={y} className="stroke-border" strokeWidth={0.3} />
                )}
                <text
                  x={LABEL_W - 1}
                  y={y + FLOOR_H / 2}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="fill-muted-foreground font-tabular"
                  style={{ fontSize: "3px", fontWeight: 600 }}
                >
                  {floor}
                </text>
              </g>
            );
          })}
          {/* ground / plinth */}
          <rect x={BUILDING_X - 3} y={buildingBottom} width={BUILDING_W + 6} height={GROUND_H} className="fill-foreground/80" />
          <rect
            x={BUILDING_X + BUILDING_W / 2 - 4}
            y={buildingBottom}
            width={8}
            height={GROUND_H}
            className="fill-background"
          />

          {units.map((u) => {
            const clickable = u.status === "AVAILABLE";
            const isActive = u.id === activeId;
            return (
              <g
                key={u.id}
                onMouseEnter={() => setActiveId(u.id)}
                onFocus={() => setActiveId(u.id)}
                onClick={() => {
                  setActiveId(u.id);
                  if (clickable) router.push(`/projects/${projectSlug}/apartments/${u.id}`);
                }}
                tabIndex={0}
                role="button"
                aria-label={u.code}
                className={cn("outline-none", clickable ? "cursor-pointer" : "cursor-default")}
                onKeyDown={(e) => {
                  if (clickable && (e.key === "Enter" || e.key === " ")) router.push(`/projects/${projectSlug}/apartments/${u.id}`);
                }}
              >
                <rect
                  x={u.x + 0.3}
                  y={u.y + 0.4}
                  width={Math.max(u.w - 0.6, 0)}
                  height={u.h - 0.8}
                  className={cn(
                    "transition-all",
                    STATUS_FILL[u.status] ?? STATUS_FILL.UNAVAILABLE,
                    STATUS_STROKE[u.status] ?? STATUS_STROKE.UNAVAILABLE,
                    isActive && "fill-primary/25"
                  )}
                  strokeWidth={isActive ? 0.7 : 0.25}
                />
                {u.w > 6 && (
                  <>
                    <rect x={u.x + u.w * 0.22} y={u.y + u.h * 0.3} width={u.w * 0.18} height={u.h * 0.32} className="fill-foreground/15" />
                    <rect x={u.x + u.w * 0.6} y={u.y + u.h * 0.3} width={u.w * 0.18} height={u.h * 0.32} className="fill-foreground/15" />
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 min-h-[92px] rounded-xl border border-border bg-card p-4">
        {active ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-tabular text-base font-semibold">{active.code}</p>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                    STATUS_BADGE[active.status] ?? STATUS_BADGE.UNAVAILABLE
                  )}
                >
                  {localizedApartmentStatus(active.status, locale, active.status)}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Ruler className="h-3 w-3" /> {active.area} m²
                </span>
                <span className="flex items-center gap-1">
                  <BedDouble className="h-3 w-3" /> {active.bedrooms} {locale === "ar" ? "غرف" : "bed"}
                </span>
                <span className="flex items-center gap-1">
                  <DoorOpen className="h-3 w-3" /> {t.floor} {active.floor}
                </span>
              </div>
            </div>
            <div className="text-end">
              <p className="font-tabular text-sm font-semibold">
                {formatCurrency(active.monthlyPayment)}
                <span className="text-xs font-normal text-muted-foreground">{locale === "ar" ? "/شهرياً" : "/mo"}</span>
              </p>
              {active.status === "AVAILABLE" && (
                <button
                  onClick={() => router.push(`/projects/${projectSlug}/apartments/${active.id}`)}
                  className="mt-1 text-xs font-semibold text-primary underline underline-offset-2"
                >
                  {t.viewDetails}
                </button>
              )}
            </div>
          </div>
        ) : (
          <p className="flex h-full items-center justify-center text-sm text-muted-foreground">{t.hoverHint}</p>
        )}
      </div>
    </div>
  );
}
