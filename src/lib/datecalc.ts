// Date math: days between two dates, and adding/subtracting days/weeks/months/years.
// All operations work in local time at midnight to avoid DST and timezone gotchas.

export const MS_PER_DAY = 86_400_000

// Normalise a Date to local midnight.
export function atMidnight(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export interface DiffResult {
  days: number
  weeks: number
  weekdays: number
  totalDays: number
  sign: 1 | -1
}

// Days between two dates. Positive if `to` is after `from`.
export function daysBetween(from: Date, to: Date): number {
  const a = atMidnight(from)
  const b = atMidnight(to)
  return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY)
}

// Full breakdown: total days, whole weeks, and remaining weekdays.
export function dateDiff(from: Date, to: Date): DiffResult {
  const total = daysBetween(from, to)
  const sign = total >= 0 ? 1 : -1
  const abs = Math.abs(total)
  return {
    totalDays: total,
    days: abs % 7,
    weeks: Math.floor(abs / 7),
    weekdays: countWeekdays(from, to),
    sign,
  }
}

// Count weekdays (Mon–Fri) between two dates, inclusive of neither endpoint
// unless they fall on a weekday and the span is zero.
export function countWeekdays(from: Date, to: Date): number {
  let start = atMidnight(from)
  let end = atMidnight(to)
  let sign = 1
  if (start > end) {
    const tmp = start
    start = end
    end = tmp
    sign = -1
  }
  let count = 0
  const cursor = new Date(start)
  cursor.setDate(cursor.getDate() + 1) // start counting from the day after `from`
  while (cursor < end) {
    const dow = cursor.getDay()
    if (dow !== 0 && dow !== 6) count += 1
    cursor.setDate(cursor.getDate() + 1)
  }
  return count * sign
}

export type DateUnit = 'days' | 'weeks' | 'months' | 'years'

// Add (or subtract, with negative `amount`) a number of units to a date.
export function addToDate(date: Date, amount: number, unit: DateUnit): Date {
  const d = atMidnight(date)
  if (unit === 'days') {
    d.setDate(d.getDate() + amount)
  } else if (unit === 'weeks') {
    d.setDate(d.getDate() + amount * 7)
  } else if (unit === 'months') {
    // Add months, clamping the day to the last day of the target month.
    const targetMonth = d.getMonth() + amount
    const year = d.getFullYear() + Math.floor(targetMonth / 12)
    const month = ((targetMonth % 12) + 12) % 12
    const day = Math.min(d.getDate(), new Date(year, month + 1, 0).getDate())
    d.setFullYear(year, month, day)
  } else if (unit === 'years') {
    const year = d.getFullYear() + amount
    const month = d.getMonth()
    const day = Math.min(d.getDate(), new Date(year, month + 1, 0).getDate())
    d.setFullYear(year, month, day)
  }
  return d
}

// Friendly long date, e.g. "Monday, 1 January 2024".
export function formatDateLong(d: Date): string {
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// YYYY-MM-DD for <input type="date">.
export function toInputDate(d: Date): string {
  const y = d.getFullYear()
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function today(): Date {
  return atMidnight(new Date())
}
