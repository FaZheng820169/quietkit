import { PDFDocument, degrees } from 'pdf-lib'
import { EncryptedPdfError } from './pdfErrors'

/**
 * One signature placement on one page. Positions are fractions of the page as
 * the viewer sees it (rotation applied): x is the horizontal centre from the
 * left edge, y is the vertical centre from the top edge, both 0–1. Keeping
 * them relative means the same placement survives a change of signature size.
 */
export type SignPlacement = {
  /** 1-based page number. */
  page: number
  x: number
  y: number
}

export type SignResult = {
  blob: Blob
  pages: number
  signed: number
}

function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360
}

/**
 * Stamps a transparent signature PNG onto the given pages. The image is drawn
 * on top of the existing content — nothing is re-rendered or re-compressed,
 * so a scan stays a scan and vector text stays vector.
 *
 * Positions arrive in viewer orientation and are mapped back into unrotated
 * page space, the same transform the page-number stamper uses, so a page with
 * /Rotate 90 gets an upright signature rather than one lying on its side.
 */
export async function signPdf(
  file: File,
  signature: Blob,
  placements: SignPlacement[],
  /** Width of the signature in PDF points (72 per inch). Height follows the image's aspect ratio. */
  widthPt: number,
): Promise<SignResult> {
  if (placements.length === 0) {
    throw new Error('Click on the preview to place the signature at least once.')
  }

  const bytes = await file.arrayBuffer()
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
  if (doc.isEncrypted) throw new EncryptedPdfError(file.name)

  const png = await doc.embedPng(new Uint8Array(await signature.arrayBuffer()))
  const height = (widthPt * png.height) / png.width
  const total = doc.getPageCount()

  for (const placement of placements) {
    if (placement.page < 1 || placement.page > total) continue
    const page = doc.getPage(placement.page - 1)
    const box = page.getCropBox()
    const rotation = normalizeAngle(page.getRotation().angle)
    const sideways = rotation === 90 || rotation === 270
    const visibleWidth = sideways ? box.height : box.width
    const visibleHeight = sideways ? box.width : box.height

    // Bottom-left corner of the image in viewer-oriented points (y up).
    const vx = placement.x * visibleWidth - widthPt / 2
    const vy = visibleHeight - placement.y * visibleHeight - height / 2

    // Map the viewer point into unrotated page space; pdf-lib then rotates
    // the image about that anchor, and the page's own /Rotate makes the net
    // result appear upright on screen.
    let drawX = vx
    let drawY = vy
    if (rotation === 90) {
      drawX = box.width - vy
      drawY = vx
    } else if (rotation === 180) {
      drawX = box.width - vx
      drawY = box.height - vy
    } else if (rotation === 270) {
      drawX = vy
      drawY = box.height - vx
    }

    page.drawImage(png, {
      x: box.x + drawX,
      y: box.y + drawY,
      width: widthPt,
      height,
      rotate: degrees(rotation),
    })
  }

  doc.setProducer('QuietKit')
  doc.setCreator('QuietKit')
  doc.setModificationDate(new Date())

  const saved = await doc.save()
  return {
    blob: new Blob([new Uint8Array(saved)], { type: 'application/pdf' }),
    pages: total,
    signed: new Set(placements.map((p) => p.page)).size,
  }
}
