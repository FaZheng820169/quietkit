/**
 * Opens two PDFs side by side and compares them as images of the page.
 *
 * The comparison is deliberately visual: both pages are rendered at the same
 * pixel width and compared channel by channel, with a small tolerance so
 * anti-aliasing noise along glyph edges does not light up. Anything a reader
 * would notice — edited text, a moved block, a swapped image, a new stamp —
 * changes pixels; a re-saved but untouched page does not.
 */
import { getPdfjs } from './pdfjs'
import { EncryptedPdfError } from './pdfErrors'

export type CompareSideInfo = {
  name: string
  size: number
  pageCount: number
}

export type DiffResult = {
  width: number
  height: number
  changedPixels: number
  totalPixels: number
  identical: boolean
  canvas: HTMLCanvasElement
}

export type PdfCompareSession = {
  a: CompareSideInfo
  b: CompareSideInfo
  /** Page count of the longer document — navigation runs this far. */
  pages: number
  /**
   * Renders one page of one side to a canvas for the side-by-side view.
   * Returns false when that side simply has no such page.
   */
  renderPage: (
    side: 'a' | 'b',
    pageNumber: number,
    canvas: HTMLCanvasElement,
    cssWidth: number,
  ) => Promise<boolean>
  /** Pixel-diffs one page. Returns null when either side lacks the page. */
  diffPage: (pageNumber: number) => Promise<DiffResult | null>
  destroy: () => Promise<void>
}

/** Diff rasters are rendered at this pixel width regardless of paper size. */
const DIFF_WIDTH = 960
/** Sum of per-channel deltas above which a pixel counts as changed. */
const DIFF_THRESHOLD = 32

type Pdfjs = Awaited<ReturnType<typeof getPdfjs>>

async function openDocument(pdfjs: Pdfjs, file: File) {
  const data = new Uint8Array(await file.arrayBuffer())
  const task = pdfjs.getDocument({ data })
  try {
    const doc = await task.promise
    return { doc, task }
  } catch (caught) {
    await task.destroy()
    if ((caught as { name?: string } | null)?.name === 'PasswordException') {
      throw new EncryptedPdfError(file.name)
    }
    throw caught
  }
}

type Opened = Awaited<ReturnType<typeof openDocument>>
type Doc = Opened['doc']

export async function openPdfCompare(fileA: File, fileB: File): Promise<PdfCompareSession> {
  const pdfjs = await getPdfjs()
  const openedA = await openDocument(pdfjs, fileA)
  let openedB: Opened
  try {
    openedB = await openDocument(pdfjs, fileB)
  } catch (caught) {
    await openedA.task.destroy()
    throw caught
  }

  const docs: Record<'a' | 'b', Doc> = { a: openedA.doc, b: openedB.doc }

  // pdf.js dislikes two renders on one document at once, so each side gets a
  // queue; the two sides may still render in parallel.
  const queues: Record<'a' | 'b', Promise<unknown>> = {
    a: Promise.resolve(),
    b: Promise.resolve(),
  }
  const enqueue = <T,>(side: 'a' | 'b', work: () => Promise<T>): Promise<T> => {
    const next = queues[side].then(work)
    queues[side] = next.catch(() => undefined)
    return next
  }

  async function renderToCanvas(
    doc: Doc,
    pageNumber: number,
    canvas: HTMLCanvasElement,
    pixelWidth: number,
  ) {
    const page = await doc.getPage(pageNumber)
    const unscaled = page.getViewport({ scale: 1 })
    const viewport = page.getViewport({ scale: pixelWidth / unscaled.width })
    canvas.width = Math.max(1, Math.round(viewport.width))
    canvas.height = Math.max(1, Math.round(viewport.height))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('This browser cannot draw the page.')
    // Pages can be transparent; white matches what a reader sees in a viewer.
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    await page.render({ canvas, viewport }).promise
    page.cleanup()
    return { width: canvas.width, height: canvas.height }
  }

  const renderPage: PdfCompareSession['renderPage'] = (side, pageNumber, canvas, cssWidth) =>
    enqueue(side, async () => {
      const doc = docs[side]
      if (pageNumber < 1 || pageNumber > doc.numPages) return false
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      await renderToCanvas(doc, pageNumber, canvas, Math.round(cssWidth * ratio))
      canvas.style.width = `${cssWidth}px`
      return true
    })

  const renderOffscreen = (side: 'a' | 'b', pageNumber: number) =>
    enqueue(side, async () => {
      const canvas = document.createElement('canvas')
      const size = await renderToCanvas(docs[side], pageNumber, canvas, DIFF_WIDTH)
      return { canvas, ...size }
    })

  const diffPage: PdfCompareSession['diffPage'] = async (pageNumber) => {
    if (pageNumber < 1 || pageNumber > docs.a.numPages || pageNumber > docs.b.numPages) {
      return null
    }

    const [ra, rb] = await Promise.all([
      renderOffscreen('a', pageNumber),
      renderOffscreen('b', pageNumber),
    ])

    // A4 portrait and a rotated scan differ in height; the taller one wins and
    // the shorter rests on white, so a stretched page counts as changed.
    const width = Math.max(ra.width, rb.width)
    const height = Math.max(ra.height, rb.height)
    const flatten = (source: HTMLCanvasElement) => {
      const flat = document.createElement('canvas')
      flat.width = width
      flat.height = height
      const context = flat.getContext('2d')!
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, width, height)
      context.drawImage(source, 0, 0)
      return context.getImageData(0, 0, width, height)
    }
    const imageA = flatten(ra.canvas)
    const imageB = flatten(rb.canvas)

    const out = document.createElement('canvas')
    out.width = width
    out.height = height
    const outContext = out.getContext('2d')!
    const diff = outContext.createImageData(width, height)

    const dataA = imageA.data
    const dataB = imageB.data
    const dataOut = diff.data
    let changedPixels = 0
    for (let i = 0; i < dataA.length; i += 4) {
      const delta =
        Math.abs(dataA[i] - dataB[i]) +
        Math.abs(dataA[i + 1] - dataB[i + 1]) +
        Math.abs(dataA[i + 2] - dataB[i + 2])
      if (delta > DIFF_THRESHOLD) {
        dataOut[i] = 224
        dataOut[i + 1] = 36
        dataOut[i + 2] = 36
        dataOut[i + 3] = 255
        changedPixels += 1
      } else {
        // Unchanged pixels fade toward white so the changed ones carry the eye.
        dataOut[i] = dataA[i] + Math.round((255 - dataA[i]) * 0.75)
        dataOut[i + 1] = dataA[i + 1] + Math.round((255 - dataA[i + 1]) * 0.75)
        dataOut[i + 2] = dataA[i + 2] + Math.round((255 - dataA[i + 2]) * 0.75)
        dataOut[i + 3] = 255
      }
    }
    outContext.putImageData(diff, 0, 0)

    // Release the source bitmaps now, not when the next page is compared.
    ra.canvas.width = 0
    ra.canvas.height = 0
    rb.canvas.width = 0
    rb.canvas.height = 0

    return {
      width,
      height,
      changedPixels,
      totalPixels: width * height,
      identical: changedPixels === 0,
      canvas: out,
    }
  }

  return {
    a: { name: fileA.name, size: fileA.size, pageCount: docs.a.numPages },
    b: { name: fileB.name, size: fileB.size, pageCount: docs.b.numPages },
    pages: Math.max(docs.a.numPages, docs.b.numPages),
    renderPage,
    diffPage,
    destroy: async () => {
      await Promise.all([openedA.task.destroy(), openedB.task.destroy()])
    },
  }
}
