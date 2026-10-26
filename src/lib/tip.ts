// Tip and split-bill calculation. The math is simple; the care is in rounding
// honestly and in keeping the pre-tax / post-tax distinction explicit.

export type Rounding = 'none' | 'up' | 'nearest'

export interface TipInput {
  bill: number
  rate: number // as a fraction, e.g. 0.18 for 18%
  people: number
  rounding: Rounding
  // When true, the tip is computed on the bill as entered. When false, the
  // caller passes the post-tax total and we compute tip on the whole thing.
  // We keep this as a pure bill-only calculation; tax is the caller's job.
}

export interface TipResult {
  tip: number
  total: number
  tipPerPerson: number
  totalPerPerson: number
  // When rounding pushes the total up, this is the extra a single person pays
  // so the group total is exact (the last person absorbs the difference).
  roundingAdjustment: number
}

// Round money to two decimal places using the standard half-up rule.
function money(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

export function computeTip(input: TipInput): TipResult {
  const bill = Math.max(0, input.bill)
  const rate = Math.max(0, input.rate)
  const people = Math.max(1, Math.floor(input.people))

  const tip = money(bill * rate)
  const total = money(bill + tip)

  const tipPerPersonRaw = tip / people
  const totalPerPersonRaw = total / people

  let tipPerPerson = money(tipPerPersonRaw)
  let totalPerPerson = money(totalPerPersonRaw)
  let roundingAdjustment = 0

  if (input.rounding === 'up') {
    totalPerPerson = Math.ceil(totalPerPersonRaw)
    tipPerPerson = money(totalPerPerson - bill / people)
    roundingAdjustment = money(totalPerPerson * people - total)
  } else if (input.rounding === 'nearest') {
    totalPerPerson = Math.round(totalPerPersonRaw)
    tipPerPerson = money(totalPerPerson - bill / people)
    roundingAdjustment = money(totalPerPerson * people - total)
  }

  return {
    tip,
    total,
    tipPerPerson: money(tipPerPerson),
    totalPerPerson: money(totalPerPerson),
    roundingAdjustment: money(roundingAdjustment),
  }
}

// Common tip rates presented as quick-pick percentages.
export const TIP_PRESETS = [10, 12, 15, 18, 20, 25]

// Format a number as currency without pulling in Intl for the whole build.
export function formatMoney(n: number, currency = 'USD'): string {
  const sign = n < 0 ? '-' : ''
  const abs = Math.abs(n)
  const whole = Math.floor(abs)
  const cents = Math.round((abs - whole) * 100)
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : ''
  return `${sign}${symbol}${whole.toLocaleString('en-US')}.${cents.toString().padStart(2, '0')}`
}
