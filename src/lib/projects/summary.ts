export interface ApartmentLike {
  area: number;
  bedrooms: number;
  price: number;
  downPayment: number;
  monthlyPayment: number;
  durationMonths: number;
  status: string;
}

export interface ProjectSummary {
  sizeMin: number;
  sizeMax: number;
  bedroomsMin: number;
  bedroomsMax: number;
  minDownPayment: number;
  minMonthlyPayment: number;
  typicalDurationMonths: number;
  availableCount: number;
  totalCount: number;
  deliveryYear: number;
}

/** Card-friendly aggregate stats derived from a project's apartment inventory. */
export function summarizeProject(apartments: ApartmentLike[], estimatedDeliveryDate: Date): ProjectSummary {
  const available = apartments.filter((a) => a.status === "AVAILABLE");
  const pool = available.length > 0 ? available : apartments;

  if (pool.length === 0) {
    return {
      sizeMin: 0,
      sizeMax: 0,
      bedroomsMin: 0,
      bedroomsMax: 0,
      minDownPayment: 0,
      minMonthlyPayment: 0,
      typicalDurationMonths: 0,
      availableCount: 0,
      totalCount: apartments.length,
      deliveryYear: estimatedDeliveryDate.getFullYear(),
    };
  }

  const cheapest = [...pool].sort((a, b) => a.price - b.price)[0];

  return {
    sizeMin: Math.min(...pool.map((a) => a.area)),
    sizeMax: Math.max(...pool.map((a) => a.area)),
    bedroomsMin: Math.min(...pool.map((a) => a.bedrooms)),
    bedroomsMax: Math.max(...pool.map((a) => a.bedrooms)),
    minDownPayment: cheapest.downPayment,
    minMonthlyPayment: cheapest.monthlyPayment,
    typicalDurationMonths: cheapest.durationMonths,
    availableCount: available.length,
    totalCount: apartments.length,
    deliveryYear: estimatedDeliveryDate.getFullYear(),
  };
}
