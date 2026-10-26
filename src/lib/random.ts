// Cryptographically random integers and decimals, drawn from the browser's
// CSPRNG (crypto.getRandomValues) when available. A seeded mulberry32 mode is
// also offered so a sequence can be reproduced — useful for tests, fixtures
// and board-game replays.

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Uniform random float in [0, 1) from crypto when present, else Math.random.
function randomSource(seed?: number): () => number {
  if (seed !== undefined) return mulberry32(seed)
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    return () => {
      const buf = new Uint32Array(1)
      crypto.getRandomValues(buf)
      return buf[0] / 4294967296
    }
  }
  return Math.random
}

// A uniformly random integer in the inclusive range [min, max].
export function randomInt(min: number, max: number, seed?: number): number {
  if (min > max) [min, max] = [max, min]
  min = Math.ceil(min)
  max = Math.floor(max)
  if (min === max) return min
  const range = max - min + 1
  const rand = randomSource(seed)
  // Keep rejection small: discard partial-range values to avoid modulo bias.
  const limit = Math.floor(4294967296 / range) * range
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const v = Math.floor(rand() * 4294967296)
    if (v < limit) return min + (v % range)
  }
}

// A uniformly random decimal in [min, max) rounded to `decimals` places.
export function randomDecimal(min: number, max: number, decimals: number, seed?: number): number {
  if (min > max) [min, max] = [max, min]
  const rand = randomSource(seed)
  const raw = min + rand() * (max - min)
  const f = Math.pow(10, decimals)
  return Math.round(raw * f) / f
}

// Generate `count` integers in [min, max]. When unique is true, no repeats —
// throws if the range is smaller than the requested count.
export function generateIntegers(
  count: number,
  min: number,
  max: number,
  unique: boolean,
  seed?: number,
): number[] {
  const lo = Math.ceil(Math.min(min, max))
  const hi = Math.floor(Math.max(min, max))
  const n = Math.max(1, Math.min(10000, Math.floor(count)))
  if (unique) {
    const span = hi - lo + 1
    if (n > span) throw new Error(`Cannot draw ${n} unique numbers from a range of ${span}.`)
    const rand = randomSource(seed)
    const pool: number[] = []
    for (let i = lo; i <= hi; i++) pool.push(i)
    // Fisher-Yates shuffle, then take the first n.
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }
    return pool.slice(0, n)
  }
  const out: number[] = []
  for (let i = 0; i < n; i++) out.push(randomInt(lo, hi, seed))
  return out
}

export function generateDecimals(
  count: number,
  min: number,
  max: number,
  decimals: number,
  seed?: number,
): number[] {
  const n = Math.max(1, Math.min(10000, Math.floor(count)))
  const out: number[] = []
  for (let i = 0; i < n; i++) out.push(randomDecimal(min, max, decimals, seed))
  return out
}
