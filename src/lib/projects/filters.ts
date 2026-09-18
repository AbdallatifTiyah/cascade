export interface ProjectFilterValues {
  locationId?: string;
  bedrooms?: string; // "1" | "2" | "3" | "4_PLUS"
  maxMonthly?: number;
}

export interface FilterableApartment {
  bedrooms: number;
  monthlyPayment: number;
}

export interface FilterableProject {
  locationId: string;
  apartments: FilterableApartment[];
}

/** Shared by both the logged-in (matched) and public project listings so
 * the same query params filter either branch consistently. */
export function matchesProjectFilters(project: FilterableProject, filters: ProjectFilterValues): boolean {
  if (filters.locationId && project.locationId !== filters.locationId) return false;

  if (filters.bedrooms) {
    const min = filters.bedrooms === "4_PLUS" ? 4 : Number(filters.bedrooms);
    const matchesBedrooms = project.apartments.some((a) =>
      filters.bedrooms === "4_PLUS" ? a.bedrooms >= min : a.bedrooms === min
    );
    if (!matchesBedrooms) return false;
  }

  if (filters.maxMonthly && filters.maxMonthly > 0) {
    const withinBudget = project.apartments.some((a) => a.monthlyPayment <= filters.maxMonthly!);
    if (!withinBudget) return false;
  }

  return true;
}

export function parseProjectFilters(searchParams: Record<string, string | string[] | undefined>): ProjectFilterValues {
  const locationId = typeof searchParams.locationId === "string" && searchParams.locationId ? searchParams.locationId : undefined;
  const bedrooms = typeof searchParams.bedrooms === "string" && searchParams.bedrooms ? searchParams.bedrooms : undefined;
  const maxMonthlyRaw = typeof searchParams.maxMonthly === "string" ? Number(searchParams.maxMonthly) : undefined;
  const maxMonthly = maxMonthlyRaw && !Number.isNaN(maxMonthlyRaw) && maxMonthlyRaw > 0 ? maxMonthlyRaw : undefined;
  return { locationId, bedrooms, maxMonthly };
}

export function hasActiveFilters(filters: ProjectFilterValues): boolean {
  return !!(filters.locationId || filters.bedrooms || filters.maxMonthly);
}
