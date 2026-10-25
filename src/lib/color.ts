export type Rgb = { r: number; g: number; b: number }
export type Hsl = { h: number; s: number; l: number }

/** Parse #rgb, #rrggbb, #rrggbbaa. Returns null on invalid input. */
export function hexToRgb(hex: string): Rgb | null {
  const cleaned = hex.replace(/^#/, '')
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$|^[0-9a-fA-F]{8}$/.test(cleaned)) return null

  let r: number, g: number, b: number
  if (cleaned.length === 3) {
    r = parseInt(cleaned[0] + cleaned[0], 16)
    g = parseInt(cleaned[1] + cleaned[1], 16)
    b = parseInt(cleaned[2] + cleaned[2], 16)
  } else {
    r = parseInt(cleaned.slice(0, 2), 16)
    g = parseInt(cleaned.slice(2, 4), 16)
    b = parseInt(cleaned.slice(4, 6), 16)
  }
  return { r, g, b }
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const to = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0')
  return `#${to(r)}${to(g)}${to(b)}`
}

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  const l = (max + min) / 2
  const d = max - min

  if (d !== 0) {
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break
      case g: h = ((b - r) / d + 2) * 60; break
      case b: h = ((r - g) / d + 4) * 60; break
    }
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) }
  }
  return { h: 0, s: 0, l: Math.round(l * 100) }
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  s /= 100
  l /= 100
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return {
    r: Math.round(f(0) * 255),
    g: Math.round(f(8) * 255),
    b: Math.round(f(4) * 255),
  }
}

export function rgbToHsv({ r, g, b }: Rgb): { h: number; s: number; v: number } {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break
      case g: h = ((b - r) / d + 2) * 60; break
      case b: h = ((r - g) / d + 4) * 60; break
    }
  }
  const s = max === 0 ? 0 : d / max
  return { h: Math.round(h), s: Math.round(s * 100), v: Math.round(max * 100) }
}

/** Relative luminance (WCAG) */
export function luminance({ r, g, b }: Rgb): number {
  const f = (c: number) => {
    c /= 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

/** Contrast ratio against another colour (WCAG) */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const l1 = luminance(a)
  const l2 = luminance(b)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/** Complementary colour (hue + 180°) */
export function complement(rgb: Rgb): Rgb {
  const hsl = rgbToHsl(rgb)
  return hslToRgb({ h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l })
}

/** Analogous colours (hue ±30°) */
export function analogous(rgb: Rgb): [Rgb, Rgb] {
  const hsl = rgbToHsl(rgb)
  return [
    hslToRgb({ h: (hsl.h + 30) % 360, s: hsl.s, l: hsl.l }),
    hslToRgb({ h: (hsl.h - 30 + 360) % 360, s: hsl.s, l: hsl.l }),
  ]
}

/** Triadic colours (hue +120° and +240°) */
export function triadic(rgb: Rgb): [Rgb, Rgb] {
  const hsl = rgbToHsl(rgb)
  return [
    hslToRgb({ h: (hsl.h + 120) % 360, s: hsl.s, l: hsl.l }),
    hslToRgb({ h: (hsl.h + 240) % 360, s: hsl.s, l: hsl.l }),
  ]
}

export function formatRgb({ r, g, b }: Rgb): string {
  return `rgb(${r}, ${g}, ${b})`
}

export function formatHsl({ h, s, l }: Hsl): string {
  return `hsl(${h}, ${s}%, ${l}%)`
}
