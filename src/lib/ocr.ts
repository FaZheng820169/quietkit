/**
 * OCR via tesseract.js, fully self-hosted: the worker script, the WASM core
 * and the English traineddata all live in public/tess*, so recognising a
 * photo of text never touches a CDN or an upload endpoint. Everything in this
 * module is loaded with a dynamic import from the page, keeping the OCR
 * bundle out of the main chunk.
 */
import { createWorker, OEM, type Worker } from 'tesseract.js'

export type OcrProgress = { stage: string; ratio: number }

const base = import.meta.env.BASE_URL

let workerPromise: Promise<Worker> | null = null
let onProgress: ((p: OcrProgress) => void) | null = null

// One worker for the page's lifetime: spinning up the WASM core and unpacking
// the traineddata costs seconds, so the instance is reused across files.
function getWorker(): Promise<Worker> {
  if (!workerPromise) {
    workerPromise = createWorker('eng', OEM.LSTM_ONLY, {
      workerPath: `${base}tess/worker.min.js`,
      corePath: `${base}tess/tesseract-core-simd-lstm.wasm.js`,
      langPath: `${base}tessdata`,
      gzip: true,
      logger: (message: { status?: string; progress?: number }) => {
        if (!onProgress || typeof message.progress !== 'number') return
        const status = message.status ?? 'working'
        const ratio = status === 'recognizing text' ? message.progress : 0
        onProgress({ stage: status, ratio })
      },
    })
  }
  return workerPromise
}

export async function recognizeText(
  image: Blob,
  progress?: (p: OcrProgress) => void,
): Promise<string> {
  onProgress = progress ?? null
  try {
    const worker = await getWorker()
    const { data } = await worker.recognize(image)
    return data.text.trim()
  } finally {
    onProgress = null
  }
}

export function friendlyOcrError(caught: unknown): string {
  const message = caught instanceof Error ? caught.message : ''
  if (/decode|decod/i.test(message)) {
    return 'This image could not be decoded. Try a JPEG, PNG or WebP file.'
  }
  return 'Recognition failed for this image. Try a sharper, more upright copy.'
}
