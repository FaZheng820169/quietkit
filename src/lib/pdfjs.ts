/**
 * pdf.js and its worker are pulled in on first use, so the main bundle stays
 * small for visitors who never open a tool that reads pages.
 */
export async function getPdfjs() {
  const pdfjs = await import('pdfjs-dist')
  const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')

  pdfjs.GlobalWorkerOptions.workerSrc = worker.default
  return pdfjs
}

export type PdfInfo = {
  pageCount: number
  /** Size of page 1 in PDF points (72 per inch). */
  pageWidth: number
  pageHeight: number
  destroy: () => Promise<void>
}

/** Reads the page count and page-1 size without rendering anything. */
export async function openPdfInfo(file: File): Promise<PdfInfo> {
  const pdfjs = await getPdfjs()
  const bytes = new Uint8Array(await file.arrayBuffer())
  const task = pdfjs.getDocument({ data: bytes })
  const doc = await task.promise

  try {
    const page = await doc.getPage(1)
    const box = page.getViewport({ scale: 1 })
    page.cleanup()
    return {
      pageCount: doc.numPages,
      pageWidth: box.width,
      pageHeight: box.height,
      destroy: async () => {
        await task.destroy()
      },
    }
  } catch (caught) {
    await task.destroy()
    throw caught
  }
}

export type PdfPreview = {
  pageCount: number
  render: (
    pageNumber: number,
    canvas: HTMLCanvasElement,
    cssWidth: number,
    maxHeight?: number,
  ) => Promise<{ width: number; height: number; pageWidth: number; pageHeight: number }>
  destroy: () => Promise<void>
}

/** Opens a PDF locally and renders single pages to a canvas for preview. */
export async function openPdfPreview(file: File): Promise<PdfPreview> {
  const pdfjs = await getPdfjs()
  const bytes = new Uint8Array(await file.arrayBuffer())
  const task = pdfjs.getDocument({ data: bytes })
  const doc = await task.promise

  const draw = async (
    pageNumber: number,
    canvas: HTMLCanvasElement,
    cssWidth: number,
    maxHeight?: number,
  ) => {
    const page = await doc.getPage(pageNumber)
    const unscaled = page.getViewport({ scale: 1 })
    const scale = Math.min(
      cssWidth / unscaled.width,
      maxHeight ? maxHeight / unscaled.height : Number.POSITIVE_INFINITY,
    )
    const viewport = page.getViewport({ scale })
    const ratio = Math.min(window.devicePixelRatio || 1, 2)

    canvas.width = Math.round(viewport.width * ratio)
    canvas.height = Math.round(viewport.height * ratio)
    canvas.style.width = `${viewport.width}px`

    await page.render({
      canvas,
      viewport,
      transform: ratio === 1 ? undefined : [ratio, 0, 0, ratio, 0, 0],
    }).promise

    return {
      width: viewport.width,
      height: viewport.height,
      pageWidth: unscaled.width,
      pageHeight: unscaled.height,
    }
  }

  // Renders are queued: React may ask twice for the same canvas while a
  // previous pass is still in flight, and pdf.js dislikes two at once.
  let queue: Promise<unknown> = Promise.resolve()
  const render: PdfPreview['render'] = (pageNumber, canvas, cssWidth, maxHeight) => {
    const next = queue.then(() => draw(pageNumber, canvas, cssWidth, maxHeight))
    queue = next.catch(() => undefined)
    return next
  }

  return {
    pageCount: doc.numPages,
    render,
    destroy: async () => {
      await task.destroy()
    },
  }
}
