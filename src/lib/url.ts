// URL percent-encoding and decoding. Two modes, matching the web platform:
// "component" encodes everything except unreserved characters (encodeURIComponent),
// "full URL" keeps the URL's structural characters readable (encodeURI).
// Decoding reports malformed percent-sequences honestly instead of throwing.

export interface UrlResult {
  ok: boolean
  output: string
  error?: string
}

export type EncodeMode = 'component' | 'full'

export function encodeUrl(input: string, mode: EncodeMode): string {
  if (input === '') return ''
  return mode === 'component' ? encodeURIComponent(input) : encodeURI(input)
}

export function decodeUrl(input: string, plusAsSpace = false): UrlResult {
  if (input === '') return { ok: true, output: '' }
  // Validate percent-sequences first so the error can say where it broke.
  const bad = /%(?![0-9A-Fa-f]{2})/.exec(input)
  if (bad) {
    return {
      ok: false,
      output: '',
      error: `Malformed percent-escape at position ${bad.index}: "%${input.slice(bad.index + 1, bad.index + 3)}" — a % must be followed by two hex digits.`,
    }
  }
  const prepared = plusAsSpace ? input.replace(/\+/g, ' ') : input
  try {
    return { ok: true, output: decodeURIComponent(prepared) }
  } catch {
    return {
      ok: false,
      output: '',
      error:
        'Invalid escape sequence — the percent-encoded bytes do not form valid UTF-8 text.',
    }
  }
}

export interface QueryParam {
  key: string
  value: string
}

// Parse a query string (with or without the leading ?) into decoded pairs.
// Follows application/x-www-form-urlencoded: + means space, pairs split on &,
// a bare key gets an empty value. Duplicate keys are preserved in order.
export function parseQuery(input: string): QueryParam[] {
  let s = input.trim()
  const q = s.indexOf('?')
  if (q >= 0) s = s.slice(q + 1)
  const hash = s.indexOf('#')
  if (hash >= 0) s = s.slice(0, hash)
  if (s === '') return []
  const out: QueryParam[] = []
  for (const pair of s.split('&')) {
    if (pair === '') continue
    const eq = pair.indexOf('=')
    const rawKey = eq >= 0 ? pair.slice(0, eq) : pair
    const rawValue = eq >= 0 ? pair.slice(eq + 1) : ''
    out.push({ key: decodeField(rawKey), value: decodeField(rawValue) })
  }
  return out
}

function decodeField(s: string): string {
  const r = decodeUrl(s, true)
  return r.ok ? r.output : s
}

// Build a query string from pairs, component-encoding keys and values.
export function buildQuery(params: QueryParam[]): string {
  return params
    .filter((p) => p.key !== '')
    .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
    .join('&')
}

// Quick structural read of a full URL. Returns null when the input is not an
// absolute URL — the tool reports that honestly instead of guessing.
export interface UrlParts {
  protocol: string
  host: string
  path: string
  query: string
  fragment: string
}

export function splitUrl(input: string): UrlParts | null {
  try {
    const u = new URL(input)
    return {
      protocol: u.protocol.replace(':', ''),
      host: u.host,
      path: u.pathname,
      query: u.search.replace(/^\?/, ''),
      fragment: u.hash.replace(/^#/, ''),
    }
  } catch {
    return null
  }
}
