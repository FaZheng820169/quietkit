import { PDFDocument, degrees } from 'pdf-lib'
import { parsePageRanges, parsePageOrder } from './ranges'

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

export type PageEditResult = {
  blob: Blob
  pages: number
  changed: number
}

export type RotateResult = {
  blob: Blob
  pages: number
  rotated: number
}

/**
 * Rotates pages by adding to their existing /Rotate value, so a page that was
 * already upside down ends up upright instead of being reset to zero.
 * Pass an empty range to rotate every page.
 */
export async function rotatePdfPages(
  file: File,
  input: string,
  angle: 90 | 180 | 270,
): Promise<RotateResult> {
  const bytes = await file.arrayBuffer()
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
  const total = doc.getPageCount()
  const targets = input.trim()
    ? parsePageRanges(input, total)
    : doc.getPageIndices()

  targets.forEach((index) => {
    const page = doc.getPage(index)
    const current = page.getRotation().angle
    page.setRotation(degrees(((current + angle) % 360 + 360) % 360))
  })

  const saved = await doc.save()
  return {
    blob: new Blob([new Uint8Array(saved)], { type: 'application/pdf' }),
    pages: total,
    rotated: targets.length,
  }
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

export type ReorderResult = {
  blob: Blob
  pages: number
  moved: number
}

/** Rebuilds the document with pages in a new order, keeping each page intact. */
export async function reorderPdfPages(file: File, input: string): Promise<ReorderResult> {
  const bytes = await file.arrayBuffer()
  const src = await PDFDocument.load(bytes, { ignoreEncryption: true })
  const total = src.getPageCount()
  const order = parsePageOrder(input, total)

  const out = await PDFDocument.create()
  const copied = await out.copyPages(src, order)
  copied.forEach((page) => out.addPage(page))

  out.setTitle('Reorder with QuietKit')
  out.setProducer('QuietKit')
  out.setCreator('QuietKit')
  out.setCreationDate(new Date())

  const saved = await out.save()
  return {
    blob: new Blob([new Uint8Array(saved)], { type: 'application/pdf' }),
    pages: total,
    moved: order.filter((pageIndex, position) => pageIndex !== position).length,
  }
}

