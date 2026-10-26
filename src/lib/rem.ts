// CSS px <-> rem conversion. The root font size is configurable (default 16px,
// the browser default). Supports single values and a batch mode that converts
// every px/rem token in a block of text, leaving everything else untouched.

export const DEFAULT_ROOT_FONT_SIZE = 16

// Round to `decimals` places and trim trailing zeros.
function fmt(n: number, decimals = 4): string {
  if (!Number.isFinite(n)) return '—'
  const r = Math.round((n + Number.EPSILON) * Math.pow(10, decimals)) / Math.pow(10, decimals)
  const s = r.toString()
  return s
}

// px -> rem
export function pxToRem(px: number, root = DEFAULT_ROOT_FONT_SIZE): number {
  if (root <= 0) return NaN
  return px / root
}

// rem -> px
export function remToPx(rem: number, root = DEFAULT_ROOT_FONT_SIZE): number {
  if (root <= 0) return NaN
  return rem * root
}

export interface BatchResult {
  original: string
  converted: string
  count: number
}

// Replace every `Npx` token in `text` with its rem equivalent, and every
// `Nrem` token with its px equivalent. Numbers without a unit are left alone.
export function convertBatch(text: string, root = DEFAULT_ROOT_FONT_SIZE): BatchResult {
  let count = 0
  const converted = text.replace(/(-?\d*\.?\d+)(px|rem)\b/g, (_match, numStr: string, unit: string) => {
    const num = Number(numStr)
    if (!Number.isFinite(num)) return _match
    count += 1
    if (unit === 'px') {
      return `${fmt(pxToRem(num, root))}rem`
    }
    return `${fmt(remToPx(num, root))}px`
  })
  return { original: text, converted, count }
}

// A small px->rem lookup table for the common range at a given root size.
export function remTable(root = DEFAULT_ROOT_FONT_SIZE, maxPx = 100): { px: number; rem: string }[] {
  const rows: { px: number; rem: string }[] = []
  for (let px = 1; px <= maxPx; px++) {
    rows.push({ px, rem: fmt(pxToRem(px, root)) })
  }
  return rows
}
