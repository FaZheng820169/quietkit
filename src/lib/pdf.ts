import { PDFDocument } from 'pdf-lib'

export type PdfPart = {
  file: File
  pages: number
}

export async function countPdfPages(file: File): Promise<number> {
  const bytes = await file.arrayBuffer()
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
  return doc.getPageCount()
}

export async function mergePdfs(files: File[]): Promise<{ blob: Blob; pages: number }> {
  const out = await PDFDocument.create()
  let pages = 0

  for (const file of files) {
    const bytes = await file.arrayBuffer()
    const src = await PDFDocument.load(bytes, { ignoreEncryption: true })
    const copied = await out.copyPages(src, src.getPageIndices())
    copied.forEach((page) => out.addPage(page))
    pages += copied.length
  }

  out.setTitle('Merged with QuietKit')
  out.setProducer('QuietKit')
  out.setCreator('QuietKit')
  out.setCreationDate(new Date())

  const bytes = await out.save()
  const buffer = new Uint8Array(bytes)
  return { blob: new Blob([buffer], { type: 'application/pdf' }), pages }
}

/**
 * Parses a human page range like "1-3, 7, 10-" into zero-based indices.
 * Ranges are 1-based because that is what PDF viewers show.
 */
export function parsePageRanges(input: string, pageCount: number): number[] {
  const trimmed = input.trim()
  if (!trimmed) throw new Error('Enter at least one page or range.')

  const indices = new Set<number>()

  for (const raw of trimmed.split(',')) {
    const token = raw.trim()
    if (!token) continue
    const match = token.match(/^(\d+)?\s*(?:-\s*(\d+)?)?$/)
    if (!match) throw new Error(`"${token}" is not a page or range.`)
    if (!match[1] && !match[2]) throw new Error('Use numbers, for example 1-3, 7.')

    const start = match[1] ? Number(match[1]) : 1
    const end = match[2] ? Number(match[2]) : match[1] ? start : pageCount

    if (start < 1 || end < 1) throw new Error('Page numbers start at 1.')
    if (start > pageCount || end > pageCount) {
      throw new Error(`This PDF has ${pageCount} page${pageCount === 1 ? '' : 's'}.`)
    }
    if (start > end) throw new Error(`"${token}" is backwards.`)

    for (let page = start; page <= end; page += 1) indices.add(page - 1)
  }

  if (indices.size === 0) throw new Error('Enter at least one page or range.')
  return [...indices].sort((a, b) => a - b)
}

export type PageEditResult = {
  blob: Blob
  pages: number
  changed: number
}

/** Removes or isolates a page selection, keeping the original pages untouched. */
export async function editPdfPages(
  file: File,
  input: string,
  mode: 'remove' | 'keep',
): Promise<PageEditResult> {
  const bytes = await file.arrayBuffer()
  const src = await PDFDocument.load(bytes, { ignoreEncryption: true })
  const total = src.getPageCount()
  const selected = parsePageRanges(input, total)

  const keep =
    mode === 'remove'
      ? src.getPageIndices().filter((index) => !selected.includes(index))
      : selected

  if (keep.length === 0) {
    throw new Error('That would leave no pages. Adjust the ranges.')
  }

  const out = await PDFDocument.create()
  const copied = await out.copyPages(src, keep)
  copied.forEach((page) => out.addPage(page))

  out.setTitle('Edited with QuietKit')
  out.setProducer('QuietKit')
  out.setCreator('QuietKit')
  out.setCreationDate(new Date())

  const saved = await out.save()
  return {
    blob: new Blob([new Uint8Array(saved)], { type: 'application/pdf' }),
    pages: keep.length,
    changed: total - keep.length,
  }
}
