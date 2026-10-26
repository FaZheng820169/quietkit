// Loan / mortgage calculator: monthly payment, total payment, total interest,
// and an amortization schedule.

export interface LoanResult {
  monthlyPayment: number
  totalPayment: number
  totalInterest: number
  schedule: AmortizationRow[]
}

export interface AmortizationRow {
  month: number
  payment: number
  principal: number
  interest: number
  balance: number
}

// Monthly payment for an amortizing loan.
// M = P * r(1+r)^n / ((1+r)^n - 1)
// where r = annualRate / 12 / 100, n = years * 12.
export function monthlyPayment(
  principal: number,
  annualRatePercent: number,
  years: number,
): number {
  const n = years * 12
  const r = annualRatePercent / 100 / 12
  if (r === 0) return principal / n
  const pow = Math.pow(1 + r, n)
  return (principal * r * pow) / (pow - 1)
}

// Full result including amortization schedule.
export function computeLoan(
  principal: number,
  annualRatePercent: number,
  years: number,
  scheduleMonths = 12,
): LoanResult | null {
  if (
    !Number.isFinite(principal) ||
    !Number.isFinite(annualRatePercent) ||
    !Number.isFinite(years) ||
    principal <= 0 ||
    annualRatePercent < 0 ||
    years <= 0
  ) {
    return null
  }

  const n = Math.round(years * 12)
  const r = annualRatePercent / 100 / 12
  const exactM = monthlyPayment(principal, annualRatePercent, years)
  const m = round2(exactM) // the payment the borrower actually makes each month
  const totalPayment = m * n
  const totalInterest = totalPayment - principal

  // Build amortization schedule for the first `scheduleMonths` months.
  const schedule: AmortizationRow[] = []
  let balance = principal
  const limit = Math.min(scheduleMonths, n)
  for (let i = 1; i <= limit; i++) {
    const interest = balance * r
    const principalPart = m - interest
    balance = Math.max(0, balance - principalPart)
    schedule.push({
      month: i,
      payment: m,
      principal: round2(principalPart),
      interest: round2(interest),
      balance: round2(balance),
    })
  }

  return {
    monthlyPayment: m,
    totalPayment: round2(totalPayment),
    totalInterest: round2(totalInterest),
    schedule,
  }
}

// Round to 2 decimal places for currency display.
export function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// Format a number as USD with thousands separators.
export function formatCurrency(n: number): string {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
