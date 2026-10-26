// Roman numeral converter: integer <-> Roman numeral string.
// Supports the standard subtractive notation for 1 to 3999.

const ROMAN_VALUES: ReadonlyArray<[number, string]> = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
]

// Convert a positive integer (1-3999) to a Roman numeral string.
// Returns null for out-of-range or non-integer input.
export function toRoman(num: number): string | null {
  if (!Number.isInteger(num) || num < 1 || num > 3999) return null
  let result = ''
  let remaining = num
  for (const [value, symbol] of ROMAN_VALUES) {
    while (remaining >= value) {
      result += symbol
      remaining -= value
    }
  }
  return result
}

const ROMAN_CHAR_VALUE: Record<string, number> = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
}

// Convert a Roman numeral string to an integer. Returns null for invalid input.
// Handles both subtractive (IV, IX) and additive (IIII) notation, but rejects
// non-Roman characters and malformed sequences.
export function fromRoman(roman: string): number | null {
  if (typeof roman !== 'string') return null
  const upper = roman.trim().toUpperCase()
  if (upper.length === 0) return null
  if (!/^[IVXLCDM]+$/.test(upper)) return null

  let total = 0
  let prev = 0
  // Iterate from right to left so subtractive pairs are easy to detect.
  for (let i = upper.length - 1; i >= 0; i--) {
    const value = ROMAN_CHAR_VALUE[upper[i]]
    if (value === undefined) return null
    if (value < prev) {
      total -= value
    } else {
      total += value
    }
    prev = value
  }

  // Verify the result round-trips to the same canonical Roman numeral. This
  // catches malformed sequences like IL or IIX that parse to a number but are
  // not valid standard notation.
  const canonical = toRoman(total)
  if (canonical === null || canonical !== upper) return null
  return total
}
