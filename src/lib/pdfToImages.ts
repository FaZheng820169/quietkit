import { getPdfjs } from './pdfjs'
import { EncryptedPdfError } from './pdfErrors'

export type JpgOptions = {
  /** Target resolution. 72 DPI is the PDF's native point size. */
  dpi: number
  /** JPEG quality, 0–1. */
  quality: number
  /** 1-based page numbers, in the order they should be exported. */
  pages: number[]
}

export type JpgImage = {
  page: number
  blob: Blob
  width: number
  height: number
}

export type JpgResult = {
  images: JpgImage[]
  total: number
}

/** A tab cannot allocate canvases past this without stalling or crashing. */
const MAX_PIXELS = 40_000_000
const MAX_SIDE = 8192

/**
 * Renders PDF pages to JPEGs locally. Unlike the PDF tools, this one is
 * intentionally lossy: JPEG has no vector content, so each page becomes one
 * flat image. That is the point of the tool — and it is stated in the UI.
 */
export async function renderPdfToJpgs(
  file: File,
  options: JpgOptions,
  onProgress?: (done: number, total: number) => void,
): Promise<JpgResult> {
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
    const images: JpgImage[] = []

    for (const pageNumber of options.pages) {
      if (pageNumber < 1 || pageNumber > doc.numPages) {
        throw new Error(`This PDF has ${doc.numPages} pages.`)
      }
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

      // JPEG has no alpha channel: without this, transparent areas turn black.
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, canvas.width, canvas.height)
      await page.render({ canvas, viewport }).promise

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) =>
            result ? resolve(result) : reject(new Error('The browser refused to encode this page.')),
          'image/jpeg',
          options.quality,
        )
      })

      images.push({ page: pageNumber, blob, width: canvas.width, height: canvas.height })
      // Release the bitmap before the next page rather than at the end.
      canvas.width = 0
      canvas.height = 0
      page.cleanup()
      onProgress?.(images.length, options.pages.length)
    }

    return { images, total: doc.numPages }
  } finally {
    await task.destroy()
  }
}
