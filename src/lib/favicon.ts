const PNG_SIZES = [16, 32, 180, 192, 512] as const
const ICO_SIZES = [16, 32, 48] as const

export type FaviconFile = {
  name: string
  blob: Blob
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read that image. Try a PNG, JPG, WebP or SVG file.'))
    }
    img.src = url
  })
}

function drawToCanvas(img: HTMLImageElement, size: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D is not available in this browser.')

  const srcW = img.naturalWidth || img.width
  const srcH = img.naturalHeight || img.height
  const scale = Math.max(size / srcW, size / srcH)
  const w = srcW * scale
  const h = srcH * scale
  const x = (size - w) / 2
  const y = (size - h) / 2

  ctx.clearRect(0, 0, size, size)
  ctx.drawImage(img, x, y, w, h)
  return canvas
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Could not encode the image as PNG.'))
    }, 'image/png')
  })
}

async function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return blob.arrayBuffer()
}

/**
 * Build a multi-resolution .ico file from PNG blobs.
 * Modern Windows and every browser accept PNG-compressed icon entries.
 */
export async function pngsToIco(pngs: Array<{ size: number; blob: Blob }>): Promise<Blob> {
  const headerSize = 6
  const entrySize = 16
  const imageBuffers = await Promise.all(pngs.map((p) => blobToArrayBuffer(p.blob)))
  const totalSize =
    headerSize + entrySize * pngs.length + imageBuffers.reduce((sum, b) => sum + b.byteLength, 0)

  const out = new ArrayBuffer(totalSize)
  const view = new DataView(out)
  const bytes = new Uint8Array(out)

  view.setUint16(0, 0, true) // reserved
  view.setUint16(2, 1, true) // type = icon
  view.setUint16(4, pngs.length, true) // count

  let offset = headerSize + entrySize * pngs.length
  pngs.forEach((p, i) => {
    const base = headerSize + entrySize * i
    const sizeByte = p.size >= 256 ? 0 : p.size
    view.setUint8(base + 0, sizeByte) // width
    view.setUint8(base + 1, sizeByte) // height
    view.setUint8(base + 2, 0) // palette colors
    view.setUint8(base + 3, 0) // reserved
    view.setUint16(base + 4, 1, true) // planes
    view.setUint16(base + 6, 32, true) // bits per pixel
    view.setUint32(base + 8, imageBuffers[i].byteLength, true) // data size
    view.setUint32(base + 12, offset, true) // data offset
    bytes.set(new Uint8Array(imageBuffers[i]), offset)
    offset += imageBuffers[i].byteLength
  })

  return new Blob([out], { type: 'image/x-icon' })
}

function buildManifest(): string {
  return JSON.stringify(
    {
      name: '',
      short_name: '',
      icons: [
        { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
      theme_color: '#ffffff',
      background_color: '#ffffff',
      display: 'standalone',
    },
    null,
    2,
  )
}

/**
 * Turn one source image into a complete favicon set, zipped.
 */
export async function generateFaviconPackage(file: File): Promise<{
  files: FaviconFile[]
  zipBlob: Blob
}> {
  const img = await loadImage(file)
  const files: FaviconFile[] = []

  const pngEntries: Array<{ size: number; blob: Blob }> = []
  for (const size of PNG_SIZES) {
    const canvas = drawToCanvas(img, size)
    const blob = await canvasToPngBlob(canvas)
    pngEntries.push({ size, blob })
  }

  const icoEntries: Array<{ size: number; blob: Blob }> = []
  for (const size of ICO_SIZES) {
    const canvas = drawToCanvas(img, size)
    const blob = await canvasToPngBlob(canvas)
    icoEntries.push({ size, blob })
  }
  const icoBlob = await pngsToIco(icoEntries)

  const manifest = buildManifest()

  files.push(
    { name: 'favicon.ico', blob: icoBlob },
    { name: 'favicon-16x16.png', blob: pngEntries[0].blob },
    { name: 'favicon-32x32.png', blob: pngEntries[1].blob },
    { name: 'apple-touch-icon.png', blob: pngEntries[2].blob },
    { name: 'android-chrome-192x192.png', blob: pngEntries[3].blob },
    { name: 'android-chrome-512x512.png', blob: pngEntries[4].blob },
    { name: 'site.webmanifest', blob: new Blob([manifest], { type: 'application/manifest+json' }) },
  )

  const zip = new (await import('jszip')).default()
  files.forEach((f) => zip.file(f.name, f.blob))
  const zipBlob = await zip.generateAsync({ type: 'blob' })

  return { files, zipBlob }
}

export function previewDataUrls(img: HTMLImageElement, sizes: readonly number[]): string[] {
  return sizes.map((size) => drawToCanvas(img, size).toDataURL('image/png'))
}

export async function loadPreviewImage(file: File): Promise<HTMLImageElement> {
  return loadImage(file)
}
