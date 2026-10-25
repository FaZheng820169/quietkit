export type CompressFormat = 'original' | 'image/jpeg' | 'image/webp' | 'image/png'

export type CompressOptions = {
  maxDimension: number | null
  quality: number
  format: CompressFormat
}

export type CompressResult = {
  blob: Blob
  width: number
  height: number
  type: string
}

function targetType(file: File, format: CompressFormat): string {
  if (format !== 'original') return format
  if (file.type === 'image/png' || file.type === 'image/webp' || file.type === 'image/jpeg') {
    return file.type
  }
  return 'image/jpeg'
}

export async function compressImage(file: File, options: CompressOptions): Promise<CompressResult> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    bitmap = await createImageBitmap(file)
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
  if (type !== 'image/png') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
  }
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, type, type === 'image/png' ? undefined : options.quality)
  })
  if (!blob) throw new Error('This browser could not encode the image.')

  return { blob, width, height, type }
}

export function outputExtension(type: string): string {
  if (type === 'image/png') return 'png'
  if (type === 'image/webp') return 'webp'
  return 'jpg'
}
