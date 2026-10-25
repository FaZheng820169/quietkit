export type PasswordOptions = {
  length: number
  lowercase: boolean
  uppercase: boolean
  digits: boolean
  symbols: boolean
  excludeAmbiguous: boolean
}

const SETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
}

const AMBIGUOUS = /[0O1lI|]/g

function buildCharset(opts: PasswordOptions): string {
  let chars = ''
  if (opts.lowercase) chars += SETS.lowercase
  if (opts.uppercase) chars += SETS.uppercase
  if (opts.digits) chars += SETS.digits
  if (opts.symbols) chars += SETS.symbols
  if (opts.excludeAmbiguous) chars = chars.replace(AMBIGUOUS, '')
  return chars
}

/**
 * Generate one password with crypto.getRandomValues.
 * Throws if no character set is selected.
 */
export function generatePassword(opts: PasswordOptions): string {
  const charset = buildCharset(opts)
  if (charset.length === 0) throw new Error('Select at least one character set.')
  if (opts.length < 1 || opts.length > 512) throw new Error('Length must be 1–512.')

  const bytes = new Uint32Array(opts.length)
  crypto.getRandomValues(bytes)
  let out = ''
  for (let i = 0; i < opts.length; i++) {
    out += charset[bytes[i] % charset.length]
  }
  return out
}

export function generatePasswords(opts: PasswordOptions, count: number): string[] {
  return Array.from({ length: count }, () => generatePassword(opts))
}

/**
 * Rough entropy estimate in bits: log2(charsetSize^length).
 */
export function entropyBits(opts: PasswordOptions): number {
  const size = buildCharset(opts).length
  if (size === 0) return 0
  return Math.round(Math.log2(Math.pow(size, opts.length)))
}

export type Strength = 'weak' | 'fair' | 'good' | 'strong'

export function strengthLabel(bits: number): Strength {
  if (bits < 40) return 'weak'
  if (bits < 60) return 'fair'
  if (bits < 80) return 'good'
  return 'strong'
}
