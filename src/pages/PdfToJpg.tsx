import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Dropzone } from '../components/Dropzone'
import { AdSlot } from '../components/AdSlot'
import { DownloadIcon, FileIcon, LockIcon, CheckIcon, TrashIcon } from '../components/Icons'
import { baseName, downloadBlob, formatBytes } from '../lib/files'
import { ENCRYPTED_PDF_HELP } from '../lib/pdfErrors'
import { openPdfInfo, type PdfInfo } from '../lib/pdfjs'
import { parsePageRanges } from '../lib/ranges'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'
import type { JpgResult } from '../lib/pdfToImages'

type RangeMode = 'all' | 'some'
type QualityKey = 'small' | 'balanced' | 'best'

const MAX_PAGES = 100

const QUALITY: Record<QualityKey, { label: string; value: number; hint: string }> = {
  small: { label: 'Smaller files', value: 0.72, hint: 'Good for thumbnails and previews' },
  balanced: { label: 'Balanced', value: 0.88, hint: 'The usual choice for sharing' },
  best: { label: 'Best', value: 0.95, hint: 'Large files, minimal artefacts' },
}

const faqs = [
  {
    q: 'Does the JPG keep the PDF text?',
    a: 'No. A JPEG is a grid of pixels, so text stops being selectable or searchable. If you need the words, extract them with the PDF text tool instead of converting the page to an image.',
  },
  {
    q: 'Which resolution should I pick?',
    a: '150 DPI is enough for screen reading and email. 200 DPI is a good default for forms and receipts. 300 DPI is for printing, and produces roughly four times the pixels of 150 DPI, so files get large.',
  },
  {
    q: 'Why is my page on a white background?',
    a: 'JPEG has no transparency channel, so a transparent PDF page would otherwise turn black. Every page is flattened onto white before encoding, which is what a printer or a photo viewer expects.',
  },
  {
    q: 'Why does it refuse my password-protected PDF?',
    a: 'The pages are ciphertext until a password unlocks them, and this tool never asks for one. Open the file in your PDF reader, save an unprotected copy, then convert that copy here.',
  },
  {
    q: 'Is my PDF uploaded anywhere?',
    a: 'No. Pages are drawn into a canvas in this tab and encoded to JPEG in memory. You can open the Network panel and watch: no request carries the file.',
  },
]

function planPages(
  info: PdfInfo | null,
  mode: RangeMode,
  ranges: string,
): { pages: number[]; error: string | null } {
  if (!info) return { pages: [], error: null }
  if (mode === 'all') {
    const pages = Array.from({ length: info.pageCount }, (_, index) => index + 1)
    if (pages.length > MAX_PAGES) {
      return {
        pages: [],
        error: `This PDF has ${info.pageCount} pages. One run converts up to ${MAX_PAGES} — pick a range and run it again for the rest.`,
      }
    }
    return { pages, error: null }
  }
  try {
    const pages = parsePageRanges(ranges, info.pageCount).map((index) => index + 1)
    if (pages.length > MAX_PAGES) {
      return { pages: [], error: `That selects ${pages.length} pages. One run converts up to ${MAX_PAGES}.` }
    }
    return { pages, error: null }
  } catch (caught) {
    return {
      pages: [],
      error: caught instanceof Error ? caught.message : 'Check the page range.',
    }
  }
}

