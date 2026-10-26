// Aspect ratio math — pure arithmetic, no units, no upload. A ratio is just
// width divided by height, and every operation below is multiplication or
// division on that fraction.

export interface Size {
  width: number
  height: number
}

// Greatest common divisor via the Euclidean algorithm. Used to reduce a pixel
// size to its simplest integer ratio (e.g. 1920x1080 -> 16:9).
export function gcd(a: number, b: number): number {
  a = Math.abs(Math.floor(a))
  b = Math.abs(Math.floor(b))
  while (b !== 0) {
    ;[a, b] = [b, a % b]
  }
  return a || 1
}

// Reduce a pixel size to its smallest integer ratio.
export function simplifyRatio(width: number, height: number): Size {
  const g = gcd(width, height)
  return { width: Math.round(width / g), height: Math.round(height / g) }
}

// The common preset ratios designers reach for, as simple integer pairs.
export const PRESET_RATIOS: { label: string; width: number; height: number }[] = [
  { label: '16:9 (HD)', width: 16, height: 9 },
  { label: '9:16 (Vertical)', width: 9, height: 16 },
  { label: '4:3', width: 4, height: 3 },
  { label: '3:2', width: 3, height: 2 },
  { label: '2:3', width: 2, height: 3 },
  { label: '1:1 (Square)', width: 1, height: 1 },
  { label: '21:9 (Ultrawide)', width: 21, height: 9 },
  { label: '5:4', width: 5, height: 4 },
]

// Given a ratio (rw:rh) and a target width, return the matching height.
export function heightForWidth(rw: number, rh: number, width: number): number {
  if (rw === 0) throw new Error('Ratio width cannot be zero.')
  return (width * rh) / rw
}

// Given a ratio (rw:rh) and a target height, return the matching width.
export function widthForHeight(rw: number, rh: number, height: number): number {
  if (rh === 0) throw new Error('Ratio height cannot be zero.')
  return (height * rw) / rh
}

// Scale a size uniformly by a factor (0.5 = half, 2 = double).
export function scaleBy(width: number, height: number, factor: number): Size {
  if (factor <= 0) throw new Error('Scale factor must be positive.')
  return { width: width * factor, height: height * factor }
}

// Fit a ratio inside a box (contain): the largest size that fits without
// cropping.
export function fitBox(rw: number, rh: number, maxW: number, maxH: number): Size {
  const ratio = rw / rh
  const boxRatio = maxW / maxH
  if (ratio > boxRatio) {
    return { width: maxW, height: maxW / ratio }
  }
  return { width: maxH * ratio, height: maxH }
}

// Fill a box with a ratio (cover): the smallest size that covers it entirely,
// cropping the overflow.
export function fillBox(rw: number, rh: number, maxW: number, maxH: number): Size {
  const ratio = rw / rh
  const boxRatio = maxW / maxH
  if (ratio > boxRatio) {
    return { width: maxH * ratio, height: maxH }
  }
  return { width: maxW, height: maxW / ratio }
}

// The diagonal length in pixels — useful for comparing sizes across ratios.
export function diagonal(width: number, height: number): number {
  return Math.sqrt(width * width + height * height)
}

export function isLandscape(w: number, h: number): boolean {
  return w > h
}

export function isPortrait(w: number, h: number): boolean {
  return h > w
}

export function isSquare(w: number, h: number): boolean {
  return w === h
}
