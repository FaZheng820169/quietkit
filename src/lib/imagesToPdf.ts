import { PDFDocument } from 'pdf-lib'
import { toDecodableImage } from './heic'

export type PageSize = 'a4' | 'letter' | 'fit'

export type ImagesToPdfOptions = {
  pageSize: PageSize
  /** Margin in PDF points; ignored when the page is fitted to the image. */
  marginPt: number
  /** Longest side of the embedded image, in pixels. Keeps a 40-photo PDF usable. */
  maxPixels: number
}

export type ImagesToPdfResult = {
  blob: Blob
  pages: number
}

const PAGE_SIZES: Record<'a4' | 'letter', [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
}

type Encoded = { bytes: Uint8Array; width: number; height: number; type: 'jpg' | 'png' }

/**
 * Decodes any supported image through a canvas, so EXIF orientation is applied
 * and GPS/EXIF never reaches the PDF. Screenshots stay PNG to avoid JPEG ringing
 * on text; everything else becomes JPEG at 92%.
 */
async function encode(file: File, maxPixels: number): Promise<Encoded> {
  const source = await toDecodableImage(file)
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(source, { imageOrientation: 'from-image' })
  } catch {
    bitmap = await createImageBitmap(source)
  }

  const scale = Math.min(1, maxPixels / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not available in this browser.')
  ctx.imageSmoothingQuality = 'high'
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const keepPng = source.type === 'image/png'
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, keepPng ? 'image/png' : 'image/jpeg', keepPng ? undefined : 0.92)
  })
  if (!blob) throw new Error('This browser could not encode the image.')
  return {
    bytes: new Uint8Array(await blob.arrayBuffer()),
    width,
    height,
    type: keepPng ? 'png' : 'jpg',
  }
}

export async function imagesToPdf(
  files: File[],
  options: ImagesToPdfOptions,
): Promise<ImagesToPdfResult> {
  if (!files.length) throw new Error('Add at least one image.')

  const doc = await PDFDocument.create()
  doc.setProducer('QuietKit')
  doc.setCreator('QuietKit — local JPG to PDF')

  for (const file of files) {
    const encoded = await encode(file, options.maxPixels)
    const image = encoded.type === 'png' ? await doc.embedPng(encoded.bytes) : await doc.embedJpg(encoded.bytes)

    if (options.pageSize === 'fit') {
      // 96 CSS pixels per inch, 72 PDF points per inch.
      const width = (encoded.width * 72) / 96
      const height = (encoded.height * 72) / 96
      const page = doc.addPage([width, height])
      page.drawImage(image, { x: 0, y: 0, width, height })
      continue
    }

    const [short, long] = PAGE_SIZES[options.pageSize]
    const landscape = encoded.width > encoded.height
    const pageWidth = landscape ? long : short
    const pageHeight = landscape ? short : long
    const page = doc.addPage([pageWidth, pageHeight])

    const margin = Math.min(options.marginPt, Math.min(pageWidth, pageHeight) / 4)
    const available = { width: pageWidth - margin * 2, height: pageHeight - margin * 2 }
    const scale = Math.min(available.width / encoded.width, available.height / encoded.height)
    const width = encoded.width * scale
    const height = encoded.height * scale
    page.drawImage(image, {
      x: (pageWidth - width) / 2,
      y: (pageHeight - height) / 2,
      width,
      height,
    })
  }

  const saved = await doc.save()
  return {
    blob: new Blob([new Uint8Array(saved)], { type: 'application/pdf' }),
    pages: files.length,
  }
}
