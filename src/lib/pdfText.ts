import { getPdfjs } from './pdfjs'

type RawItem = {
  str?: string
  transform?: number[]
  width?: number
}

export type PdfTextDoc = {
  fileName: string
  pageCount: number
  page: (pageNumber: number) => Promise<string>
  all: (onProgress?: (done: number, total: number) => void) => Promise<string>
  destroy: () => Promise<void>
}

/** Rebuilds readable lines from pdf.js text fragments, which arrive in content order. */
function assemble(items: unknown[]): string {
  type Piece = { x: number; width: number; str: string }
  const lines: { y: number; pieces: Piece[] }[] = []

  for (const raw of items) {
    const item = raw as RawItem
    if (!item.str || !item.transform) continue
    const x = item.transform[4]
    const y = item.transform[5]
    const width = item.width ?? 0
    let line = lines.find((candidate) => Math.abs(candidate.y - y) <= 2)
    if (!line) {
      line = { y, pieces: [] }
      lines.push(line)
    }
    line.pieces.push({ x, width, str: item.str })
  }

  lines.sort((a, b) => b.y - a.y)

  return lines
    .map((line) => {
      line.pieces.sort((a, b) => a.x - b.x)
      let text = ''
      let previousEnd: number | null = null
      for (const piece of line.pieces) {
        if (previousEnd !== null && piece.x - previousEnd > 1) {
          const needsSpace = !text.endsWith(' ') && !piece.str.startsWith(' ')
          if (needsSpace) text += ' '
        }
        text += piece.str
        previousEnd = piece.x + piece.width
      }
      return text.trimEnd()
    })
    .filter((line) => line.length > 0)
    .join('\n')
}

/**
 * Opens a PDF for text extraction. pdf.js is fetched on first use, so the
 * main bundle stays small for visitors who never open this tool.
 */
export async function openPdfText(file: File): Promise<PdfTextDoc> {
  const pdfjs = await getPdfjs()

  const bytes = new Uint8Array(await file.arrayBuffer())
  const task = pdfjs.getDocument({ data: bytes })
  const doc = await task.promise
  const cache = new Map<number, string>()

  const page = async (pageNumber: number) => {
    const cached = cache.get(pageNumber)
    if (cached !== undefined) return cached
    const loaded = await doc.getPage(pageNumber)
    const content = await loaded.getTextContent()
    const text = assemble(content.items)
    cache.set(pageNumber, text)
    return text
  }

  return {
    fileName: file.name,
    pageCount: doc.numPages,
    page,
    all: async (onProgress) => {
      const parts: string[] = []
      for (let index = 1; index <= doc.numPages; index += 1) {
        onProgress?.(index, doc.numPages)
        parts.push(`[Page ${index}]\n${await page(index)}`)
      }
      return parts.join('\n\n')
    },
    destroy: async () => {
      await task.destroy()
    },
  }
}
