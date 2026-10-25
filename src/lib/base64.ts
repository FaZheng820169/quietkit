// Base64 encode/decode for text and bytes. Unicode-safe: text is converted
// through UTF-8 before encoding. Everything runs in memory in this tab.

export interface Base64Result {
  ok: boolean
  output: string
  error?: string
}

const B64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

function bytesToBase64(bytes: Uint8Array, alphabet: string, pad: boolean): string {
  let out = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i]
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0
    out += alphabet[b0 >> 2]
    out += alphabet[((b0 & 3) << 4) | (b1 >> 4)]
    out += i + 1 < bytes.length ? alphabet[((b1 & 15) << 2) | (b2 >> 6)] : pad ? '=' : ''
    out += i + 2 < bytes.length ? alphabet[b2 & 63] : pad ? '=' : ''
  }
  return out
}

function base64ToBytes(input: string, urlSafe: boolean): Uint8Array {
  let s = input.replace(/\s+/g, '')
  if (urlSafe) s = s.replace(/-/g, '+').replace(/_/g, '/')
  if (/[^A-Za-z0-9+/=]/.test(s)) {
    throw new Error('Input contains characters outside the Base64 alphabet.')
  }
  if (s.length % 4 === 1) {
    throw new Error('Invalid length — a Base64 string is a multiple of 4 characters.')
  }
  // Tolerate missing padding.
  while (s.length % 4 !== 0) s += '='
  const pad = s.endsWith('==') ? 2 : s.endsWith('=') ? 1 : 0
  // Decode padding slots as zero bits and simply not write the padded bytes.
  const clean = s.replace(/=/g, 'A')
  const bytes = new Uint8Array((clean.length / 4) * 3 - pad)
  let o = 0
  for (let i = 0; i < clean.length; i += 4) {
    const n =
      (B64_ALPHABET.indexOf(clean[i]) << 18) |
      (B64_ALPHABET.indexOf(clean[i + 1]) << 12) |
      (B64_ALPHABET.indexOf(clean[i + 2]) << 6) |
      B64_ALPHABET.indexOf(clean[i + 3])
    if (o < bytes.length) bytes[o++] = (n >> 16) & 255
    if (o < bytes.length) bytes[o++] = (n >> 8) & 255
    if (o < bytes.length) bytes[o++] = n & 255
  }
  return bytes
}

export function encodeText(text: string, urlSafe = false): string {
  const bytes = new TextEncoder().encode(text)
  const alphabet = urlSafe ? B64_ALPHABET.replace(/\+/g, '-').replace(/\//g, '_') : B64_ALPHABET
  return bytesToBase64(bytes, alphabet, !urlSafe)
}

export function decodeToText(b64: string, urlSafe = false): Base64Result {
  if (b64.trim() === '') return { ok: true, output: '' }
  try {
    const bytes = base64ToBytes(b64, urlSafe)
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    return { ok: true, output: text }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Decode failed.'
    return {
      ok: false,
      output: '',
      error:
        msg === 'The encoded data was not valid.'
          ? 'Decoded bytes are not valid UTF-8 text. This may be a binary file — Base64 of images or archives will not decode to readable text.'
          : msg,
    }
  }
}

export function encodeBytes(bytes: Uint8Array, urlSafe = false): string {
  const alphabet = urlSafe ? B64_ALPHABET.replace(/\+/g, '-').replace(/\//g, '_') : B64_ALPHABET
  return bytesToBase64(bytes, alphabet, !urlSafe)
}

export function decodeToBytes(b64: string, urlSafe = false): Base64Result & { bytes?: Uint8Array } {
  if (b64.trim() === '') return { ok: true, output: '', bytes: new Uint8Array(0) }
  try {
    const bytes = base64ToBytes(b64, urlSafe)
    return { ok: true, output: '', bytes }
  } catch (e) {
    return { ok: false, output: '', error: e instanceof Error ? e.message : 'Decode failed.' }
  }
}

export function looksLikeBase64(s: string): boolean {
  const t = s.trim().replace(/\s+/g, '')
  if (t.length < 4 || t.length % 4 === 1) return false
  return /^[A-Za-z0-9+/]*={0,2}$/.test(t) || /^[A-Za-z0-9\-_]*={0,2}$/.test(t)
}
