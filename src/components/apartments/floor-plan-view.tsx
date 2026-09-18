"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BedDouble, Ruler, DoorOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { getDictionary, type Locale } from "@/lib/i18n";
import { localizedApartmentStatus } from "@/lib/i18n/labels";
import type { ApartmentListItem } from "./apartment-selector";

const MARGIN = 3;
const ROW_H = 36;
const CORRIDOR_H = 14;
const CANVAS_W = 100;
const CANVAS_H = MARGIN * 2 + ROW_H * 2 + CORRIDOR_H;

interface LaidOutUnit extends ApartmentListItem {
  x: number;
  y: number;
  w: number;
  h: number;
}

function layoutFloor(units: ApartmentListItem[]): LaidOutUnit[] {
  const top: ApartmentListItem[] = [];
  const bottom: ApartmentListItem[] = [];
  units.forEach((u, i) => (i % 2 === 0 ? top : bottom).push(u));

  const usableW = CANVAS_W - MARGIN * 2;
  const topY = MARGIN;
  const bottomY = MARGIN + ROW_H + CORRIDOR_H;

  function placeRow(row: ApartmentListItem[], y: number): LaidOutUnit[] {
    if (row.length === 0) return [];
    const minW = usableW / (row.length * 2.2);
    const totalArea = row.reduce((s, u) => s + u.area, 0) || 1;
    const rawWidths = row.map((u) => Math.max((u.area / totalArea) * usableW, minW));
    const rawTotal = rawWidths.reduce((s, w) => s + w, 0);
    const scale = usableW / rawTotal;
    let cursor = MARGIN;
    return row.map((u, i) => {
      const w = rawWidths[i] * scale;
      const placed: LaidOutUnit = { ...u, x: cursor, y, w, h: ROW_H };
      cursor += w;
      return placed;
    });
  }

  return [...placeRow(top, topY), ...placeRow(bottom, bottomY)];
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

export function FloorPlanView({
  projectSlug,
  units,
  locale = "en",
}: {
  projectSlug: string;
  units: ApartmentListItem[];
  locale?: Locale;
}) {
  const router = useRouter();
  const t = getDictionary(locale).apartmentSelector;
  const [activeId, setActiveId] = useState<string | null>(null);

  const laidOut = useMemo(() => layoutFloor(units), [units]);
  const active = laidOut.find((u) => u.id === activeId) ?? null;

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <svg
          viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
          className="w-full select-none"
          role="img"
          aria-label={t.floorPlanView}
        >
          <rect
            x={0.5}
            y={0.5}
            width={CANVAS_W - 1}
            height={CANVAS_H - 1}
            rx={2}
            className="fill-background stroke-border"
            strokeWidth={0.4}
          />
          <rect
            x={MARGIN}
            y={MARGIN + ROW_H}
            width={CANVAS_W - MARGIN * 2}
            height={CORRIDOR_H}
            className="fill-muted/60"
          />
          {laidOut.map((u) => {
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
                  x={u.x + 0.6}
                  y={u.y + 0.6}
                  width={Math.max(u.w - 1.2, 0)}
                  height={u.h - 1.2}
                  rx={1.2}
                  className={cn(
                    "transition-all",
                    STATUS_FILL[u.status] ?? STATUS_FILL.UNAVAILABLE,
                    STATUS_STROKE[u.status] ?? STATUS_STROKE.UNAVAILABLE,
                    isActive && "fill-primary/25"
                  )}
                  strokeWidth={isActive ? 0.9 : 0.5}
                />
                {u.w > 8 && (
                  <text
                    x={u.x + u.w / 2}
                    y={u.y + u.h / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-foreground font-tabular"
                    style={{ fontSize: "3.2px", fontWeight: 600 }}
                  >
                    {u.code}
                  </text>
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
                  <DoorOpen className="h-3 w-3" /> {t.floor} {units.find((u) => u.id === active.id)?.floor}
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
