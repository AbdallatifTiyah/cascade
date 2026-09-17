// Reusable financial utilities shared by the matching engine, feasibility
// calculator, and every price/payment display in the UI. No interest is
// assumed anywhere unless a rate is explicitly passed in — Cascade's
// group-development model splits price into a down payment plus equal
// monthly installments, not a loan.

export interface AmortizationInput {
  totalPrice: number;
  downPayment: number;
  durationMonths: number;
}

export interface AmortizationResult {
  totalPrice: number;
  downPayment: number;
  remaining: number;
  durationMonths: number;
  /** Precise, unrounded monthly figure — keep this for further math. */
  monthlyPaymentExact: number;
  /** Rounded to 2 decimals — use this for display only. */
  monthlyPaymentDisplay: number;
}

export function calculateMonthlyPayment(input: AmortizationInput): AmortizationResult {
  const { totalPrice, downPayment, durationMonths } = input;
  const remaining = Math.max(totalPrice - downPayment, 0);
  const monthlyPaymentExact = durationMonths > 0 ? remaining / durationMonths : 0;

  return {
    totalPrice,
    downPayment,
    remaining,
    durationMonths,
    monthlyPaymentExact,
    monthlyPaymentDisplay: Math.round(monthlyPaymentExact * 100) / 100,
  };
}

export interface PaymentScheduleEntry {
  label: string;
  amount: number;
  dueDate: Date;
}

/**
 * Builds a down-payment + N equal monthly installments schedule.
 * The last installment absorbs any rounding remainder so the schedule
 * always sums exactly to totalPrice.
 */
export function buildPaymentSchedule(
  input: AmortizationInput & { startDate: Date }
): PaymentScheduleEntry[] {
  const { downPayment, durationMonths, startDate } = input;
  const amort = calculateMonthlyPayment(input);
  const schedule: PaymentScheduleEntry[] = [
    { label: "Down payment", amount: round2(downPayment), dueDate: startDate },
  ];

  const monthly = Math.round(amort.monthlyPaymentExact * 100) / 100;
  let runningTotal = downPayment;

  for (let i = 1; i <= durationMonths; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    const isLast = i === durationMonths;
    const amount = isLast ? round2(input.totalPrice - runningTotal) : monthly;
    runningTotal += amount;
    schedule.push({ label: `Installment ${i}`, amount, dueDate });
  }

  return schedule;
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function averageOfRange(min: number, max: number): number {
  return (min + max) / 2;
}

export function midpoint(min: number, max: number): number {
  return min + (max - min) / 2;
}
