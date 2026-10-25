import {
  PDFDict,
  PDFDocument,
  PDFHexString,
  PDFName,
  PDFNumber,
  PDFObject,
  PDFRef,
  PDFStream,
  PDFString,
} from 'pdf-lib'
import { paperName } from './pdfLayout'

export type MetaRisk = 'identity' | 'software' | 'timeline' | 'content' | 'other'

export type PdfMetaField = {
  key: string
  label: string
  value: string
  risk: MetaRisk
}

export type PdfPageSize = {
  label: string
  width: number
  height: number
  rotation: number
  count: number
}

export type PdfMetadataReport = {
  pageCount: number
  encrypted: boolean
  fields: PdfMetaField[]
  pageSizes: PdfPageSize[]
  xmpBytes: number
  hasInfo: boolean
}

export type PdfCleanResult = {
  blob: Blob
  pages: number
  fieldsRemoved: number
  xmpRemoved: boolean
  idRemoved: boolean
}

const KNOWN: Record<string, { label: string; risk: MetaRisk }> = {
  Title: { label: 'Title', risk: 'content' },
  Author: { label: 'Author', risk: 'identity' },
  Subject: { label: 'Subject', risk: 'content' },
  Keywords: { label: 'Keywords', risk: 'content' },
  Creator: { label: 'Creator', risk: 'software' },
  Producer: { label: 'Producer', risk: 'software' },
  CreationDate: { label: 'Created', risk: 'timeline' },
  ModDate: { label: 'Modified', risk: 'timeline' },
}

const ORDER = Object.keys(KNOWN)

function infoDict(doc: PDFDocument): PDFDict | undefined {
  const ref = doc.context.trailerInfo.Info
  if (!ref) return undefined
  const dict = doc.context.lookup(ref)
  return dict instanceof PDFDict ? dict : undefined
}

function decodeValue(doc: PDFDocument, raw: PDFObject): string | undefined {
  const obj = doc.context.lookup(raw)
  try {
    if (obj instanceof PDFString || obj instanceof PDFHexString) {
      const text = obj.decodeText().trim()
      return text || undefined
    }
    if (obj instanceof PDFNumber) return `${obj.asNumber()}`
    if (obj instanceof PDFName) return obj.decodeText()
  } catch {
    // A malformed string (or one encrypted with an unknown key) is not worth
    // failing the whole inspection over — the field is simply left out.
  }
  return undefined
}

/**
 * PDF dates look like D:20240131153000+01'00'. Readable dates are more useful
 * than the raw string, but an odd one is shown as written rather than dropped.
 */
export function formatPdfDate(value: string): string {
  const match = /^D:(\d{4})(\d{2})?(\d{2})?(\d{2})?(\d{2})?(\d{2})?/.exec(value)
  if (!match) return value
  const [, year, month, day, hour, minute] = match
  const date = `${year}${month ? `-${month}` : ''}${day ? `-${day}` : ''}`
  const time = hour ? ` ${hour}:${minute ?? '00'}` : ''
  const rest = value.slice(match[0].length)
  const numericZone = /^([+-])(\d{2})'?(\d{2})?/.exec(rest)
  const suffix = rest.startsWith('Z')
    ? ' UTC'
    : numericZone
      ? ` UTC${numericZone[1]}${numericZone[2]}:${numericZone[3] ?? '00'}`
      : ''
  return `${date}${time}${suffix}`
}

function readFields(doc: PDFDocument): PdfMetaField[] {
  const dict = infoDict(doc)
  if (!dict) return []
  const fields: PdfMetaField[] = []

  dict.entries().forEach(([name, raw]) => {
    const key = name.decodeText()
    const value = decodeValue(doc, raw)
    if (!value) return
    const known = KNOWN[key]
    fields.push({
      key,
      label: known?.label ?? key,
      value: key === 'CreationDate' || key === 'ModDate' ? formatPdfDate(value) : value,
      risk: known?.risk ?? 'other',
    })
  })

  return fields.sort((a, b) => {
    const rankA = ORDER.indexOf(a.key)
    const rankB = ORDER.indexOf(b.key)
    const sortedA = rankA === -1 ? ORDER.length : rankA
    const sortedB = rankB === -1 ? ORDER.length : rankB
    return sortedA - sortedB || a.label.localeCompare(b.label)
  })
}

