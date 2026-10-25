import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib'
import { parsePageRanges, parsePageOrder } from './ranges'
import {
  PAGE_NUMBER_EDGE,
  paperName,
  targetSize,
  type PageNumberOptions,
  type PageNumberResult,
  type PdfPageBox,
  type ResizeOptions,
  type ResizeResult,
} from './pdfLayout'
import { EncryptedPdfError } from './pdfErrors'

export { EncryptedPdfError, ENCRYPTED_PDF_HELP } from './pdfErrors'

function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360
}

export type PdfPart = {
  file: File
  pages: number
}

export async function countPdfPages(file: File): Promise<number> {
  const bytes = await file.arrayBuffer()
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
  if (doc.isEncrypted) throw new EncryptedPdfError(file.name)
  return doc.getPageCount()
}

export async function mergePdfs(files: File[]): Promise<{ blob: Blob; pages: number }> {
  const out = await PDFDocument.create()
  let pages = 0

  for (const file of files) {
    const bytes = await file.arrayBuffer()
    const src = await PDFDocument.load(bytes, { ignoreEncryption: true })
    if (src.isEncrypted) throw new EncryptedPdfError(file.name)
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
 * Draws page numbers on top of the existing page content. The text is placed
 * in the viewer's orientation, so a page with /Rotate 90 gets an upright
 * number in its bottom-right corner, not one lying on its side.
 */
export async function stampPageNumbers(
  file: File,
  options: PageNumberOptions,
): Promise<PageNumberResult> {
  const bytes = await file.arrayBuffer()
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
  if (doc.isEncrypted) throw new EncryptedPdfError(file.name)
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const total = doc.getPageCount()
  const size = options.fontSize

  const vertical = options.position.startsWith('top') ? 'top' : 'bottom'
  const horizontal = options.position.endsWith('left')
    ? 'left'
    : options.position.endsWith('right')
      ? 'right'
      : 'center'

  let numbered = 0

  for (let index = 0; index < total; index += 1) {
    if (options.skipFirst && index === 0) continue
    const page = doc.getPage(index)
    const label =
      options.format === 'plain'
        ? `${options.start + index}`
        : options.format === 'slash'
          ? `${options.start + index} / ${options.start - 1 + total}`
          : `Page ${options.start + index} of ${options.start - 1 + total}`

    const box = page.getCropBox()
    const rotation = ((page.getRotation().angle % 360) + 360) % 360
    const sideways = rotation === 90 || rotation === 270
    const visibleWidth = sideways ? box.height : box.width
    const visibleHeight = sideways ? box.width : box.height

    const textWidth = font.widthOfTextAtSize(label, size)
    const x =
      horizontal === 'left'
        ? PAGE_NUMBER_EDGE
        : horizontal === 'right'
          ? visibleWidth - PAGE_NUMBER_EDGE - textWidth
          : (visibleWidth - textWidth) / 2
    const y = vertical === 'bottom' ? PAGE_NUMBER_EDGE : visibleHeight - PAGE_NUMBER_EDGE - size * 0.72

    // Map the viewer-oriented position back into unrotated page space.
    let drawX = x
    let drawY = y
    if (rotation === 90) {
      drawX = box.width - y
      drawY = x
    } else if (rotation === 180) {
      drawX = box.width - x
      drawY = box.height - y
    } else if (rotation === 270) {
      drawX = y
      drawY = box.height - x
    }

    page.drawText(label, {
      x: box.x + drawX,
      y: box.y + drawY,
      size,
      font,
      color: rgb(0.13, 0.13, 0.13),
      rotate: degrees(rotation),
    })
    numbered += 1
  }

  doc.setProducer('QuietKit')
  doc.setCreator('QuietKit')
  doc.setModificationDate(new Date())

  const saved = await doc.save()
  return {
    blob: new Blob([new Uint8Array(saved)], { type: 'application/pdf' }),
    pages: total,
    numbered,
  }
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
  if (doc.isEncrypted) throw new EncryptedPdfError(file.name)
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
  if (src.isEncrypted) throw new EncryptedPdfError(file.name)
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
  if (src.isEncrypted) throw new EncryptedPdfError(file.name)
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

/** Visible page boxes, with the viewer rotation already taken into account. */
export async function readPdfPageBoxes(file: File): Promise<PdfPageBox[]> {
  const bytes = await file.arrayBuffer()
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false })
  if (doc.isEncrypted) throw new EncryptedPdfError(file.name)

  return doc.getPages().map((page) => {
    const box = page.getCropBox()
    const rotation = normalizeAngle(page.getRotation().angle)
    const sideways = rotation === 90 || rotation === 270
    const width = Math.round((sideways ? box.height : box.width) * 10) / 10
    const height = Math.round((sideways ? box.width : box.height) * 10) / 10
    return {
      paper: paperName(width, height),
      width,
      height,
      rotation,
      landscape: width > height,
    }
  })
}

const IDENTITY: [number, number, number, number, number, number] = [1, 0, 0, 1, 0, 0]

/**
 * Rebuilds every page on a fixed sheet. Each source page is embedded as a form
 * XObject, with the crop box origin moved to (0, 0) and the viewer rotation
 * baked into the form's matrix, so a page that was stored sideways comes out
 * upright on a sheet with no /Rotate flag.
 *
 * The trade-off is stated on the page itself: the printed page is rebuilt, so
 * links, form fields and comments are not carried over.
 */
export async function resizePdfPages(
  file: File,
  options: ResizeOptions,
): Promise<ResizeResult> {
  const bytes = await file.arrayBuffer()
  const src = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false })
  if (src.isEncrypted) throw new EncryptedPdfError()

  const out = await PDFDocument.create()
  let scaled = 0

  for (const page of src.getPages()) {
    const box = page.getCropBox()
    if (box.width <= 0 || box.height <= 0) continue

    const rotation = normalizeAngle(page.getRotation().angle)
    const sideways = rotation === 90 || rotation === 270
    const visibleWidth = sideways ? box.height : box.width
    const visibleHeight = sideways ? box.width : box.height
    const sheet = targetSize(options.paper, options.orientation, visibleWidth > visibleHeight)

    const scale =
      options.mode === 'fill'
        ? Math.max(sheet.width / visibleWidth, sheet.height / visibleHeight)
        : Math.min(sheet.width / visibleWidth, sheet.height / visibleHeight)

    const target = out.addPage([sheet.width, sheet.height])
    const offsetX = (sheet.width - visibleWidth * scale) / 2
    const offsetY = (sheet.height - visibleHeight * scale) / 2

    if (page.node.Contents() === undefined) {
      // A blank page stays blank — the sheet is still created at the right size.
      if (Math.abs(scale - 1) > 0.005) scaled += 1
      continue
    }

    // Rotation of the content into the viewer's orientation:
    //   90°: (u, v) = (y, w - x)   180°: (w - x, h - y)   270°: (h - y, x)
    // expressed as the [a b c d e f] matrix in PDF's cm operator, with the
    // crop box origin shifted to (0, 0) first.
    const base: [number, number, number, number, number, number] =
      rotation === 90
        ? [0, -1, 1, 0, 0, box.width]
        : rotation === 180
          ? [-1, 0, 0, -1, box.width, box.height]
          : rotation === 270
            ? [0, 1, -1, 0, box.height, 0]
            : IDENTITY
    const [a, b, c, d, e, f] = base
    const matrix: [number, number, number, number, number, number] = [
      a,
      b,
      c,
      d,
      e - a * box.x - c * box.y,
      f - b * box.x - d * box.y,
    ]

    const embedded = await out.embedPage(
      page,
      { left: box.x, bottom: box.y, right: box.x + box.width, top: box.y + box.height },
      matrix,
    )

    target.drawPage(embedded, {
      x: offsetX,
      y: offsetY,
      xScale: scale,
      yScale: scale,
    })
    if (Math.abs(scale - 1) > 0.005) scaled += 1
  }

  out.setTitle('Resized with QuietKit')
  out.setProducer('QuietKit')
  out.setCreator('QuietKit')
  out.setCreationDate(new Date())

  const saved = await out.save()
  return {
    blob: new Blob([new Uint8Array(saved)], { type: 'application/pdf' }),
    pages: out.getPageCount(),
    scaled,
  }
}

