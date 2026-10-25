export type JsonResult = {
  ok: boolean
  data?: unknown
  error?: string
  errorLine?: number
  errorColumn?: number
}

/** Parse JSON and extract position info from V8-style error messages. */
export function parseJson(input: string): JsonResult {
  try {
    return { ok: true, data: JSON.parse(input) }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Invalid JSON'
    // V8: "... at position 123" or "... at line 4 column 15"
    const posMatch = msg.match(/at position (\d+)/)
    const lineColMatch = msg.match(/at line (\d+) column (\d+)/)

    if (lineColMatch) {
      return {
        ok: false,
        error: msg,
        errorLine: parseInt(lineColMatch[1], 10),
        errorColumn: parseInt(lineColMatch[2], 10),
      }
    }
    if (posMatch) {
      const pos = parseInt(posMatch[1], 10)
      let line = 1
      let col = 1
      for (let i = 0; i < Math.min(pos, input.length); i++) {
        if (input[i] === '\n') {
          line++
          col = 1
        } else {
          col++
        }
      }
      return { ok: false, error: msg, errorLine: line, errorColumn: col }
    }
    return { ok: false, error: msg }
  }
}

export function formatJson(input: string, indent: 2 | 4 | '\t'): JsonResult & { output?: string } {
  const result = parseJson(input)
  if (!result.ok) return result
  return { ...result, output: JSON.stringify(result.data, null, indent) }
}

export function minifyJson(input: string): JsonResult & { output?: string } {
  const result = parseJson(input)
  if (!result.ok) return result
  return { ...result, output: JSON.stringify(result.data) }
}

/** Sort object keys recursively. Arrays keep their order. */
export function sortKeys(input: string): JsonResult & { output?: string } {
  const result = parseJson(input)
  if (!result.ok) return result

  const sortValue = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(sortValue)
    if (value !== null && typeof value === 'object') {
      const sorted: Record<string, unknown> = {}
      for (const key of Object.keys(value as Record<string, unknown>).sort()) {
        sorted[key] = sortValue((value as Record<string, unknown>)[key])
      }
      return sorted
    }
    return value
  }

  return { ...result, output: JSON.stringify(sortValue(result.data), null, 2) }
}

/** Count leaf nodes (strings, numbers, booleans, nulls) in the parsed tree. */
export function countNodes(data: unknown): number {
  if (data === null || typeof data !== 'object') return 1
  if (Array.isArray(data)) return data.reduce<number>((sum, item) => sum + countNodes(item), 0)
  return Object.values(data as Record<string, unknown>).reduce<number>(
    (sum, v) => sum + countNodes(v),
    0,
  )
}

/** Max nesting depth of the parsed tree. */
export function maxDepth(data: unknown, current = 0): number {
  if (data === null || typeof data !== 'object') return current
  if (Array.isArray(data)) {
    if (data.length === 0) return current + 1
    return Math.max(...data.map((item) => maxDepth(item, current + 1)))
  }
  const values = Object.values(data as Record<string, unknown>)
  if (values.length === 0) return current + 1
  return Math.max(...values.map((v) => maxDepth(v, current + 1)))
}
