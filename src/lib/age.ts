// Age calculation from a birth date to a reference date (default: today).
// Uses an anniversary-based month count so that a birth on the 31st maps to
// the last day of shorter months (the common legal convention).

export interface AgeInput {
  birth: Date
  at?: Date // defaults to now
}

export interface AgeResult {
  years: number
  months: number
  days: number
  totalDays: number
  totalMonths: number
  totalWeeks: number
  totalHours: number
  nextBirthday: Date
  daysToNextBirthday: number
}

const MS_PER_DAY = 86_400_000

// Last day of a 0-indexed month in a given year.
function lastDayOfMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

// The monthly anniversary of `day` in (year, month): the same day, or the
// last day of the month if that day does not exist.
function anniversary(year: number, month: number, day: number): Date {
  const ld = lastDayOfMonth(year, month)
  return new Date(year, month, Math.min(day, ld))
}

export function computeAge(input: AgeInput): AgeResult | null {
  const birth = new Date(
    input.birth.getFullYear(),
    input.birth.getMonth(),
    input.birth.getDate(),
  )
  const atRaw = input.at ?? new Date()
  const at = new Date(atRaw.getFullYear(), atRaw.getMonth(), atRaw.getDate())

  if (birth > at) return null

  const birthDay = birth.getDate()

  // Full years: the most recent birthday anniversary on or before `at`.
  let years = at.getFullYear() - birth.getFullYear()
  let anniv = anniversary(at.getFullYear(), birth.getMonth(), birthDay)
  if (anniv > at) {
    years -= 1
    anniv = anniversary(at.getFullYear() - 1, birth.getMonth(), birthDay)
  }

  // Full months from the anniversary toward `at`.
  let months = 0
  let cursor = new Date(anniv)
  while (true) {
    const nextMonth = cursor.getMonth() + 1
    const nextYear = cursor.getFullYear() + (nextMonth > 11 ? 1 : 0)
    const next = anniversary(nextYear, nextMonth % 12, cursor.getDate())
    if (next > at) break
    cursor = next
    months += 1
  }

  // Remaining days.
  const days = Math.round((at.getTime() - cursor.getTime()) / MS_PER_DAY)

  // Totals.
  const totalDays = Math.floor((at.getTime() - birth.getTime()) / MS_PER_DAY)
  const totalMonths = years * 12 + months
  const totalWeeks = Math.floor(totalDays / 7)
  const totalHours = totalDays * 24

  // Next birthday.
  let nextBirthday = anniversary(at.getFullYear(), birth.getMonth(), birthDay)
  if (nextBirthday < at) {
    nextBirthday = anniversary(at.getFullYear() + 1, birth.getMonth(), birthDay)
  }
  const daysToNextBirthday = Math.round(
    (nextBirthday.getTime() - at.getTime()) / MS_PER_DAY,
  )

  return {
    years,
    months,
    days,
    totalDays,
    totalMonths,
    totalWeeks,
    totalHours,
    nextBirthday,
    daysToNextBirthday,
  }
}

// Format a date as YYYY-MM-DD for <input type="date">.
export function toInputDate(d: Date): string {
  const y = d.getFullYear()
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Format a date in a friendly long form, e.g. "Monday, 1 January 2024".
export function formatDateLong(d: Date): string {
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Today's date as a local Date at midnight.
export function today(): Date {
  const n = new Date()
  return new Date(n.getFullYear(), n.getMonth(), n.getDate())
}
