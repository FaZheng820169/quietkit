// Base converter between binary (2), octal (8), decimal (10) and hexadecimal (16).

export type Base = 2 | 8 | 10 | 16

const BASE_LABELS: Record<Base, string> = {
  2: 'binary',
  8: 'octal',
  10: 'decimal',
  16: 'hexadecimal',
}

// Validate that a string is a valid number in the given base.
export function isValid(value: string, base: Base): boolean {
  if (value === '' || value === undefined) return false
  const pattern: Record<Base, RegExp> = {
    2: /^[01]+$/,
    8: /^[0-7]+$/,
    10: /^[0-9]+$/,
    16: /^[0-9a-fA-F]+$/,
  }
  return pattern[base].test(value)
}

// Parse a string in the given base to a decimal number. Returns null if invalid.
export function parseBase(value: string, base: Base): number | null {
  if (!isValid(value, base)) return null
  const n = parseInt(value, base)
  if (!Number.isFinite(n) || n < 0) return null
  return n
}

// Convert a decimal number to a string in the given base. Hex is uppercased.
export function toBase(n: number, base: Base): string {
  return n.toString(base).toUpperCase()
}

export { BASE_LABELS }
