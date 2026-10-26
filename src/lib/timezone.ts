/**
 * Time-zone conversion built only on Intl. No server, no database, no precomputed
 * offset table: every offset comes from the IANA rules baked into the browser, so
 * daylight-saving transitions are handled by the platform rather than by hand.
 */

export type Zone = { id: string; label: string; region: string }

export const ZONES: Zone[] = [
  { id: 'UTC', label: 'UTC — Coordinated Universal Time', region: 'UTC' },

  { id: 'America/Los_Angeles', label: 'Los Angeles', region: 'Americas' },
  { id: 'America/Denver', label: 'Denver', region: 'Americas' },
  { id: 'America/Chicago', label: 'Chicago', region: 'Americas' },
  { id: 'America/New_York', label: 'New York', region: 'Americas' },
  { id: 'America/Sao_Paulo', label: 'São Paulo', region: 'Americas' },

  { id: 'Europe/London', label: 'London', region: 'Europe & Africa' },
  { id: 'Europe/Paris', label: 'Paris', region: 'Europe & Africa' },
  { id: 'Europe/Berlin', label: 'Berlin', region: 'Europe & Africa' },
  { id: 'Europe/Madrid', label: 'Madrid', region: 'Europe & Africa' },
  { id: 'Europe/Warsaw', label: 'Warsaw', region: 'Europe & Africa' },
  { id: 'Europe/Moscow', label: 'Moscow', region: 'Europe & Africa' },
  { id: 'Africa/Cairo', label: 'Cairo', region: 'Europe & Africa' },
  { id: 'Africa/Lagos', label: 'Lagos', region: 'Europe & Africa' },

  { id: 'Asia/Dubai', label: 'Dubai', region: 'Asia' },
  { id: 'Asia/Karachi', label: 'Karachi', region: 'Asia' },
  { id: 'Asia/Kolkata', label: 'Mumbai / New Delhi', region: 'Asia' },
  { id: 'Asia/Bangkok', label: 'Bangkok', region: 'Asia' },
  { id: 'Asia/Shanghai', label: 'Shanghai', region: 'Asia' },
  { id: 'Asia/Singapore', label: 'Singapore', region: 'Asia' },
  { id: 'Asia/Tokyo', label: 'Tokyo', region: 'Asia' },
  { id: 'Asia/Seoul', label: 'Seoul', region: 'Asia' },

  { id: 'Australia/Perth', label: 'Perth', region: 'Oceania' },
  { id: 'Australia/Sydney', label: 'Sydney', region: 'Oceania' },
  { id: 'Pacific/Auckland', label: 'Auckland', region: 'Oceania' },
]

export const ZONE_REGIONS = ['UTC', 'Americas', 'Europe & Africa', 'Asia', 'Oceania']

export type WallTime = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
}

export type ZoneReading = {
  time: string
  weekday: string
  date: string
  abbreviation: string
  offsetMinutes: number
}

export type Conversion = {
  instant: Date
  from: ZoneReading
  to: ZoneReading
  dayShift: number
}

export function zoneLabel(id: string): string {
  return ZONES.find((zone) => zone.id === id)?.label ?? id
}

export function localZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

export function isValidZone(id: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: id })
    return true
  } catch {
    return false
  }
}

type Parts = { year: number; month: number; day: number; hour: number; minute: number; second: number }

function partsInZone(instant: Date, zone: string): Parts {
  const formatted = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant)

  const parts: Record<string, number> = {}
  for (const part of formatted) {
    if (part.type !== 'literal') parts[part.type] = Number(part.value)
  }
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour,
    minute: parts.minute,
    second: parts.second,
  }
}

/** Offset of `zone` from UTC at a given instant, in minutes (east positive). */
export function zoneOffsetMinutes(instant: Date, zone: string): number {
  const p = partsInZone(instant, zone)
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
  return Math.round((asUtc - instant.getTime()) / 60000)
}

function readsAs(instant: Date, zone: string, wall: WallTime): boolean {
  const parts = partsInZone(instant, zone)
  return (
    parts.year === wall.year &&
    parts.month === wall.month &&
    parts.day === wall.day &&
    parts.hour === wall.hour &&
    parts.minute === wall.minute
  )
}

/**
 * Turn a wall-clock reading in `zone` into an absolute instant.
 *
 * The naive guess (the reading taken as UTC) is corrected by the offset at that
 * instant, then verified by reading the result back. A second pass covers the
 * case where the first offset was the other side of a daylight-saving change.
 * Two readings need a rule of their own: an hour that occurs twice in autumn
 * resolves to the earlier one, and an hour that never occurs in spring is
 * pushed forward by the size of the gap, which is what a clock on the wall
 * actually does.
 */
