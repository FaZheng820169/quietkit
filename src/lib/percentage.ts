// Four common percentage calculations. Each is a one-liner; the care is in
// handling edge cases (division by zero, negative bases for change) and in
// rounding the display to a sensible precision.

// What is `percent`% of `base`?  e.g. percentOf(15, 200) = 30
export function percentOf(percent: number, base: number): number {
  return (base * percent) / 100
}

// `value` is what percent of `base`?  e.g. whatPercent(30, 200) = 15
export function whatPercent(value: number, base: number): number {
  if (base === 0) return NaN
  return (value / base) * 100
}

// Percentage change from `from` to `to`.  e.g. percentChange(200, 230) = 15
// Negative result means a decrease. Uses the absolute value of `from` so a
// negative starting point still gives a meaningful direction.
export function percentChange(from: number, to: number): number {
  if (from === 0) return NaN
  return ((to - from) / Math.abs(from)) * 100
}

// `percent`% of what number equals `result`?  e.g. ofWhat(15, 30) = 200
export function ofWhat(percent: number, result: number): number {
  if (percent === 0) return NaN
  return (result / percent) * 100
}

// Round to `decimals` places, defaulting to a display-friendly 6.
export function roundTo(n: number, decimals = 6): number {
  if (!Number.isFinite(n)) return n
  const f = Math.pow(10, decimals)
  return Math.round((n + Number.EPSILON) * f) / f
}

// Format a percentage for display: trim trailing zeros, add a % sign.
export function formatPercent(n: number, decimals = 4): string {
  if (!Number.isFinite(n)) return '—'
  const r = roundTo(n, decimals)
  // Trim trailing zeros after the decimal point.
  const s = r.toString()
  return `${s}%`
}

// Format a plain number with thousands separators and up to `decimals` places,
// trimming trailing zeros.
export function formatNumber(n: number, decimals = 6): string {
  if (!Number.isFinite(n)) return '—'
  const r = roundTo(n, decimals)
  const [intPart, decPart] = r.toString().split('.')
  const intWithSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  if (!decPart) return intWithSep
  return `${intWithSep}.${decPart.replace(/0+$/, '')}`
}
