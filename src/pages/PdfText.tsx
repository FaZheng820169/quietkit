import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Dropzone } from '../components/Dropzone'
import { AdSlot } from '../components/AdSlot'
import { DownloadIcon, FileIcon, LockIcon, ShieldIcon, TrashIcon, CheckIcon } from '../components/Icons'
import { baseName, downloadBlob, formatBytes } from '../lib/files'
import { openPdfText, type PdfTextDoc } from '../lib/pdfText'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'Does the PDF get uploaded anywhere?',
    a: 'No. The file is read with the File API, parsed by pdf.js in this tab, and the text is written straight into the page. There is no server side to QuietKit, so there is nowhere for the document to go.',
  },
  {
    q: 'Why does a scanned PDF return nothing?',
    a: 'A scan is a picture of text. There is no text layer to copy, only pixels — so any extractor returns empty output until OCR reconstructs the characters. QuietKit does not pretend otherwise and does not send the file to an OCR service.',
  },
  {
    q: 'Is the extracted text exactly what the PDF shows?',
    a: 'The characters are exact. The layout is rebuilt line by line, because a PDF stores text as positioned fragments, not as paragraphs. Multi-column pages, tables and footnotes may therefore come out in a different reading order.',
  },
  {
    q: 'Can I copy just one page instead of the whole document?',
    a: 'Yes. Open the page, then use “Copy page” or “Download .txt”. The full document is only assembled when you ask for it, which keeps long files fast.',
  },
  {
    q: 'What about password-protected PDFs?',
    a: 'A PDF that requires a password to open cannot be read by the browser. Remove the password in your PDF reader first, then extract the text here.',
  },
  {
    q: 'Is there a page or size limit?',
    a: 'No fixed limit — the ceiling is your device memory. A few hundred text pages are routine. Files made of large scans take longer because every page still has to be parsed.',
  },
]

function friendlyError(caught: unknown): string {
  const name = caught instanceof Error ? caught.name : ''
  if (name === 'PasswordException') {
    return 'This PDF is password-protected. Remove the password in your reader, then try again.'
  }
  if (name === 'InvalidPDFException') {
    return 'This file is not a valid PDF, or it is damaged.'
  }
  return 'Could not read this PDF. It may be damaged or use an unusual encoding.'
}