export function PdfToJpg() {
  useSeo({
    ...routeMeta('/tools/pdf-to-jpg'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit PDF to JPG',
          'Convert PDF pages to JPEG images at 150, 200 or 300 DPI, locally in the browser.',
          '/tools/pdf-to-jpg',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [file, setFile] = useState<File | null>(null)
  const [info, setInfo] = useState<PdfInfo | null>(null)
  const [mode, setMode] = useState<RangeMode>('all')
  const [ranges, setRanges] = useState('')
  const [dpi, setDpi] = useState(200)
  const [quality, setQuality] = useState<QualityKey>('balanced')
  const [busy, setBusy] = useState(false)
  const [built, setBuilt] = useState<{ done: number; total: number } | null>(null)
  const [zipping, setZipping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<JpgResult | null>(null)
  const infoRef = useRef<PdfInfo | null>(null)

  const plan = useMemo(() => planPages(info, mode, ranges), [info, mode, ranges])

  // The preview URL is derived from the result, and only the revoke needs an
  // effect — creating it inside setState would leak on every re-render.
  const thumb = useMemo(
    () => (result && result.images.length > 0 ? URL.createObjectURL(result.images[0].blob) : null),
    [result],
  )

  useEffect(() => {
    return () => {
      if (thumb) URL.revokeObjectURL(thumb)
    }
  }, [thumb])

  useEffect(() => {
    return () => {
      void infoRef.current?.destroy()
    }
  }, [])

  const base = file ? baseName(file.name) : 'document'
  const nameFor = (page: number) => `${base}-${page}.jpg`

  const pick = async (files: File[]) => {
    const pdf = files.find(
      (entry) => entry.type === 'application/pdf' || /\.pdf$/i.test(entry.name),
    )
    if (!pdf) return

    infoRef.current?.destroy()
    infoRef.current = null
    setInfo(null)
    setFile(pdf)
    setResult(null)
    setError(null)
    setBuilt(null)

    try {
      const next = await openPdfInfo(pdf)
      infoRef.current = next
      setInfo(next)
    } catch (caught) {
      setError(
        (caught as { name?: string } | null)?.name === 'PasswordException'
          ? ENCRYPTED_PDF_HELP
          : 'This PDF could not be opened. It may be damaged.',
      )
    }
  }

  const reset = () => {
    infoRef.current?.destroy()
    infoRef.current = null
    setInfo(null)
    setFile(null)
    setResult(null)
    setError(null)
    setBuilt(null)
    setRanges('')
  }

  const convert = async () => {
    if (!file || !info || plan.error || plan.pages.length === 0) return
    setBusy(true)
    setError(null)
    setResult(null)
    setBuilt({ done: 0, total: plan.pages.length })
    try {
      const { renderPdfToJpgs } = await import('../lib/pdfToImages')
      const rendered = await renderPdfToJpgs(
        file,
        { dpi, quality: QUALITY[quality].value, pages: plan.pages },
        (done, total) => setBuilt({ done, total }),
      )
      setResult(rendered)
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Could not convert this PDF. Try a smaller page range.',
      )
    } finally {
      setBusy(false)
      setBuilt(null)
    }
  }

  const downloadAll = async () => {
    if (!result || result.images.length === 0) return
    if (result.images.length === 1) {
      downloadBlob(result.images[0].blob, nameFor(result.images[0].page))
      return
    }
    setZipping(true)
    try {
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      result.images.forEach((image) => zip.file(nameFor(image.page), image.blob))
      const blob = await zip.generateAsync({ type: 'blob' })
      downloadBlob(blob, `${base}-jpg.zip`)
    } finally {
      setZipping(false)
    }
  }

  const estimate = info
    ? {
        width: Math.round((info.pageWidth * dpi) / 72),
        height: Math.round((info.pageHeight * dpi) / 72),
      }
    : null
  const pageMm = info
    ? {
        width: Math.round((info.pageWidth * 25.4) / 72),
        height: Math.round((info.pageHeight * 25.4) / 72),
      }
    : null
  const previewPages = plan.pages.slice(0, 8)
  const rest = plan.pages.length - previewPages.length
  const totalOut = result ? result.images.reduce((sum, image) => sum + image.blob.size, 0) : 0

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Documents</span>
          <h1>PDF to JPG, one image per page</h1>
          <p>
            Turn pages into JPEGs at 150, 200 or 300 DPI. Pick a range, get a ZIP of images, and
            keep the document on your own machine — the pages are drawn in this tab, not on a
            server.
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
                hint="One file · pages become images, text becomes pixels"
                icon={<FileIcon size={30} />}
                onFiles={pick}
              />
            ) : (
              <>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="panel-title" style={{ marginBottom: 0 }}>
                    {file.name} · {info?.pageCount ?? '…'} pages · {formatBytes(file.size)}
                  </span>
                  <button className="btn btn-sm" onClick={reset}>
                    <TrashIcon size={14} /> Start over
                  </button>
                </div>

                {pageMm && (
                  <p className="small muted" style={{ marginTop: 8 }}>
                    Page 1 is {pageMm.width} × {pageMm.height} mm · at {dpi} DPI it becomes{' '}
                    {estimate?.width} × {estimate?.height} px
                  </p>
                )}

                <div className="controls" style={{ marginTop: 18 }}>
                  <div className="field">
                    <span className="field-label">Pages</span>
                    <div className="segmented">
                      <button
                        aria-pressed={mode === 'all'}
                        onClick={() => {
                          setMode('all')
                          setResult(null)
                        }}
                      >
                        All pages
                      </button>
                      <button
                        aria-pressed={mode === 'some'}
                        onClick={() => {
                          setMode('some')
                          setResult(null)
                        }}
                      >
                        Selected pages
                      </button>
                    </div>
                  </div>

                  {mode === 'some' && (
                    <div className="field">
                      <label htmlFor="jpg-range">Pages to convert</label>
                      <input
                        id="jpg-range"
                        type="text"
                        value={ranges}
                        onChange={(event) => {
                          setRanges(event.target.value)
                          setResult(null)
                        }}
                        placeholder="e.g. 1-3, 7"
                        autoComplete="off"
                      />
                    </div>
                  )}

                  <div className="field">
                    <span className="field-label">Resolution</span>
                    <div className="segmented">
                      {[150, 200, 300].map((value) => (
                        <button
                          key={value}
                          aria-pressed={dpi === value}
                          onClick={() => {
                            setDpi(value)
                            setResult(null)
                          }}
                        >
                          {value} DPI
                        </button>
                      ))}
                    </div>
                    <p className="small muted" style={{ marginTop: 8 }}>
                      150 for screen and email · 200 for forms and receipts · 300 for printing.
                    </p>
                  </div>

                  <div className="field">
                    <span className="field-label">JPEG quality</span>
                    <div className="segmented">
                      {(Object.keys(QUALITY) as QualityKey[]).map((key) => (
                        <button
                          key={key}
                          aria-pressed={quality === key}
                          onClick={() => {
                            setQuality(key)
                            setResult(null)
                          }}
                        >
                          {QUALITY[key].label}
                        </button>
                      ))}
                    </div>
                    <p className="small muted" style={{ marginTop: 8 }}>
                      {QUALITY[quality].hint}. Lower quality means smaller files, not smaller pages.
                    </p>
                  </div>
                </div>

                {plan.error && (
                  <div className="notice" style={{ marginTop: 16 }}>
                    {plan.error}
                  </div>
                )}

                {!result && !plan.error && plan.pages.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    <span className="panel-title">
                      {plan.pages.length} image{plan.pages.length === 1 ? '' : 's'} will be created
                    </span>
                    <div className="result-list" style={{ marginTop: 10 }}>
                      {previewPages.map((page) => (
                        <div key={page} className="result-row">
                          <span className="thumb-file">JPG</span>
                          <div style={{ minWidth: 0 }}>
                            <div className="result-name">{nameFor(page)}</div>
                            <div className="result-sub">page {page}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {rest > 0 && (
                      <p className="small muted" style={{ marginTop: 8 }}>
                        …and {rest} more.
                      </p>
                    )}
                  </div>
                )}

                {error && (
                  <div className="notice notice-error" style={{ marginTop: 16 }}>
                    {error}
                  </div>
                )}

                {result && (
                  <>
                    <div className="notice notice-ok" style={{ marginTop: 16 }}>
                      Made {result.images.length} image{result.images.length === 1 ? '' : 's'} from{' '}
                      {result.total} pages · {formatBytes(totalOut)} total. The PDF itself is
                      untouched.
                    </div>
                    {thumb && (
                      <figure style={{ margin: '16px 0 0' }}>
                        <img
                          src={thumb}
                          alt={`Preview of ${nameFor(result.images[0].page)}`}
                          style={{
                            display: 'block',
                            maxWidth: '100%',
                            maxHeight: 260,
                            border: '1px solid var(--ink-3)',
                            borderRadius: 4,
                          }}
                        />
                        <figcaption className="small muted" style={{ marginTop: 6 }}>
                          First image: {result.images[0].width} × {result.images[0].height} px
                        </figcaption>
                      </figure>
                    )}
                    <div className="result-list" style={{ marginTop: 12 }}>
                      {result.images.map((image) => (
                        <div key={image.page} className="result-row">
                          <span className="thumb-file">JPG</span>
                          <div style={{ minWidth: 0 }}>
                            <div className="result-name">{nameFor(image.page)}</div>
                            <div className="result-sub">
                              {image.width} × {image.height} px · {formatBytes(image.blob.size)}
                            </div>
                          </div>
                          <button
                            className="btn btn-sm"
                            onClick={() => downloadBlob(image.blob, nameFor(image.page))}
                            aria-label={`Download ${nameFor(image.page)}`}
                          >
                            <DownloadIcon size={14} /> Save
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="row" style={{ marginTop: 20, justifyContent: 'space-between' }}>
                  <button
                    className="btn btn-forest"
                    onClick={convert}
                    disabled={
                      busy || !info || Boolean(plan.error) || plan.pages.length === 0
                    }
                  >
                    {busy
                      ? built
                        ? `Rendering ${built.done} of ${built.total}…`
                        : 'Rendering locally…'
                      : `Convert ${plan.pages.length || '…'} page${
                          plan.pages.length === 1 ? '' : 's'
                        }`}
                  </button>
                  {result && (
                    <button className="btn" onClick={downloadAll} disabled={zipping}>
                      <DownloadIcon size={16} />{' '}
                      {zipping
                        ? 'Zipping locally…'
                        : result.images.length === 1
                          ? `Download (${formatBytes(result.images[0].blob.size)})`
                          : `Download all as ZIP (${formatBytes(totalOut)})`}
                    </button>
                  )}
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
            <span className="panel-title">Honest about the trade-off</span>
            <p className="small muted">
              A JPEG is pixels, not text. That makes the page look identical everywhere and keeps
              any font from being needed — but the words inside stop being selectable. Pages are
              flattened onto white because JPEG has no transparency.
            </p>
            <div className="row" style={{ marginTop: 14 }}>
              <LockIcon size={16} /> <span className="small">0 bytes uploaded</span>
            </div>
          </div>

          <div className="panel">
            <span className="panel-title">Related</span>
            <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
              <li>
                <Link to="/tools/pdf-text" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Need the words? Extract PDF text
                </Link>
              </li>
              <li>
                <Link to="/tools/image-compressor" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Shrink the JPGs afterwards
                </Link>
              </li>
              <li>
                <Link to="/tools/jpg-to-pdf" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Turn photos back into a PDF
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-resize" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Fix the pages before converting
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="section">
        <div className="container prose">
          <h2>Questions people ask before converting</h2>
          <div className="faq">
            {faqs.map((faq) => (
              <details key={faq.q}>
                <summary>{faq.q}</summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
