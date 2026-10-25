import { PDFDocument } from 'pdf-lib'
import { getPdfjs } from './pdfjs'
import { EncryptedPdfError } from './pdfErrors'

export type CompressOptions = {
  /** Resolution the pages are redrawn at. 72 DPI is the PDF's native size. */
  dpi: number
  /** JPEG quality for the rebuilt pages, 0–1. */
  quality: number
}

export type CompressResult = {
  blob: Blob
  pages: number
  bytes: number
  originalBytes: number
}

/** Bounds for a single tab: past this, the work stops being reasonable. */
const MAX_PAGES = 80
const MAX_PIXELS = 16_000_000
const MAX_SIDE = 5000

/**
 * Rebuilds a PDF with each page drawn as a JPEG at a chosen resolution. This
 * is the only kind of compression a browser can do without a server: the
 * images already inside a PDF are in formats the page can read but not
 * rewrite, so the document is re-rendered instead. Text becomes pixels, which
 * the UI states plainly before the button is pressed.
 */
export async function compressPdf(
  file: File,
  options: CompressOptions,
  onProgress?: (done: number, total: number) => void,
): Promise<CompressResult> {
  const pdfjs = await getPdfjs()
  const data = new Uint8Array(await file.arrayBuffer())
  const task = pdfjs.getDocument({ data })

  let doc
  try {
    doc = await task.promise
  } catch (caught) {
    await task.destroy()
    if ((caught as { name?: string } | null)?.name === 'PasswordException') {
      throw new EncryptedPdfError(file.name)
    }
    throw caught
  }

  try {
    if (doc.numPages > MAX_PAGES) {
      throw new Error(
        `This PDF has ${doc.numPages} pages. One run compresses up to ${MAX_PAGES} — split it first if you need more.`,
      )
    }

    const out = await PDFDocument.create()

    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
      const page = await doc.getPage(pageNumber)
      const unscaled = page.getViewport({ scale: 1 })

      let scale = options.dpi / 72
      const pixels = unscaled.width * unscaled.height * scale * scale
      if (pixels > MAX_PIXELS) {
        scale = Math.sqrt(MAX_PIXELS / (unscaled.width * unscaled.height))
      }
      scale = Math.min(scale, MAX_SIDE / Math.max(unscaled.width, unscaled.height))

      const viewport = page.getViewport({ scale })
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(viewport.width)
      canvas.height = Math.round(viewport.height)
      const context = canvas.getContext('2d')
      if (!context) throw new Error('This browser cannot draw the page.')

      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, canvas.width, canvas.height)
      await page.render({ canvas, viewport }).promise

      const jpeg = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) =>
            result ? resolve(result) : reject(new Error('The browser refused to encode a page.')),
          'image/jpeg',
          options.quality,
        )
      })

      const image = await out.embedJpg(new Uint8Array(await jpeg.arrayBuffer()))
      // The rendered viewport already carries the page rotation, so the new
      // page is built at the size the reader actually saw.
      const sheet = out.addPage([unscaled.width, unscaled.height])
      sheet.drawImage(image, { x: 0, y: 0, width: unscaled.width, height: unscaled.height })

      canvas.width = 0
      canvas.height = 0
      page.cleanup()
      onProgress?.(pageNumber, doc.numPages)
    }

    // The original author, title and keywords are not carried over: a rebuilt
    // copy is a new file, and quietly copying hidden metadata is a privacy leak.
    out.setProducer('QuietKit')
    out.setCreator('QuietKit')

    const saved = await out.save()
    return {
      blob: new Blob([new Uint8Array(saved)], { type: 'application/pdf' }),
      pages: doc.numPages,
      bytes: saved.byteLength,
      originalBytes: file.size,
    }
  } finally {
    await task.destroy()
  }
}
