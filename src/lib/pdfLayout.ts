/**
 * Shared page-number options and geometry for the PDF tools. Kept in its own
 * module so the stamping page can use them without pulling pdf-lib into the
 * main bundle.
 */

export type PageNumberPosition =
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'top-left'
  | 'top-center'
  | 'top-right'

export type PageNumberFormat = 'plain' | 'slash' | 'page-of'

export type PageNumberOptions = {
  position: PageNumberPosition
  format: PageNumberFormat
  start: number
  fontSize: number
  skipFirst: boolean
}

export type PageNumberResult = {
  blob: Blob
  pages: number
  numbered: number
}

/** Gap between the printed number and the paper edge, in points (≈8.5 mm). */
export const PAGE_NUMBER_EDGE = 24

export type WatermarkPosition = 'center' | 'tile'

/** Slant of the mark, measured anticlockwise from horizontal. */
export type WatermarkAngle = 0 | 45 | 90

export type WatermarkOptions = {
  text: string
  fontSize: number
  opacity: number
  angle: WatermarkAngle
  position: WatermarkPosition
  /** Empty means every page; otherwise ranges like "1-3, 7". */
  range: string
}

export type WatermarkResult = {
  blob: Blob
  pages: number
  marked: number
}

/**
 * Distance between repeated marks on a tiled page, in points. The advance is
 * approximated from the character count rather than measured, so the live
 * preview can lay out the same grid before pdf-lib is loaded.
 */
export function watermarkSpacing(text: string, fontSize: number): { x: number; y: number } {
  const advance = Math.max(text.trim().length, 1) * fontSize * 0.6
  return {
    x: Math.max(advance * 1.9, fontSize * 6),
    y: fontSize * 5.5,
  }
}

export type PdfPaper = 'a4' | 'letter' | 'legal' | 'a5' | 'a3'

/** Sheet sizes in points (1 pt = 1/72 inch), portrait orientation. */
export const PDF_PAPERS: Record<PdfPaper, { label: string; width: number; height: number }> = {
  a4: { label: 'A4', width: 595.28, height: 841.89 },
  letter: { label: 'Letter', width: 612, height: 792 },
  legal: { label: 'Legal', width: 612, height: 1008 },
  a3: { label: 'A3', width: 841.89, height: 1190.55 },
  a5: { label: 'A5', width: 419.53, height: 595.28 },
}

export type PdfOrientation = 'auto' | 'portrait' | 'landscape'
export type PdfFitMode = 'fit' | 'fill'

export type ResizeOptions = {
  paper: PdfPaper
  orientation: PdfOrientation
  mode: PdfFitMode
}

export type ResizeResult = {
  blob: Blob
  pages: number
  scaled: number
}

// Sizes in points, short side first, with a ±4 pt tolerance so the usual
// rounding differences between producers still land on the right name.
const PAPERS: [string, number, number][] = [
  ['A3', 841.89, 1190.55],
  ['A4', 595.28, 841.89],
  ['A5', 419.53, 595.28],
  ['Letter', 612, 792],
  ['Legal', 612, 1008],
  ['Tabloid', 792, 1224],
]

export function paperName(width: number, height: number): string {
  const short = Math.min(width, height)
  const long = Math.max(width, height)
  for (const [name, paperShort, paperLong] of PAPERS) {
    if (Math.abs(short - paperShort) <= 4 && Math.abs(long - paperLong) <= 4) return name
  }
  return 'Custom'
}

/**
 * The sheet a page is mapped onto. "auto" keeps each page's own orientation,
 * so a landscape spread stays landscape instead of being squeezed into portrait.
 */
export function targetSize(
  paper: PdfPaper,
  orientation: PdfOrientation,
  sourceLandscape: boolean,
): { width: number; height: number } {
  const { width, height } = PDF_PAPERS[paper]
  const landscape = orientation === 'landscape' || (orientation === 'auto' && sourceLandscape)
  return landscape ? { width: height, height: width } : { width, height }
}

export type PdfPageBox = {
  paper: string
  width: number
  height: number
  rotation: number
  landscape: boolean
}
