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
