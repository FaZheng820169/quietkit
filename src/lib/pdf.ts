import { PDFDocument } from 'pdf-lib'

export type PdfPart = {
  file: File
  pages: number
}

export async function countPdfPages(file: File): Promise<number> {
  const bytes = await file.arrayBuffer()
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
  return doc.getPageCount()
}

export async function mergePdfs(files: File[]): Promise<{ blob: Blob; pages: number }> {
  const out = await PDFDocument.create()
  let pages = 0

  for (const file of files) {
    const bytes = await file.arrayBuffer()
    const src = await PDFDocument.load(bytes, { ignoreEncryption: true })
    const copied = await out.copyPages(src, src.getPageIndices())
    copied.forEach((page) => out.addPage(page))
    pages += copied.length
  }

  out.setTitle('Merged with QuietKit')
  out.setProducer('QuietKit')
  out.setCreator('QuietKit')
  out.setCreationDate(new Date())

  const bytes = await out.save()
  const buffer = new Uint8Array(bytes)
  return { blob: new Blob([buffer], { type: 'application/pdf' }), pages }
}
