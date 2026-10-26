// Unix timestamp <-> human date conversion, pure local JS. A timestamp is
// just an integer counting seconds or milliseconds since 1970-01-01 UTC, so
// there is nothing to look up and nothing to send.

export type TimeUnit = 'auto' | 'seconds' | 'milliseconds'

function pad(n: number, len: number): string {
  return String(Math.floor(n)).padStart(len, '0')
}

// Format a date as ISO 8601 UTC with millisecond precision.
export function formatUtc(date: Date): string {
  return (
    `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1, 2)}-${pad(date.getUTCDate(), 2)}` +
    `T${pad(date.getUTCHours(), 2)}:${pad(date.getUTCMinutes(), 2)}:${pad(date.getUTCSeconds(), 2)}` +
    `.${pad(date.getUTCMilliseconds(), 3)}Z`
  )
}

// Format a date in the visitor's local zone, with the UTC offset appended.
export function formatLocal(date: Date): string {
  const y = date.getFullYear()
  const mo = pad(date.getMonth() + 1, 2)
  const d = pad(date.getDate(), 2)
  const hh = pad(date.getHours(), 2)
  const mm = pad(date.getMinutes(), 2)
  const ss = pad(date.getSeconds(), 2)
  const ms = pad(date.getMilliseconds(), 3)
  const offMin = -date.getTimezoneOffset()
  const sign = offMin >= 0 ? '+' : '-'
  const offH = pad(Math.floor(Math.abs(offMin) / 60), 2)
  const offM = pad(Math.abs(offMin) % 60, 2)
  return `${y}-${mo}-${d} ${hh}:${mm}:${ss}.${ms} (UTC${sign}${offH}${offM})`
}

// Format a date as RFC 2822 (Thu, 26 Oct 2026 00:05:25 +0000) for use in
// headers and email.
const RFC_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const RFC_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function formatRfc2822(date: Date): string {
  const offMin = -date.getTimezoneOffset()
  const sign = offMin >= 0 ? '+' : '-'
  const off = pad(Math.floor(Math.abs(offMin) / 60), 2) + pad(Math.abs(offMin) % 60, 2)
  return `${RFC_DAYS[date.getDay()]}, ${pad(date.getDate(), 2)} ${RFC_MONTHS[date.getMonth()]} ${date.getFullYear()} ${pad(date.getHours(), 2)}:${pad(date.getMinutes(), 2)}:${pad(date.getSeconds(), 2)} ${sign}${off}`
}

// Convert a Date to a timestamp number.
export function toTimestamp(date: Date, unit: 'seconds' | 'milliseconds'): number {
  const ms = date.getTime()
  return unit === 'seconds' ? Math.floor(ms / 1000) : ms
}

// Parse a timestamp integer into a Date. In "auto" mode, 13+ digits are
// treated as milliseconds and everything shorter as seconds, the common
// heuristic most converters use.
export function parseTimestamp(value: string, unit: TimeUnit): Date {
  const clean = value.trim().replace(/[\s,_]/g, '')
  if (!/^-?\d+$/.test(clean)) throw new Error('Timestamp must be an integer.')
  const n = Number(clean)
  let ms: number
  if (unit === 'milliseconds') {
    ms = n
  } else if (unit === 'seconds') {
    ms = n * 1000
  } else {
    ms = Math.abs(n) >= 1e12 ? n : n * 1000
  }
  const date = new Date(ms)
  if (Number.isNaN(date.getTime())) throw new Error('Timestamp out of range.')
  return date
}

// Parse a human date string into a Date. Accepts ISO 8601, space-separated
// (YYYY-MM-DD HH:mm:ss), and a bare date; appends the local zone unless a
// zone is already present.
export function parseDate(value: string): Date {
  const clean = value.trim()
  if (clean === '') throw new Error('Enter a date.')
  // YYYY-MM-DD HH:mm:ss[.fff] -> ISO with a T so Date parses it as local.
  let iso = clean.replace(/^(\d{4}-\d{2}-\d{2})\s+(\d)/, '$1T$2')
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) throw new Error('Could not parse that date.')
  return date
}

export function currentEpochSeconds(): number {
  return Math.floor(Date.now() / 1000)
}

// Rough relative time, e.g. "in 3 minutes" or "2 days ago".
export function formatRelative(date: Date): string {
  const diffSec = Math.round((date.getTime() - Date.now()) / 1000)
  const future = diffSec >= 0
  let n = Math.abs(diffSec)
  if (n < 60) return future ? 'in a moment' : 'just now'
  const units: [number, string][] = [
    [60, 'minute'],
    [60, 'hour'],
    [24, 'day'],
    [7, 'week'],
    [30, 'day'], // 30-ish month
    [12, 'month'],
    [10, 'year'],
  ]
  let label = 'second'
  for (const [factor, name] of units) {
    label = name
    if (n < factor) break
    n = Math.round(n / factor)
  }
  const plural = n === 1 ? '' : 's'
  return future ? `in ${n} ${label}${plural}` : `${n} ${label}${plural} ago`
}