export function wallTimeToInstant(zone: string, wall: WallTime): Date | null {
  if (!isValidZone(zone)) return null
  const { year, month, day, hour, minute } = wall
  if (!Number.isInteger(year) || year < 1970 || year > 2100) return null
  if (!Number.isInteger(month) || month < 1 || month > 12) return null
  if (!Number.isInteger(day) || day < 1 || day > 31) return null
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return null
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) return null

  const naive = Date.UTC(year, month - 1, day, hour, minute)
  const probe = new Date(naive)
  if (probe.getUTCDate() !== day || probe.getUTCMonth() !== month - 1) return null

  const firstOffset = zoneOffsetMinutes(probe, zone)
  const first = new Date(naive - firstOffset * 60000)
  if (readsAs(first, zone, wall)) return first

  const second = new Date(naive - zoneOffsetMinutes(first, zone) * 60000)
  if (readsAs(second, zone, wall)) return second

  // Neither candidate exists on the clock: the reading falls in the spring gap.
  return first
}

export function parseWallTime(date: string, time: string): WallTime | null {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim())
  const timeMatch = /^(\d{1,2}):(\d{2})/.exec(time.trim())
  if (!dateMatch || !timeMatch) return null
  return {
    year: Number(dateMatch[1]),
    month: Number(dateMatch[2]),
    day: Number(dateMatch[3]),
    hour: Number(timeMatch[1]),
    minute: Number(timeMatch[2]),
  }
}

export function dateInputValue(instant: Date, zone: string): string {
  const p = partsInZone(instant, zone)
  const year = String(p.year).padStart(4, '0')
  const month = String(p.month).padStart(2, '0')
  const day = String(p.day).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function readZone(instant: Date, zone: string): ZoneReading {
  const p = partsInZone(instant, zone)
  const hour = String(p.hour).padStart(2, '0')
  const minute = String(p.minute).padStart(2, '0')
  const dateLong = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).formatToParts(instant)
  const pick = (type: string) => dateLong.find((part) => part.type === type)?.value ?? ''

  const abbreviation =
    new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'short' })
      .formatToParts(instant)
      .find((part) => part.type === 'timeZoneName')?.value ?? ''

  return {
    time: `${hour}:${minute}`,
    weekday: pick('weekday'),
    date: `${pick('day')} ${pick('month')} ${pick('year')}`,
    abbreviation,
    offsetMinutes: zoneOffsetMinutes(instant, zone),
  }
}

export function convertWallTime(
  fromZone: string,
  toZone: string,
  date: string,
  time: string,
): Conversion | null {
  if (!isValidZone(fromZone) || !isValidZone(toZone)) return null
  const wall = parseWallTime(date, time)
  if (!wall) return null
  const instant = wallTimeToInstant(fromZone, wall)
  if (!instant) return null

  const from = readZone(instant, fromZone)
  const to = readZone(instant, toZone)

  return { instant, from, to, dayShift: dayShift(instant, fromZone, toZone) }
}

function dayShift(instant: Date, fromZone: string, toZone: string): number {
  const a = partsInZone(instant, fromZone)
  const b = partsInZone(instant, toZone)
  const dayA = Date.UTC(a.year, a.month - 1, a.day)
  const dayB = Date.UTC(b.year, b.month - 1, b.day)
  return Math.round((dayB - dayA) / 86400000)
}

/** "UTC+05:30", "UTC−04:00" — the minus sign is a real minus, not a hyphen. */
export function offsetLabel(offsetMinutes: number): string {
  const sign = offsetMinutes < 0 ? '−' : '+'
  const absolute = Math.abs(offsetMinutes)
  const hours = String(Math.floor(absolute / 60)).padStart(2, '0')
  const minutes = String(absolute % 60).padStart(2, '0')
  return `UTC${sign}${hours}:${minutes}`
}

/** Human gap between two offsets: "3 hours behind", "5 hours 30 minutes ahead". */
export function describeGap(fromOffset: number, toOffset: number): string {
  const diff = toOffset - fromOffset
  if (diff === 0) return 'same clock time'
  const absolute = Math.abs(diff)
  const hours = Math.floor(absolute / 60)
  const minutes = absolute % 60
  const chunks: string[] = []
  if (hours > 0) chunks.push(`${hours} hour${hours === 1 ? '' : 's'}`)
  if (minutes > 0) chunks.push(`${minutes} minute${minutes === 1 ? '' : 's'}`)
  return `${chunks.join(' ')} ${diff > 0 ? 'ahead' : 'behind'}`
}

export function nextDayLabel(shift: number): string {
  if (shift === 0) return 'same day'
  if (shift === 1) return 'next day'
  if (shift === -1) return 'previous day'
  return shift > 0 ? `${shift} days later` : `${Math.abs(shift)} days earlier`
}
