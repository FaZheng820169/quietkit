import { QrCode, QrCodeEcc } from './qrcodegen'

export type EccLevel = 'L' | 'M' | 'Q' | 'H'

export const ECC_LEVELS: { value: EccLevel; label: string; hint: string }[] = [
  { value: 'L', label: 'Low · 7%', hint: 'screen-only links, where damage is unlikely' },
  { value: 'M', label: 'Medium · 15%', hint: 'the everyday default' },
  { value: 'Q', label: 'Quartile · 25%', hint: 'posters and packaging that may scuff' },
  { value: 'H', label: 'High · 30%', hint: 'harsh environments or a logo overlay' },
]

const ECLS: Record<EccLevel, QrCodeEcc> = {
  L: QrCodeEcc.LOW,
  M: QrCodeEcc.MEDIUM,
  Q: QrCodeEcc.QUARTILE,
  H: QrCodeEcc.HIGH,
}

/** Encodes text as a QR Code symbol. Throws RangeError('Data too long') past capacity. */
export function encodeQr(text: string, level: EccLevel): QrCode {
  return QrCode.encodeText(text, ECLS[level])
}

/** Serialises the symbol as a crisp-edged SVG with a light quiet zone. */
export function qrToSvg(qr: QrCode, border: number, dark: string, light: string): string {
  const size = qr.size + border * 2
  let path = ''
  for (let y = 0; y < qr.size; y++) {
    for (let x = 0; x < qr.size; x++) {
      if (qr.getModule(x, y)) path += `M${x + border} ${y + border}h1v1h-1z`
    }
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">` +
    `<rect width="100%" height="100%" fill="${light}"/>` +
    `<path d="${path}" fill="${dark}"/></svg>`
  )
}

/** Renders the symbol to a PNG at an exact integer module scale, so edges stay sharp. */
export function qrToPngBlob(
  qr: QrCode,
  minPixels: number,
  border: number,
  dark: string,
  light: string,
): Promise<Blob> {
  const full = qr.size + border * 2
  const scale = Math.max(1, Math.ceil(minPixels / full))
  const pixels = full * scale
  const canvas = document.createElement('canvas')
  canvas.width = pixels
  canvas.height = pixels
  const ctx = canvas.getContext('2d')
  if (!ctx) return Promise.reject(new Error('Canvas is not available in this browser.'))
  ctx.fillStyle = light
  ctx.fillRect(0, 0, pixels, pixels)
  ctx.fillStyle = dark
  for (let y = 0; y < qr.size; y++) {
    for (let x = 0; x < qr.size; x++) {
      if (qr.getModule(x, y)) {
        ctx.fillRect((x + border) * scale, (y + border) * scale, scale, scale)
      }
    }
  }
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not encode the PNG.'))),
      'image/png',
    ),
  )
}
