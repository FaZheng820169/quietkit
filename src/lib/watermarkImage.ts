export type WatermarkOptions = {
  text: string
  opacity: number // 0.05 – 0.5
  angle: number // degrees
  fontSize: number // px, relative to image width
  color: string
  tiled: boolean
}

export const defaultWatermark: WatermarkOptions = {
  text: 'CONFIDENTIAL',
  opacity: 0.18,
  angle: -30,
  fontSize: 0.06, // 6% of image width
  color: '#000000',
  tiled: true,
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
      reject(new Error('Could not read that image.'))
    }
    img.src = url
  })
}

function drawWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  opts: WatermarkOptions,
) {
  const fontSize = Math.max(12, Math.round(width * opts.fontSize))
  ctx.save()
  ctx.globalAlpha = opts.opacity
  ctx.fillStyle = opts.color
  ctx.font = `600 ${fontSize}px system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  if (opts.tiled) {
    // Diagonal repeating grid.
    const rad = (opts.angle * Math.PI) / 180
    const stepX = fontSize * opts.text.length * 0.9
    const stepY = fontSize * 4
    ctx.translate(width / 2, height / 2)
    ctx.rotate(rad)
    const diag = Math.ceil(Math.hypot(width, height) / Math.min(stepX, stepY)) + 2
    for (let i = -diag; i <= diag; i++) {
      for (let j = -diag; j <= diag; j++) {
        ctx.fillText(opts.text, i * stepX, j * stepY)
      }
    }
  } else {
    // Single centered watermark.
    ctx.translate(width / 2, height / 2)
    ctx.rotate((opts.angle * Math.PI) / 180)
    ctx.fillText(opts.text, 0, 0)
  }
  ctx.restore()
}

export async function watermarkImage(file: File, opts: WatermarkOptions): Promise<Blob> {
  const img = await loadImage(file)
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D is not available.')
  ctx.drawImage(img, 0, 0)
  drawWatermark(ctx, canvas.width, canvas.height, opts)

  const mime = file.type === 'image/png' || file.type === 'image/webp' ? file.type : 'image/jpeg'
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Encode failed'))), mime, 0.92)
  })
}

export async function watermarkBatch(
  files: File[],
  opts: WatermarkOptions,
): Promise<{ name: string; blob: Blob }[]> {
  const out: { name: string; blob: Blob }[] = []
  for (const file of files) {
    const blob = await watermarkImage(file, opts)
    const base = file.name.replace(/\.[^.]+$/, '')
    const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg'
    out.push({ name: `${base}-watermarked.${ext}`, blob })
  }
  return out
}

export function previewDataUrl(img: HTMLImageElement, opts: WatermarkOptions): string {
  const canvas = document.createElement('canvas')
  const max = 480
  const scale = Math.min(1, max / img.naturalWidth)
  canvas.width = Math.round(img.naturalWidth * scale)
  canvas.height = Math.round(img.naturalHeight * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  drawWatermark(ctx, canvas.width, canvas.height, opts)
  return canvas.toDataURL('image/png')
}

export { loadImage }
