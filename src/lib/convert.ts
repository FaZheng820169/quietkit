// Unit conversion with exact definitions, not approximations. Every factor is
// the legal/SI definition: 1 inch = 25.4 mm exactly, 1 lb = 0.45359237 kg
// exactly, 1 mile = 1609.344 m exactly. Temperature converts through its
// affine form; everything else is a single ratio to the SI base unit.

export type UnitCategory = 'length' | 'mass' | 'temperature' | 'data'

export interface Unit {
  id: string
  label: string
  symbol: string
  /** To the category's base unit: multiply. For temperature this is unused. */
  factor?: number
  /** Base-unit offset for affine conversions (temperature). */
  toBase?: (value: number) => number
  fromBase?: (base: number) => number
}

export interface Category {
  id: UnitCategory
  label: string
  base: string
  units: Unit[]
}

export const CATEGORIES: Category[] = [
  {
    id: 'length',
    label: 'Length',
    base: 'metre',
    units: [
      { id: 'mm', label: 'Millimetres', symbol: 'mm', factor: 0.001 },
      { id: 'cm', label: 'Centimetres', symbol: 'cm', factor: 0.01 },
      { id: 'm', label: 'Metres', symbol: 'm', factor: 1 },
      { id: 'km', label: 'Kilometres', symbol: 'km', factor: 1000 },
      { id: 'in', label: 'Inches', symbol: 'in', factor: 0.0254 },
      { id: 'ft', label: 'Feet', symbol: 'ft', factor: 0.3048 },
      { id: 'yd', label: 'Yards', symbol: 'yd', factor: 0.9144 },
      { id: 'mi', label: 'Miles', symbol: 'mi', factor: 1609.344 },
    ],
  },
  {
    id: 'mass',
    label: 'Weight',
    base: 'kilogram',
    units: [
      { id: 'mg', label: 'Milligrams', symbol: 'mg', factor: 1e-6 },
      { id: 'g', label: 'Grams', symbol: 'g', factor: 0.001 },
      { id: 'kg', label: 'Kilograms', symbol: 'kg', factor: 1 },
      { id: 't', label: 'Metric tonnes', symbol: 't', factor: 1000 },
      { id: 'oz', label: 'Ounces', symbol: 'oz', factor: 0.028349523125 },
      { id: 'lb', label: 'Pounds', symbol: 'lb', factor: 0.45359237 },
      { id: 'st', label: 'Stone', symbol: 'st', factor: 6.35029318 },
    ],
  },
  {
    id: 'temperature',
    label: 'Temperature',
    base: 'kelvin',
    units: [
      {
        id: 'c',
        label: 'Celsius',
        symbol: '°C',
        toBase: (v) => v + 273.15,
        fromBase: (k) => k - 273.15,
      },
      {
        id: 'f',
        label: 'Fahrenheit',
        symbol: '°F',
        toBase: (v) => ((v - 32) * 5) / 9 + 273.15,
        fromBase: (k) => ((k - 273.15) * 9) / 5 + 32,
      },
      {
        id: 'k',
        label: 'Kelvin',
        symbol: 'K',
        toBase: (v) => v,
        fromBase: (k) => k,
      },
    ],
  },
  {
    id: 'data',
    label: 'Data size',
    base: 'byte',
    units: [
      { id: 'b', label: 'Bytes', symbol: 'B', factor: 1 },
      { id: 'kb', label: 'Kilobytes (10³)', symbol: 'KB', factor: 1e3 },
      { id: 'mb', label: 'Megabytes (10⁶)', symbol: 'MB', factor: 1e6 },
      { id: 'gb', label: 'Gigabytes (10⁹)', symbol: 'GB', factor: 1e9 },
      { id: 'tb', label: 'Terabytes (10¹²)', symbol: 'TB', factor: 1e12 },
      { id: 'kib', label: 'Kibibytes (2¹⁰)', symbol: 'KiB', factor: 1024 },
      { id: 'mib', label: 'Mebibytes (2²⁰)', symbol: 'MiB', factor: 1024 ** 2 },
      { id: 'gib', label: 'Gibibytes (2³⁰)', symbol: 'GiB', factor: 1024 ** 3 },
      { id: 'tib', label: 'Tebibytes (2⁴⁰)', symbol: 'TiB', factor: 1024 ** 4 },
    ],
  },
]

export function getCategory(id: UnitCategory): Category {
  const cat = CATEGORIES.find((c) => c.id === id)
  if (!cat) throw new Error(`unknown category: ${id}`)
  return cat
}

export function convert(
  value: number,
  fromId: string,
  toId: string,
  categoryId: UnitCategory,
): number {
  const cat = getCategory(categoryId)
  const from = cat.units.find((u) => u.id === fromId)
  const to = cat.units.find((u) => u.id === toId)
  if (!from || !to) throw new Error(`unknown units: ${fromId} -> ${toId}`)
  if (cat.id === 'temperature') {
    const base = from.toBase!(value)
    return to.fromBase!(base)
  }
  return (value * from.factor!) / to.factor!
}

// Display formatting: enough significant digits to be exact for common
// conversions, trimmed of floating-point noise (0.30000000000000004).
export function formatResult(value: number): string {
  if (!Number.isFinite(value)) return '—'
  if (value === 0) return '0'
  const abs = Math.abs(value)
  if (abs >= 1e15 || abs < 1e-9) return value.toExponential(6).replace(/\.?0+e/, 'e')
  const rounded = Number(value.toPrecision(12))
  return rounded.toLocaleString('en-US', {
    maximumFractionDigits: 9,
    useGrouping: false,
  })
}
