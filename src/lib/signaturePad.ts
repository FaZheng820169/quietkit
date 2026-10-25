/**
 * Trims fully transparent margins off a signature canvas and returns a tight
 * PNG blob, so a small drawing on a large pad does not shrink when stamped.
 * Kept free of any PDF dependency so the pad UI loads without pdf-lib.
 */
export async function trimSignatureCanvas(canvas: HTMLCanvasElement): Promise<Blob | null> {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const { width, height } = canvas
  const pixels = ctx.getImageData(0, 0, width, height).data

  let top = height
  let left = width
  let right = -1
  let bottom = -1
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (pixels[(y * width + x) * 4 + 3] > 8) {
        if (y < top) top = y
        if (y > bottom) bottom = y
        if (x < left) left = x
        if (x > right) right = x
      }
    }
  }
  if (right < 0) return null

  const pad = 6
  top = Math.max(0, top - pad)
  left = Math.max(0, left - pad)
  right = Math.min(width - 1, right + pad)
  bottom = Math.min(height - 1, bottom + pad)

  const out = document.createElement('canvas')
  out.width = right - left + 1
  out.height = bottom - top + 1
  const outCtx = out.getContext('2d')
  if (!outCtx) return null
  outCtx.drawImage(canvas, left, top, out.width, out.height, 0, 0, out.width, out.height)

  return new Promise((resolve) => out.toBlob((blob) => resolve(blob), 'image/png'))
}
