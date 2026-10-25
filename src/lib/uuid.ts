// UUID v4 generation from crypto.getRandomValues — the same CSPRNG the
// browser uses for TLS keys. Format, uppercase and hyphen variants are
// display choices; the 122 bits of randomness are identical either way.

export type UuidFormat = 'hyphenated' | 'plain' | 'braced' | 'urn'

export interface UuidOptions {
  format: UuidFormat
  uppercase: boolean
}

export const UUID_FORMATS: Array<{ kind: UuidFormat; label: string; example: string }> = [
  {
    kind: 'hyphenated',
    label: 'Standard',
    example: '3b241101-e2bb-4255-8caf-4136c566a962',
  },
  { kind: 'plain', label: 'No hyphens', example: '3b241101e2bb42558caf4136c566a962' },
  { kind: 'braced', label: 'Braces', example: '{3b241101-e2bb-4255-8caf-4136c566a962}' },
  { kind: 'urn', label: 'URN', example: 'urn:uuid:3b241101-e2bb-4255-8caf-4136c566a962' },
]

function bytesToHex(bytes: Uint8Array): string {
  let hex = ''
  for (const b of bytes) hex += b.toString(16).padStart(2, '0')
  return hex
}

// One RFC 4122 version 4 UUID: 16 random bytes with the version nibble set
// to 4 and the two variant bits set to 10.
export function uuidV4Bytes(): Uint8Array {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  return bytes
}

export function formatUuid(bytes: Uint8Array, options: UuidOptions): string {
  const hex = bytesToHex(bytes)
  const hyphenated = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  let out: string
  switch (options.format) {
    case 'hyphenated':
      out = hyphenated
      break
    case 'plain':
      out = hex
      break
    case 'braced':
      out = `{${hyphenated}}`
      break
    case 'urn':
      out = `urn:uuid:${hyphenated}`
      break
  }
  return options.uppercase ? out.toUpperCase() : out
}

export function generateUuids(count: number, options: UuidOptions): string[] {
  const n = Math.max(1, Math.min(1000, Math.floor(count)))
  const uuids: string[] = []
  for (let i = 0; i < n; i++) uuids.push(formatUuid(uuidV4Bytes(), options))
  return uuids
}

// Collision probability for n v4 UUIDs, birthday-paradox approximation over
// the 122 random bits. Used to show honest odds on the tool page.
export function collisionOdds(count: number): string {
  const n = Math.max(1, Math.floor(count))
  // p ~ n^2 / (2 * 2^122) = n^2 / 2^123
  const log2p = 2 * Math.log2(n) - 123
  if (log2p < -1000) return 'effectively zero'
  const log10p = log2p * Math.log10(2)
  return `about 1 in 10^${Math.abs(Math.round(log10p))}`
}
