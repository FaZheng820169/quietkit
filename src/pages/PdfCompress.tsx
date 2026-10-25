import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Dropzone } from '../components/Dropzone'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, DownloadIcon, FileIcon, LockIcon, TrashIcon } from '../components/Icons'
import { baseName, downloadBlob, formatBytes } from '../lib/files'
import { ENCRYPTED_PDF_HELP } from '../lib/pdfErrors'
import { openPdfPreview, pdfHasText, type PdfPreview } from '../lib/pdfjs'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'
import type { CompressResult } from '../lib/pdfCompress'

type PresetKey = 'small' | 'balanced' | 'sharp'

const PREVIEW_WIDTH = 620
const PREVIEW_HEIGHT = 500
const MAX_PAGES = 80

const PRESETS: Record<PresetKey, { label: string; dpi: number; quality: number; hint: string }> = {
  small: {
    label: 'Smallest',
    dpi: 110,
    quality: 0.6,
    hint: '110 DPI · q60 — for scans that only need to be read on screen',
  },
  balanced: {
    label: 'Balanced',
    dpi: 150,
    quality: 0.72,
    hint: '150 DPI · q72 — the usual choice for email, forms and receipts',
  },
  sharp: {
    label: 'Sharper',
    dpi: 200,
    quality: 0.82,
    hint: '200 DPI · q82 — for printing and detailed drawings',
  },
}

const faqs = [
  {
    q: 'Why does the text stop being selectable?',
    a: 'Because the page is rebuilt as a JPEG. A browser can read the images already inside a PDF but cannot rewrite them in place, so the honest way to shrink a file locally is to redraw each page at a lower resolution. That turns words into pixels. A server with a full PDF library could recompress the original images and keep the text, which is exactly the upload this tool exists to avoid.',
  },
  {
    q: 'Which preset should I choose?',
    a: 'Balanced, unless you know better. 150 DPI at quality 72 is readable on screen and in print, and shrinks a typical 300 DPI scan by a large factor. Choose Smallest for a 40-page scan you only need to skim on a laptop. Choose Sharper only when fine print, drawings or barcodes must stay legible — it gives back some of the savings.',
  },
  {
    q: 'My file got bigger. Why?',
    a: 'The PDF was already efficient — often a text document with a small embedded font. Rebuilding it as page images adds pixels where there were vectors, so the copy can be larger than the original. The result screen says so plainly; in that case keep the original. This tool is for heavy scans, not for contracts that were already small.',
  },
  {
    q: 'What is preserved, and what is lost?',
    a: 'Page count, page order and page dimensions stay the same, and the pages look as they did. Lost are selectable text, links, form fields, bookmarks, attachments and accessibility tags — all of which live in the PDF structure rather than in the page picture. The document title, author and keywords are not carried over either, which is usually the outcome you want.',
  },
  {
    q: 'Is my PDF uploaded during compression?',
    a: 'No. The file is read into this tab and each page is drawn into a canvas, encoded as JPEG, and written into a new PDF in memory. You can watch the Network panel while it runs: no request carries the document.',
  },
]

