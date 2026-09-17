// Pure data shapes for the matching engine. Deliberately framework- and
// ORM-agnostic (no Prisma types) so this module can be reused unchanged by
// a future mobile client or a standalone API service.

export interface MatchWeights {
  location: number;
  monthly: number;
  initial: number;
  size: number;
  bedrooms: number;
  timeline: number;
  duration: number;
  amenities: number;
}

export interface UserMatchProfile {
  locationIds: string[];
  bedrooms: string; // "1" | "2" | "3" | "4_PLUS"
  minSize: number;
  maxSize: number;
  downPaymentMin: number;
  downPaymentMax: number;
  monthlyMin: number;
  monthlyMax: number;
  durationMinYears: number;
  durationMaxYears: number;
  timeline: string;
  amenities: string[];
}

export interface ApartmentMatchInput {
  id: string;
  area: number;
  bedrooms: number;
  price: number;
  downPayment: number;
  monthlyPayment: number;
  durationMonths: number;
  status: string;
}

export interface ProjectMatchInput {
  id: string;
  locationId: string;
  amenities: string[];
  estimatedDeliveryDate: Date;
  apartments: ApartmentMatchInput[];
}

export interface CriterionScore {
  key: keyof MatchWeights;
  label: string;
  score: number; // 0-100
  weight: number; // 0-1
  contribution: number; // score * weight
  explanation: string;
}

export interface MatchResult {
  overallScore: number; // 0-100, rounded
  breakdown: CriterionScore[];
  weightsUsed: MatchWeights;
  bestApartmentId: string | null;
  computedAt: string;
}
