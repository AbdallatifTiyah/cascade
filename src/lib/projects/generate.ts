import { calculateMonthlyPayment, calculateAnnualFees, calculateExpectedYield } from "@/lib/finance";

export interface ApartmentPlanInput {
  totalFloors: number;
  unitsPerFloor: number;
  pricePerSqm: number;
  downPaymentAmount: number;
  durationMonths: number;
  serviceFeeRate?: number;
  managementFeeRate?: number;
  maintenanceFeeRate?: number;
  expectedYieldRate?: number;
}

export interface GeneratedApartment {
  code: string;
  floor: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  hasBalcony: boolean;
  view: string;
  parkingIncluded: boolean;
  features: string[];
  price: number;
  downPayment: number;
  monthlyPayment: number;
  durationMonths: number;
  status: "AVAILABLE";
  serviceFeeAnnual: number;
  managementFeeAnnual: number;
  maintenanceFeeAnnual: number;
  expectedYieldAnnual: number;
}

const WING_LETTERS = ["A", "B", "C", "D"];
const BEDROOM_CYCLE = [2, 3, 3, 4];
const VIEWS = ["City", "Garden", "Street", "Panoramic"];

/** Same area formula used by the generator and the cost-based price
 * calculator, so the total area they each work from always agrees. */
export function apartmentArea(bedrooms: number, floor: number): number {
  return bedrooms === 2 ? 95 + (floor % 3) * 4 : bedrooms === 3 ? 128 + (floor % 3) * 5 : 155 + (floor % 3) * 6;
}

/** Total buildable area for a given floor/unit configuration, before any
 * apartments exist -- used to derive price per m² from project costs. */
export function totalBuildingArea(totalFloors: number, unitsPerFloor: number): number {
  const wingCount = Math.max(1, Math.min(unitsPerFloor, WING_LETTERS.length));
  let total = 0;
  for (let floor = 1; floor <= totalFloors; floor++) {
    for (let wingIndex = 0; wingIndex < wingCount; wingIndex++) {
      const bedrooms = BEDROOM_CYCLE[(floor + wingIndex) % BEDROOM_CYCLE.length];
      total += apartmentArea(bedrooms, floor);
    }
  }
  return total;
}

/** Deterministic apartment inventory generator for the admin project
 * builder — same shape used by the seed script, so admin-created and
 * seeded projects behave identically everywhere else in the app. */
export function generateApartmentPlan(input: ApartmentPlanInput): GeneratedApartment[] {
  const { totalFloors, unitsPerFloor, pricePerSqm, downPaymentAmount, durationMonths, serviceFeeRate, managementFeeRate, maintenanceFeeRate, expectedYieldRate } = input;
  const wings = WING_LETTERS.slice(0, Math.max(1, Math.min(unitsPerFloor, WING_LETTERS.length)));
  const apartments: GeneratedApartment[] = [];

  for (let floor = 1; floor <= totalFloors; floor++) {
    wings.forEach((wing, wingIndex) => {
      const bedrooms = BEDROOM_CYCLE[(floor + wingIndex) % BEDROOM_CYCLE.length];
      const area = apartmentArea(bedrooms, floor);
      const price = Math.round(area * pricePerSqm);
      const downPayment = Math.round(Math.min(downPaymentAmount, price));
      const { monthlyPaymentDisplay } = calculateMonthlyPayment({ totalPrice: price, downPayment, durationMonths });
      const fees = calculateAnnualFees({ price, serviceFeeRate, managementFeeRate, maintenanceFeeRate });
      const expectedYieldAnnual = calculateExpectedYield({ price, yieldRate: expectedYieldRate });

      apartments.push({
        code: `${wing}${floor}01`,
        floor,
        area,
        bedrooms,
        bathrooms: bedrooms >= 3 ? 2 : 1,
        hasBalcony: wingIndex % 2 === 0,
        view: VIEWS[(floor + wingIndex) % VIEWS.length],
        parkingIncluded: true,
        features: [],
        price,
        downPayment,
        monthlyPayment: monthlyPaymentDisplay,
        durationMonths,
        status: "AVAILABLE",
        serviceFeeAnnual: fees.serviceFeeAnnual,
        managementFeeAnnual: fees.managementFeeAnnual,
        maintenanceFeeAnnual: fees.maintenanceFeeAnnual,
        expectedYieldAnnual,
      });
    });
  }

  return apartments;
}
