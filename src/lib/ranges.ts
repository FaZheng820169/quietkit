const TOKEN = /^(\d+)?\s*(?:-\s*(\d+)?)?$/

export type PageSegment = { start: number; end: number }

/** Expands "1-3, 7, 10-" into 1-based segments; `10-` means "to the last page". */
export function parsePageSegments(input: string, pageCount: number): PageSegment[] {
  const trimmed = input.trim()
  if (!trimmed) throw new Error('Enter at least one page or range.')

  const parsed: PageSegment[] = []
  for (const raw of trimmed.split(',')) {
    const token = raw.trim()
    if (!token) continue
    const match = token.match(TOKEN)
    if (!match) throw new Error(`"${token}" is not a page or range.`)
    if (!match[1] && !match[2]) throw new Error('Use numbers, for example 1-3, 7.')

    const start = match[1] ? Number(match[1]) : 1
    const end = match[2] ? Number(match[2]) : match[1] ? start : pageCount

    if (start < 1 || end < 1) throw new Error('Page numbers start at 1.')
    if (start > pageCount || end > pageCount) {
      throw new Error(`This PDF has ${pageCount} page${pageCount === 1 ? '' : 's'}.`)
    }
    if (start > end) throw new Error(`"${token}" is backwards.`)
    parsed.push({ start, end })
  }

  if (!parsed.length) throw new Error('Enter at least one page or range.')
  return parsed
}

/**
 * Parses a human page range like "1-3, 7, 10-" into zero-based indices.
 * Ranges are 1-based because that is what PDF viewers show.
 */
export function parsePageRanges(input: string, pageCount: number): number[] {
  const indices = new Set<number>()
  for (const { start, end } of parsePageSegments(input, pageCount)) {
    for (let page = start; page <= end; page += 1) indices.add(page - 1)
  }
  return [...indices].sort((a, b) => a - b)
}

/**
 * Parses a new page order such as "3, 1-2, 5" where position matters.
 * Every page must appear exactly once, otherwise the result is ambiguous.
 */
export function parsePageOrder(input: string, pageCount: number): number[] {
  const order: number[] = []
  const seen = new Set<number>()

  for (const { start, end } of parsePageSegments(input, pageCount)) {
    for (let page = start; page <= end; page += 1) {
      if (seen.has(page - 1)) throw new Error(`Page ${page} appears twice in the order.`)
      seen.add(page - 1)
      order.push(page - 1)
    }
  }

  if (order.length !== pageCount) {
    const missing = pageCount - order.length
    throw new Error(`The order must include all ${pageCount} pages; ${missing} still missing.`)
  }
  return order
}