export function PdfCompress() {
  useSeo({
    ...routeMeta('/tools/pdf-compress'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit Compress PDF',
          'Shrink a PDF by rebuilding each page as a JPEG at 110, 150 or 200 DPI — locally, with before-and-after sizes shown.',
          '/tools/pdf-compress',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<PdfPreview | null>(null)
  const [previewBox, setPreviewBox] = useState({ width: 0, pageWidth: 0, pageHeight: 0 })
  const [hasText, setHasText] = useState<boolean | null>(null)
  const [preset, setPreset] = useState<PresetKey>('balanced')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CompressResult | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewRef = useRef<PdfPreview | null>(null)
  const renderSeq = useRef(0)

  const pageCount = preview?.pageCount ?? null
  const tooManyPages = pageCount !== null && pageCount > MAX_PAGES

  useEffect(() => {
    return () => {
      previewRef.current?.destroy()
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!preview || !canvas) return
    const mine = (renderSeq.current += 1)
    preview
      .render(1, canvas, PREVIEW_WIDTH, PREVIEW_HEIGHT)
      .then((box) => {
        if (mine === renderSeq.current) {
          setPreviewBox({ width: box.width, pageWidth: box.pageWidth, pageHeight: box.pageHeight })
        }
      })
      .catch(() => {
        if (mine === renderSeq.current) {
          setError('Could not preview this PDF. It may be password-protected or damaged.')
        }
      })
  }, [preview])

  const pick = async (files: File[]) => {
    const pdf = files.find(
      (entry) => entry.type === 'application/pdf' || /\.pdf$/i.test(entry.name),
    )
    if (!pdf) return

    renderSeq.current += 1
    previewRef.current?.destroy()
    previewRef.current = null
    setPreview(null)
    setPreviewBox({ width: 0, pageWidth: 0, pageHeight: 0 })
    setFile(pdf)
    setHasText(null)
    setResult(null)
    setError(null)

    // Both reads are local and independent; the text probe only feeds a warning.
    void pdfHasText(pdf).then(setHasText)

    try {
      const next = await openPdfPreview(pdf)
      previewRef.current = next
      setPreview(next)
    } catch (caught) {
      setError(
        (caught as { name?: string } | null)?.name === 'PasswordException'
          ? ENCRYPTED_PDF_HELP
          : 'This PDF could not be opened. It may be damaged.',
      )
    }
  }

  const reset = () => {
    renderSeq.current += 1
    previewRef.current?.destroy()
    previewRef.current = null
    setFile(null)
    setPreview(null)
    setPreviewBox({ width: 0, pageWidth: 0, pageHeight: 0 })
    setHasText(null)
    setResult(null)
    setError(null)
    setProgress(null)
  }

  const compress = async () => {
    if (!file || pageCount === null) return
    setBusy(true)
    setError(null)
    setResult(null)
    setProgress({ done: 0, total: pageCount })
    try {
      const { compressPdf } = await import('../lib/pdfCompress')
      const output = await compressPdf(
        file,
        { dpi: PRESETS[preset].dpi, quality: PRESETS[preset].quality },
        (done, total) => setProgress({ done, total }),
      )
      setResult(output)
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Could not compress this PDF. Try a smaller preset.',
      )
    } finally {
      setBusy(false)
      setProgress(null)
    }
  }

  const download = () => {
    if (!result || !file) return
    downloadBlob(result.blob, `${baseName(file.name)}-compressed.pdf`)
  }

  const change = result ? 1 - result.bytes / result.originalBytes : null
  const saved = change !== null && change > 0
  const pageMm = previewBox.pageWidth
    ? {
        width: Math.round((previewBox.pageWidth * 25.4) / 72),
        height: Math.round((previewBox.pageHeight * 25.4) / 72),
      }
    : null

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Documents</span>
          <h1>Compress a PDF, on your own machine</h1>
          <p>
            Rebuild heavy scans at 110, 150 or 200 DPI and see the before-and-after size before you
            keep the copy. The trade is stated up front: rebuilt pages are images, so the words stop
            being selectable. Nothing is uploaded.
          </p>
        </div>
      </section>

      <div className="container workspace">
        <div>
          <div className="panel">
            {!file ? (
              <Dropzone
                accept="application/pdf,.pdf"
                title="Drop a PDF here, or click to choose"
                hint="One file · up to 80 pages · pages are redrawn, not recompressed in place"
                icon={<FileIcon size={30} />}
                onFiles={pick}
              />
            ) : (
              <>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="panel-title" style={{ marginBottom: 0 }}>
                    {file.name} · {pageCount ?? '…'} page{pageCount === 1 ? '' : 's'} ·{' '}
                    {formatBytes(file.size)}
                  </span>
                  <button className="btn btn-sm" onClick={reset}>
                    <TrashIcon size={14} /> Start over
                  </button>
                </div>

                <div style={{ textAlign: 'center', marginTop: 14 }}>
                  <div className="pdf-preview">
                    <canvas ref={canvasRef} aria-label="Preview of page 1" />
                  </div>
                </div>
                {pageMm && (
                  <p className="small muted" style={{ marginTop: 8, textAlign: 'center' }}>
                    Page 1 is {pageMm.width} × {pageMm.height} mm — the copy keeps that size at{' '}
                    {PRESETS[preset].dpi} DPI.
                  </p>
                )}

                <div className="controls" style={{ marginTop: 18 }}>
                  <div className="field">
                    <span className="field-label">How hard to compress</span>
                    <div className="segmented">
                      {(Object.keys(PRESETS) as PresetKey[]).map((key) => (
                        <button
                          key={key}
                          aria-pressed={preset === key}
                          onClick={() => {
                            setPreset(key)
                            setResult(null)
                          }}
                        >
                          {PRESETS[key].label}
                        </button>
                      ))}
                    </div>
                    <p className="small muted" style={{ marginTop: 8 }}>
                      {PRESETS[preset].hint}. Lower settings mean smaller files, not smaller pages.
                    </p>
                  </div>
                </div>

                {tooManyPages && (
                  <div className="notice" style={{ marginTop: 16 }}>
                    This PDF has {pageCount} pages. One run compresses up to {MAX_PAGES} — split it
                    with the <Link to="/tools/pdf-split">split tool</Link> and compress the parts.
                  </div>
                )}

                {hasText === true && (
                  <div className="notice" style={{ marginTop: 16 }}>
                    <strong>This PDF has selectable text.</strong> Rebuilding it as page images makes
                    the words unsearchable and drops links, form fields and bookmarks. If you need
                    those, keep the original.
                  </div>
                )}
                {hasText === false && (
                  <div className="notice notice-ok" style={{ marginTop: 16 }}>
                    These pages are already images, so flattening them costs no text — this is
                    exactly the kind of file that shrinks well.
                  </div>
                )}

                {error && (
                  <div className="notice notice-error" style={{ marginTop: 16 }}>
                    {error}
                  </div>
                )}

                <div className="row" style={{ marginTop: 20, justifyContent: 'space-between' }}>
                  <button
                    className="btn btn-forest"
                    onClick={compress}
                    disabled={busy || pageCount === null || tooManyPages}
                  >
                    {busy && progress
                      ? `Rebuilding ${progress.done} of ${progress.total}…`
                      : `Compress ${pageCount ? `${pageCount} page${pageCount === 1 ? '' : 's'}` : '…'}`}
                  </button>
                  {result && (
                    <button className="btn" onClick={download}>
                      <DownloadIcon size={16} /> Download ({formatBytes(result.bytes)})
                    </button>
                  )}
                </div>

                {result && (
                  <>
                    {saved ? (
                      <div className="notice notice-ok" style={{ marginTop: 16 }}>
                        {Math.round((change ?? 0) * 100)}% smaller — {formatBytes(result.originalBytes)}{' '}
                        became {formatBytes(result.bytes)} across {result.pages} page
                        {result.pages === 1 ? '' : 's'}. The original is untouched.
                      </div>
                    ) : (
                      <div className="notice" style={{ marginTop: 16 }}>
                        The rebuilt copy is {Math.round(Math.abs(change ?? 0) * 100)}% larger than
                        the original. That PDF was already efficient, so keep the original unless you
                        specifically need a flat copy.
                      </div>
                    )}
                    <div className="stat-grid" style={{ marginTop: 14 }}>
                      <div className="stat">
                        <span className="small muted">Before</span>
                        <strong>{formatBytes(result.originalBytes)}</strong>
                      </div>
                      <div className="stat">
                        <span className="small muted">After</span>
                        <strong>{formatBytes(result.bytes)}</strong>
                      </div>
                      <div className="stat">
                        <span className="small muted">Pages</span>
                        <strong>{result.pages}</strong>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          <div style={{ marginTop: 20 }}>
            <AdSlot />
          </div>
        </div>

        <aside className="stack-md">
          <div className="panel">
            <span className="panel-title">What survives</span>
            <p className="small muted">
              Page count, page order, page size and the way each page looks. The copy opens the same
              way in any viewer.
            </p>
            <div className="row" style={{ marginTop: 14 }}>
              <LockIcon size={16} /> <span className="small">0 bytes uploaded</span>
            </div>
          </div>

          <div className="panel">
            <span className="panel-title">What does not</span>
            <p className="small muted">
              Selectable text, links, forms, bookmarks, attachments and tagged accessibility. Those
              live in the PDF structure, not in the page picture.
            </p>
          </div>

          <div className="panel">
            <span className="panel-title">Related</span>
            <ul
              className="stack-sm"
              style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}
            >
              <li>
                <Link to="/tools/pdf-split" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Split a long scan first
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-to-jpg" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Export pages as JPG instead
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-metadata" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Clear the metadata on the original
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-watermark" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Mark the compressed copy
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="section">
        <div className="container-narrow prose">
          <h2>Two very different jobs called “compress”</h2>
          <p>
            A PDF is a container, not a picture. It holds fonts, photographs, vector drawings and a
            text layer, each stored in its own way. Real PDF compression rewrites those parts:
            downsampling the photographs, dropping fonts nobody uses, throwing away duplicate objects.
            That keeps the text selectable and can shrink a file dramatically — but it needs a full
            PDF toolkit and, in practice, a server.
          </p>
          <p>
            This tool does the other, simpler job: it redraws every page at a chosen resolution and
            puts those images into a new PDF. That is what makes it possible in a tab with no upload.
            The result is an honest, flat copy — the same pages, at a lower resolution, with the text
            turned into pixels. For a 300 DPI scan of a signed contract, that is usually the whole
            job. For a 200 KB invoice made of text, it is the wrong tool, and the result screen will
            tell you so if the copy grows.
          </p>

          <h2>When scans shrink, and by how much</h2>
          <p>
            A page scanned at 300 DPI on A4 is about 2480 × 3508 pixels. Rebuilt at 150 DPI it becomes
            1240 × 1754 — a quarter of the pixels — and at JPEG quality 72 the difference is usually
            a factor of three to six, depending on how noisy the scan is. Yellowed paper, faint pencil
            and speckled backgrounds are the expensive parts, which is why a clean typeset document
            saves less than a photographed one.
          </p>
          <p>
            At 110 DPI a page is still legible on a laptop at 100%, but small print starts to soften.
            At 200 DPI fine print, signatures and barcodes survive, and the file is still much smaller
            than a 300 DPI original. If a page contains a photograph you care about, check that page
            after compressing rather than trusting the average.
          </p>

          <h2>Reading the result honestly</h2>
          <p>
            The tool shows both sizes and the percentage rather than promising a number in advance.
            An estimate before the fact would be a guess: JPEG output depends on content, and the same
            settings can halve one scan and barely touch another. After the run you get the real
            figure and a download button.
          </p>
          <p>
            If the copy is larger, nothing is broken — the original was simply more efficient than a
            page image. Keep it. If the copy is smaller but the pages look soft, run it again with
            Sharper; the work is local, so trying twice costs nothing but a few seconds.
          </p>

          <h2>Before you send the smaller file</h2>
          <ul>
            <li>Open the download and check the smallest text you need to keep — a date, an amount, a signature.</li>
            <li>Confirm links and form fields are not needed; they do not survive the rebuild.</li>
            <li>Keep the original somewhere. The compressed copy is a separate file, never an edit in place.</li>
            <li>If the scan also carries hidden metadata, clean the original with the <Link to="/tools/pdf-metadata">metadata tool</Link> before archiving it.</li>
          </ul>

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