export function PdfText() {
  useSeo({
    ...routeMeta('/tools/pdf-text'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit PDF Text Extractor',
          'Copy or download the text inside a PDF without uploading it. Pages are parsed in the browser.',
          '/tools/pdf-text',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [doc, setDoc] = useState<PdfTextDoc | null>(null)
  const [fileSize, setFileSize] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [text, setText] = useState('')
  const [reading, setReading] = useState(false)
  const [progress, setProgress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current)
    }
  }, [])

  useEffect(() => {
    return () => {
      void doc?.destroy()
    }
  }, [doc])

  const open = async (files: File[]) => {
    const file = files[0]
    if (!file) return
    setReading(true)
    setError(null)
    setText('')
    setPageNumber(1)
    setDoc(null)
    setFileSize(file.size)
    try {
      const opened = await openPdfText(file)
      setDoc(opened)
      setText(await opened.page(1))
    } catch (caught) {
      setError(friendlyError(caught))
    } finally {
      setReading(false)
    }
  }

  const goTo = async (target: number) => {
    if (!doc) return
    const next = Math.min(Math.max(1, target), doc.pageCount)
    if (next === pageNumber) return
    setReading(true)
    setError(null)
    setPageNumber(next)
    try {
      setText(await doc.page(next))
    } catch {
      setError('Could not read that page.')
      setText('')
    } finally {
      setReading(false)
    }
  }

  const copyPage = async () => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      if (copyTimer.current) clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopied(false), 1800)
    } catch {
      setError('The clipboard is blocked here. Select the text and copy it manually.')
    }
  }

  const downloadTxt = (body: string, suffix: string) => {
    if (!doc) return
    const blob = new Blob([body], { type: 'text/plain;charset=utf-8' })
    downloadBlob(blob, `${baseName(doc.fileName)}${suffix}.txt`)
  }

  const downloadAll = async () => {
    if (!doc) return
    setError(null)
    setProgress('Reading page 1…')
    try {
      const full = await doc.all((done, total) => setProgress(`Reading page ${done} of ${total}…`))
      downloadTxt(full, '-text')
    } catch {
      setError('Could not extract every page. Try downloading pages one by one.')
    } finally {
      setProgress(null)
    }
  }

  const words = text.trim() ? text.trim().split(/\s+/).length : 0

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Documents</span>
          <h1>Copy text out of a PDF, without uploading it</h1>
          <p>
            Contracts, invoices and research papers hold text you cannot select in some readers.
            QuietKit reads the PDF's own text layer in this tab and hands it back — page by page,
            or as one plain-text file.
          </p>
        </div>
      </section>

      <div className="container workspace">
        <div>
          <div className="panel">
            {!doc ? (
              <>
                <Dropzone
                  accept="application/pdf,.pdf"
                  title="Drop a PDF here, or click to choose"
                  hint="Text layer only · scans need OCR · 0 bytes uploaded"
                  icon={<FileIcon size={30} />}
                  onFiles={open}
                />
                {reading && (
                  <div className="notice" style={{ marginTop: 16 }}>
                    Parsing the first page locally…
                  </div>
                )}
                {error && (
                  <div className="notice notice-error" style={{ marginTop: 16 }}>{error}</div>
                )}
                <p className="small muted" style={{ marginTop: 12 }}>
                  pdf.js is downloaded the first time you open a file — about 2 MB, then cached.
                </p>
              </>
            ) : (
              <>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <div style={{ minWidth: 0 }}>
                    <div className="result-name">{doc.fileName}</div>
                    <div className="result-sub">
                      {doc.pageCount} page{doc.pageCount === 1 ? '' : 's'} · {formatBytes(fileSize)}
                      {text && ` · ${words} word${words === 1 ? '' : 's'} on this page`}
                    </div>
                  </div>
                  <button
                    className="btn btn-sm"
                    onClick={() => {
                      setDoc(null)
                      setText('')
                      setError(null)
                      setProgress(null)
                    }}
                  >
                    <TrashIcon size={14} /> Close
                  </button>
                </div>

                <div className="row" style={{ marginTop: 16, justifyContent: 'space-between' }}>
                  <div className="row">
                    <button className="btn btn-sm" onClick={() => goTo(pageNumber - 1)} disabled={pageNumber <= 1 || reading}>
                      ← Previous
                    </button>
                    <span className="small muted" aria-live="polite">
                      Page {pageNumber} of {doc.pageCount}
                    </span>
                    <button
                      className="btn btn-sm"
                      onClick={() => goTo(pageNumber + 1)}
                      disabled={pageNumber >= doc.pageCount || reading}
                    >
                      Next →
                    </button>
                  </div>
                  {reading && <span className="small muted">reading locally…</span>}
                </div>

                {error && (
                  <div className="notice notice-error" style={{ marginTop: 14 }}>{error}</div>
                )}

                {text ? (
                  <pre className="text-preview" aria-label={`Text of page ${pageNumber}`}>{text}</pre>
                ) : reading ? (
                  <div className="text-preview placeholder">Reading page {pageNumber}…</div>
                ) : (
                  <div className="notice notice-error" style={{ marginTop: 14, display: 'block' }}>
                    <strong>No text layer on this page.</strong>
                    <div style={{ marginTop: 4 }}>
                      It is probably a scan — a picture of text. Extracting characters from it
                      would need OCR, which this tool deliberately does not fake.
                    </div>
                  </div>
                )}

                <div className="row" style={{ marginTop: 16, justifyContent: 'space-between' }}>
                  <div className="row">
                    <button className="btn" onClick={copyPage} disabled={!text}>
                      <FileIcon size={15} /> {copied ? 'Copied' : 'Copy page'}
                    </button>
                    <button className="btn" onClick={() => downloadTxt(text, `-page-${pageNumber}`)} disabled={!text}>
                      <DownloadIcon size={15} /> Download page
                    </button>
                  </div>
                  <button className="btn btn-forest" onClick={downloadAll} disabled={progress !== null}>
                    <DownloadIcon size={15} /> {progress ?? 'Extract whole PDF'}
                  </button>
                </div>

                <div className="notice" style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                  <ShieldIcon size={16} />
                  <span className="small">
                    Nothing left this tab. Closing this page or the browser tab drops the file
                    from memory; no copy is kept.
                  </span>
                </div>
              </>
            )}
          </div>

          <div style={{ marginTop: 20 }}>
            <AdSlot />
          </div>
        </div>

        <aside className="stack-md">
          <div className="panel">
            <span className="panel-title">What you get</span>
            <p className="small muted">
              The characters, line by line. No images, no tables, no column layout — plain text
              that pastes cleanly into notes, email or a spreadsheet.
            </p>
            <div className="row" style={{ marginTop: 14 }}>
              <LockIcon size={16} /> <span className="small">Local parse · 0 bytes uploaded</span>
            </div>
          </div>

          <div className="panel">
            <span className="panel-title">Related</span>
            <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
              <li>
                <Link to="/tools/pdf-merge" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Merge PDFs
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-remove-pages" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Remove or extract pages
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-rotate" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Rotate sideways scans
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-reorder" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Reorder PDF pages
                </Link>
              </li>
              <li>
                <Link to="/guides/extract-text-from-pdf-without-upload" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Guide: the text layer, explained
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="section">
        <div className="container-narrow prose">
          <h2>What a PDF text layer really is</h2>
          <p>
            A PDF does not store paragraphs. It stores a set of instructions: put this glyph at
            this coordinate, in this font, at this size. What you see as a sentence is actually
            dozens of positioned fragments. Every extractor, including this one, has to rebuild
            the reading order from those coordinates.
          </p>
          <p>
            QuietKit sorts the fragments into lines by their vertical position, then orders each
            line left to right and inserts a space wherever the gap between fragments is wider
            than a single glyph. That is why ordinary documents come out cleanly, while a
            three-column academic paper may need a light edit.
          </p>

          <h2>When there is nothing to extract</h2>
          <p>
            If a page was scanned, photographed or printed to PDF from an image, it contains no
            text at all — only pixels. Select-all in your reader returns nothing for the same
            reason. Recovering words from that page requires OCR, which changes the characters to
            best guesses. QuietKit shows the empty result instead of hiding the limitation.
          </p>

          <h2>Why local extraction matters</h2>
          <p>
            The usual PDF-to-text services ask you to upload the document. Contracts, medical
            letters, salary offers and invoices are exactly the files people are told not to hand
            to strangers. Here the parse happens in the same tab that renders this page: the file
            is read with the File API, held in memory, and discarded when you close the tab. There
            is no upload endpoint because there is no backend.
          </p>
          <p>
            The trade-off is honest: this is not a converter, it does not preserve tables or
            images, and it cannot read a password-protected file. What it does — copying the words
            out of a normal PDF quickly, privately, and for free — it does entirely on your device.
          </p>

          <h2>FAQ</h2>
          <div className="faq">
            {faqs.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <div className="faq-body">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
