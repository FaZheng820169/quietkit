import { toDecodableImage } from './heic'

export type CompressFormat = 'original' | 'image/jpeg' | 'image/webp' | 'image/png' | 'image/avif'

export type CompressOptions = {
  maxDimension: number | null
  quality: number
  format: CompressFormat
  /** Optional ceiling in bytes. The encoder searches for the highest quality that fits. */
  targetBytes?: number | null
}

export type CompressResult = {
  blob: Blob
  width: number
  height: number
  type: string
  /** Quality actually used; may be lower than requested when a size target was set. */
  quality: number
  /** False when a size target was requested but the smallest usable encoding still exceeds it. */
  metTarget: boolean
}

function targetType(file: File, format: CompressFormat): string {
  if (format !== 'original') return format
  if (file.type === 'image/png' || file.type === 'image/webp' || file.type === 'image/jpeg') {
    return file.type
  }
  return 'image/jpeg'
}

export async function compressImage(file: File, options: CompressOptions): Promise<CompressResult> {
  const source = await toDecodableImage(file)
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(source, { imageOrientation: 'from-image' })
  } catch {
    bitmap = await createImageBitmap(source)
  }

  const limit = options.maxDimension
  const scale = limit && Math.max(bitmap.width, bitmap.height) > limit
    ? limit / Math.max(bitmap.width, bitmap.height)
    : 1
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const type = targetType(file, options.format)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not available in this browser.')

  ctx.imageSmoothingQuality = 'high'
  // JPEG and WebP get a white base because the encoder or the target workflow
  // assumes no alpha; PNG and AVIF keep the transparent pixels they carry.
  if (type === 'image/jpeg' || type === 'image/webp') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
  }
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const encode = (level: number) =>
    new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, type, type === 'image/png' ? undefined : level)
    })

  let quality = options.quality
  let blob = await encode(quality)

  if (options.targetBytes && type !== 'image/png' && blob && blob.size > options.targetBytes) {
    // Largest quality that still fits, found with a short binary search rather
    // than a linear sweep: enough precision for a size ceiling, cheap on CPU.
    let low = 0.3
    let high = quality
    let best: { blob: Blob; level: number } | null = null
    for (let step = 0; step < 6; step += 1) {
      const mid = (low + high) / 2
      const candidate = await encode(mid)
      if (!candidate) break
      if (candidate.size <= options.targetBytes) {
        best = { blob: candidate, level: mid }
        low = mid
      } else {
        high = mid
      }
    }
    if (best) {
      blob = best.blob
      quality = best.level
    } else {
      quality = low
      blob = await encode(quality)
    }
  }

  if (!blob) throw new Error('This browser could not encode the image.')

  return {
    blob,
    width,
    height,
    type,
    quality,
    metTarget: options.targetBytes ? blob.size <= options.targetBytes : true,
  }
}

export function outputExtension(type: string): string {
  if (type === 'image/png') return 'png'
  if (type === 'image/webp') return 'webp'
  if (type === 'image/avif') return 'avif'
  return 'jpg'
}

export type ResizeOptions = {
  width: number
  height: number
  /** cover crops to fill the frame; contain pads to preserve the whole image. */
  fit: 'cover' | 'contain'
  format: 'image/jpeg' | 'image/png' | 'image/webp'
  quality?: number
}

export type ResizeResult = {
  blob: Blob
  width: number
  height: number
  type: string
}

/** Resizes to exact pixel dimensions, cropping or padding to reach the aspect ratio. */
export async function resizeImage(file: File, options: ResizeOptions): Promise<ResizeResult> {
  const source = await toDecodableImage(file)
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(source, { imageOrientation: 'from-image' })
  } catch {
    bitmap = await createImageBitmap(source)
  }

  const { width, height, fit, format } = options
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not available in this browser.')

  ctx.imageSmoothingQuality = 'high'
  if (format !== 'image/png') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
  }

  if (fit === 'cover') {
    // Largest centred rectangle of the source that shares the target aspect ratio.
    const scale = Math.max(width / bitmap.width, height / bitmap.height)
    const sourceWidth = width / scale
    const sourceHeight = height / scale
    const sourceX = (bitmap.width - sourceWidth) / 2
    const sourceY = (bitmap.height - sourceHeight) / 2
    ctx.drawImage(bitmap, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height)
  } else {
    const scale = Math.min(width / bitmap.width, height / bitmap.height)
    const drawWidth = bitmap.width * scale
    const drawHeight = bitmap.height * scale
    ctx.drawImage(bitmap, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight)
  }
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, format, format === 'image/png' ? undefined : (options.quality ?? 0.9))
  })
  if (!blob) throw new Error('This browser could not encode the image.')

  return { blob, width, height, type: format }
}