function readPageSizes(doc: PDFDocument): PdfPageSize[] {
  const sizes = new Map<string, PdfPageSize>()

  doc.getPages().forEach((page) => {
    const { width, height } = page.getSize()
    const rotation = ((page.getRotation().angle % 360) + 360) % 360
    const rounded = {
      width: Math.round(width * 10) / 10,
      height: Math.round(height * 10) / 10,
    }
    const key = `${rounded.width}x${rounded.height}@${rotation}`
    const existing = sizes.get(key)
    if (existing) {
      existing.count += 1
    } else {
      sizes.set(key, {
        label: paperName(width, height),
        width: rounded.width,
        height: rounded.height,
        rotation,
        count: 1,
      })
    }
  })

  return Array.from(sizes.values()).sort((a, b) => b.count - a.count)
}

function xmpStream(doc: PDFDocument): PDFStream | undefined {
  const ref = doc.catalog.get(PDFName.of('Metadata'))
  if (!ref) return undefined
  const obj = doc.context.lookup(ref)
  return obj instanceof PDFStream ? obj : undefined
}

/**
 * Reads the properties a PDF states about itself. `updateMetadata` is switched
 * off deliberately: pdf-lib otherwise rewrites Producer and ModDate on load,
 * which would make the report describe pdf-lib instead of the real file.
 */
export async function inspectPdfMetadata(file: File): Promise<PdfMetadataReport> {
  const bytes = await file.arrayBuffer()
  const doc = await PDFDocument.load(bytes, {
    ignoreEncryption: true,
    updateMetadata: false,
  })
  const xmp = xmpStream(doc)

  return {
    pageCount: doc.getPageCount(),
    encrypted: doc.isEncrypted,
    // Property strings inside an encrypted file cannot be decoded without the
    // password, so the table is left empty instead of showing garbage.
    fields: doc.isEncrypted ? [] : readFields(doc),
    pageSizes: readPageSizes(doc),
    xmpBytes: xmp ? xmp.getContentsSize() : 0,
    hasInfo: Boolean(doc.context.trailerInfo.Info),
  }
}

/**
 * Empties the Info dictionary in place instead of orphaning it: pdf-lib writes
 * every registered indirect object, so a detached dictionary would still end
 * up in the saved bytes. Keys are deleted, the values with them, and the XMP
 * stream is dropped from the catalog and from the context.
 */
export async function stripPdfMetadata(file: File): Promise<PdfCleanResult> {
  const bytes = await file.arrayBuffer()
  const doc = await PDFDocument.load(bytes, {
    ignoreEncryption: true,
    updateMetadata: false,
  })
  const pages = doc.getPageCount()

  let fieldsRemoved = 0
  const dict = infoDict(doc)
  if (dict) {
    dict.entries().forEach(([key, raw]) => {
      dict.delete(key)
      fieldsRemoved += 1
      if (raw instanceof PDFRef) doc.context.delete(raw)
    })
  }

  let xmpRemoved = false
  const xmpRef = doc.catalog.get(PDFName.of('Metadata'))
  if (xmpRef) {
    doc.catalog.delete(PDFName.of('Metadata'))
    if (xmpRef instanceof PDFRef) doc.context.delete(xmpRef)
    xmpRemoved = true
  }

  let idRemoved = false
  const fileId = doc.context.trailerInfo.ID
  if (fileId) {
    doc.context.trailerInfo.ID = undefined
    if (fileId instanceof PDFRef) doc.context.delete(fileId)
    idRemoved = true
  }

  const saved = await doc.save()
  return {
    blob: new Blob([new Uint8Array(saved)], { type: 'application/pdf' }),
    pages,
    fieldsRemoved,
    xmpRemoved,
    idRemoved,
  }
}
