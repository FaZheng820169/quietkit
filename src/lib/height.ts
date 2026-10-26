// Height unit converter: centimetres <-> feet and inches.

export const CM_PER_INCH = 2.54
export const INCHES_PER_FOOT = 12

export interface FeetInches {
  feet: number
  inches: number
}

// Centimetres to total inches.
export function cmToInches(cm: number): number {
  return cm / CM_PER_INCH
}

// Total inches to centimetres.
export function inchesToCm(inches: number): number {
  return inches * CM_PER_INCH
}

// Feet + inches to total inches.
export function feetInchesToInches(feet: number, inches: number): number {
  return feet * INCHES_PER_FOOT + inches
}

// Total inches to feet + inches (inches rounded to a given precision).
export function inchesToFeetInches(totalInches: number, precision = 1): FeetInches {
  const feet = Math.floor(totalInches / INCHES_PER_FOOT)
  const inches = roundTo(totalInches - feet * INCHES_PER_FOOT, precision)
  // Handle rounding that pushes inches to 12.
  if (inches >= INCHES_PER_FOOT) {
    return { feet: feet + 1, inches: roundTo(inches - INCHES_PER_FOOT, precision) }
  }
  return { feet, inches }
}

// Centimetres to feet + inches.
export function cmToFeetInches(cm: number, precision = 1): FeetInches {
  return inchesToFeetInches(cmToInches(cm), precision)
}

// Feet + inches to centimetres.
export function feetInchesToCm(feet: number, inches: number): number {
  return inchesToCm(feetInchesToInches(feet, inches))
}

// Round to a given number of decimal places.
export function roundTo(n: number, decimals: number): number {
  const f = Math.pow(10, decimals)
  return Math.round(n * f) / f
}

// Round to 0 decimals for cm display.
export function roundCm(cm: number): number {
  return Math.round(cm * 10) / 10
}
