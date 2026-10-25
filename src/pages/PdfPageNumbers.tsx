import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { Dropzone } from '../components/Dropzone'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, DownloadIcon, FileIcon, LockIcon, TrashIcon } from '../components/Icons'
import {
  PAGE_NUMBER_EDGE,
  type PageNumberFormat,
  type PageNumberPosition,
  type PageNumberResult,
} from '../lib/pdfLayout'
import { openPdfPreview, type PdfPreview } from '../lib/pdfjs'
import { baseName, downloadBlob, formatBytes } from '../lib/files'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const PREVIEW_WIDTH = 620
const PREVIEW_HEIGHT = 560

const FORMATS: { value: PageNumberFormat; label: string }[] = [
  { value: 'plain', label: '1' },
  { value: 'slash', label: '1 / 12' },
  { value: 'page-of', label: 'Page 1 of 12' },
]

const SIZES = [9, 11, 14]

const faqs = [
  {
    q: 'Does adding page numbers change the text or the images?',
    a: 'No. The number is drawn as a separate text object on top of the existing page. Nothing is re-rendered, re-compressed or flattened, so a scanned page stays a scan and a vector contract stays vector. The only addition is one small line of text per page.',
  },
  {
    q: 'Can I leave the cover page unnumbered?',
    a: 'Yes — tick “Skip the first page”. The cover is left blank but still counted, so the second page shows 2, which is what a reader expects when they flip to it. If you would rather restart the count after the cover, set “Start at” to 1 with the cover skipped.',
  },
  {
    q: 'What do I do if the pages already have numbers?',
    a: 'Place the new number in the opposite corner and check the first few pages before printing. QuietKit does not erase existing content, so two numbers on one page means choosing a different corner — bottom centre against a bottom-right number, for example.',
  },
  {
    q: 'Which font and size do you use?',
    a: 'Helvetica, one of the fourteen standard PDF fonts, at 9, 11 or 14 pt. Standard fonts are embedded by every viewer, so the file stays small and the number prints at the size you picked. The gap from the paper edge is 24 pt, about 8.5 mm — inside the unprintable margin of most printers.',
  },
  {
    q: 'Is my PDF uploaded while the numbers are added?',
    a: 'No. The file is read into this tab, one text object per page is written in memory, and a new copy is handed to your download folder. Nothing is transmitted, so contracts, medical records and ID scans stay on your device.',
  },
]

export function PdfPageNumbers() {
  useSeo({
    ...routeMeta('/tools/pdf-page-numbers'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit PDF Page Numbers',
          'Add page numbers to a PDF — choose the corner, the format and the starting number, with a live preview, entirely in the browser.',
          '/tools/pdf-page-numbers',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<PdfPreview | null>(null)
  const [previewBox, setPreviewBox] = useState({
    width: 0,
    height: 0,
    pageWidth: 0,
    pageHeight: 0,
  })
  const [displayWidth, setDisplayWidth] = useState(0)
  const [vertical, setVertical] = useState<'bottom' | 'top'>('bottom')
  const [align, setAlign] = useState<'left' | 'center' | 'right'>('center')
  const [format, setFormat] = useState<PageNumberFormat>('slash')
  const [startInput, setStartInput] = useState('1')
  const [fontSize, setFontSize] = useState(11)
  const [skipFirst, setSkipFirst] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PageNumberResult | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewRef = useRef<PdfPreview | null>(null)
  const renderSeq = useRef(0)

  const pageCount = preview?.pageCount ?? null
  const start = Math.max(1, Math.min(9999, Number.parseInt(startInput, 10) || 1))
  const position = `${vertical}-${align}` as PageNumberPosition
  const previewPage = skipFirst ? Math.min(2, pageCount ?? 2) : 1
  const totalLabel = pageCount === null ? 12 : start - 1 + pageCount

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
      .render(previewPage, canvas, PREVIEW_WIDTH, PREVIEW_HEIGHT)
      .then((box) => {
        if (mine === renderSeq.current) setPreviewBox(box)
      })
      .catch(() => {
        if (mine === renderSeq.current) {
          setError('Could not preview this PDF. It may be password-protected or damaged.')
        }
      })
  }, [preview, previewPage])

  // The canvas is capped at the panel width on narrow screens, so the label
  // has to be sized against the width it is actually displayed at.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || previewBox.pageWidth === 0) return
    const measure = () => setDisplayWidth(canvas.getBoundingClientRect().width)
    const observer = new ResizeObserver(measure)
    observer.observe(canvas)
    measure()
    return () => observer.disconnect()
  }, [previewBox.pageWidth, file])

  const pick = async (files: File[]) => {
    const pdf = files.find(
      (entry) => entry.type === 'application/pdf' || /\.pdf$/i.test(entry.name),
    )
    if (!pdf) return

    renderSeq.current += 1
    previewRef.current?.destroy()
    previewRef.current = null
    setPreview(null)
    setPreviewBox({ width: 0, height: 0, pageWidth: 0, pageHeight: 0 })
    setFile(pdf)
    setResult(null)
    setError(null)

    try {
      const next = await openPdfPreview(pdf)
      previewRef.current = next
      setPreview(next)
    } catch {
      setError('This PDF could not be opened. It may be encrypted or damaged.')
    }
  }

  const reset = () => {
    renderSeq.current += 1
    previewRef.current?.destroy()
    previewRef.current = null
    setFile(null)
    setPreview(null)
    setPreviewBox({ width: 0, height: 0, pageWidth: 0, pageHeight: 0 })
    setResult(null)
    setError(null)
    setStartInput('1')
    setSkipFirst(false)
  }

  const touch = () => setResult(null)

  const apply = async () => {
    if (!file || pageCount === null) return
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      const { stampPageNumbers } = await import('../lib/pdf')
      const stamped = await stampPageNumbers(file, {
        position,
        format,
        start,
        fontSize,
        skipFirst,
      })
      setResult(stamped)
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Could not add page numbers to this PDF. It may be damaged or restricted.',
      )
    } finally {
      setBusy(false)
    }
  }

  const download = () => {
    if (!result || !file) return
    downloadBlob(result.blob, `${baseName(file.name)}-numbered.pdf`)
  }

  const label =
    format === 'plain'
      ? `${start + previewPage - 1}`
      : format === 'slash'
        ? `${start + previewPage - 1} / ${totalLabel}`
        : `Page ${start + previewPage - 1} of ${totalLabel}`

  const scale =
    previewBox.pageWidth > 0
      ? (displayWidth || previewBox.width) / previewBox.pageWidth
      : 0
  // A page number is genuinely small on paper; on a thumbnail it would be a
  // speck, so the preview keeps it at least 10px tall.
  const sizePx = Math.max(10, fontSize * scale)
  const insetX = `${(PAGE_NUMBER_EDGE / previewBox.pageWidth) * 100}%`
  const insetY = `${(PAGE_NUMBER_EDGE / previewBox.pageHeight) * 100}%`
  const verticalShift = vertical === 'bottom' ? '20%' : '-18%'
  const labelStyle: CSSProperties = {
    position: 'absolute',
    color: '#21211d',
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSize: sizePx,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    ...(align === 'center'
      ? { left: '50%', transform: `translate(-50%, ${verticalShift})` }
      : align === 'left'
        ? { left: insetX, transform: `translateY(${verticalShift})` }
        : { right: insetX, transform: `translateY(${verticalShift})` }),
    ...(vertical === 'bottom' ? { bottom: insetY } : { top: insetY }),
  }

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Documents</span>
          <h1>Add page numbers to a PDF, on your own machine</h1>
          <p>
            Pick a corner, a format and a starting number, then check the live preview before you
            commit. The pages are never re-rendered, and the file never leaves this tab.
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
                hint="One file · numbers are drawn on top, pages stay as they are"
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

                <div style={{ textAlign: 'center' }}>
                  <div className="pdf-preview">
                    <canvas ref={canvasRef} aria-label={`Preview of page ${previewPage}`} />
                    {previewBox.width > 0 && (
                      <span className="stamp-preview-label" style={labelStyle} aria-hidden="true">
                        {label}
                      </span>
                    )}
                  </div>
                </div>
                <p className="small muted" style={{ marginTop: 8 }}>
                  Live preview of page {previewPage} of {pageCount ?? '…'} — the number sits where
                  it will sit in the download. On a narrow screen it is drawn a little larger so you
                  can read it.
                </p>

                <div className="controls">
                  <div className="field">
                    <span className="field-label">Where</span>
                    <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
                      <div className="segmented">
                        <button
                          aria-pressed={vertical === 'bottom'}
                          onClick={() => {
                            setVertical('bottom')
                            touch()
                          }}
                        >
                          Bottom
                        </button>
                        <button
                          aria-pressed={vertical === 'top'}
                          onClick={() => {
                            setVertical('top')
                            touch()
                          }}
                        >
                          Top
                        </button>
                      </div>
                      <div className="segmented">
                        <button
                          aria-pressed={align === 'left'}
                          onClick={() => {
                            setAlign('left')
                            touch()
                          }}
                        >
                          Left
                        </button>
                        <button
                          aria-pressed={align === 'center'}
                          onClick={() => {
                            setAlign('center')
                            touch()
                          }}
                        >
                          Centre
                        </button>
                        <button
                          aria-pressed={align === 'right'}
                          onClick={() => {
                            setAlign('right')
                            touch()
                          }}
                        >
                          Right
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="field">
                    <span className="field-label">Number format</span>
                    <div className="segmented">
                      {FORMATS.map((option) => (
                        <button
                          key={option.value}
                          aria-pressed={format === option.value}
                          onClick={() => {
                            setFormat(option.value)
                            touch()
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="row" style={{ gap: 18, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div className="field" style={{ maxWidth: 130 }}>
                      <label htmlFor="start-number">Start at</label>
                      <input
                        id="start-number"
                        type="number"
                        min={1}
                        max={9999}
                        value={startInput}
                        onChange={(event) => {
                          setStartInput(event.target.value)
                          touch()
                        }}
                        onBlur={() => setStartInput(`${start}`)}
                      />
                    </div>

                    <div className="field">
                      <span className="field-label">Font size</span>
                      <div className="segmented">
                        {SIZES.map((option) => (
                          <button
                            key={option}
                            aria-pressed={fontSize === option}
                            onClick={() => {
                              setFontSize(option)
                              touch()
                            }}
                          >
                            {option} pt
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <label className="checkline">
                    <input
                      type="checkbox"
                      checked={skipFirst}
                      onChange={(event) => {
                        setSkipFirst(event.target.checked)
                        touch()
                      }}
                    />
                    Skip the first page (cover) — numbering still counts it
                  </label>
                </div>

                {error && (
                  <div className="notice notice-error" style={{ marginTop: 16 }}>
                    {error}
                  </div>
                )}

                <div className="row" style={{ marginTop: 20, justifyContent: 'space-between' }}>
                  <button
                    className="btn btn-forest"
                    onClick={apply}
                    disabled={busy || pageCount === null}
                  >
                    {busy ? 'Numbering locally…' : 'Add page numbers'}
                  </button>
                  {result && (
                    <button className="btn" onClick={download}>
                      <DownloadIcon size={16} /> Download ({formatBytes(result.blob.size)})
                    </button>
                  )}
                </div>

                {result && (
                  <div className="notice notice-ok" style={{ marginTop: 16 }}>
                    Numbered {result.numbered} of {result.pages} page
                    {result.pages === 1 ? '' : 's'}
                    {result.pages - result.numbered > 0
                      ? ` — ${result.pages - result.numbered} left blank.`
                      : '.'}{' '}
                    The original file is untouched.
                  </div>
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
            <span className="panel-title">Drawn on top, not rebuilt</span>
            <p className="small muted">
              Each number is a single text object added to the page. The existing text, images and
              vectors are copied through untouched, so the file stays as sharp as it arrived.
            </p>
            <div className="row" style={{ marginTop: 14 }}>
              <LockIcon size={16} /> <span className="small">0 bytes uploaded</span>
            </div>
          </div>

          <div className="panel">
            <span className="panel-title">Related</span>
            <ul
              className="stack-sm"
              style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}
            >
              <li>
                <Link to="/tools/pdf-reorder" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Fix the page order first
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-rotate" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Straighten a sideways scan
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-remove-pages" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Drop the blank pages
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-merge" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Merge the numbered files
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="section">
        <div className="container-narrow prose">
          <h2>Why add numbers afterwards</h2>
          <p>
            Word, Pages and LaTeX all print page numbers when they create the document — until you
            scan a signed page, drop in a receipt, or merge in a PDF that came back from a client.
            The assembled file then has five pages numbered and six that are not, and anyone
            referring to “the third page of the appendix” is guessing.
          </p>
          <p>
            A stamping pass fixes that in one step without touching the pages themselves. The number
            is added as text on top, which means the scan stays a scan, the contract keeps its
            vector text, and the file does not grow by a re-compression pass.
          </p>

          <h2>Where the number belongs</h2>
          <p>
            Bottom centre is the default because bound documents lose the outer edge to the gutter.
            For a double-sided print, bottom right on odd pages and bottom left on even pages keeps
            the number on the outside edge — choose one side, print, then run the file a second time
            with the other side. Top right is the convention for technical documents and legal
            exhibits, where a reader may be holding a single extracted page.
          </p>
          <p>
            The gap from the paper edge here is 24 pt, about 8.5 mm. That sits inside the
            unprintable margin of almost every inkjet and laser printer, so the number will not be
            clipped even when the printer refuses to print to the edge.
          </p>

          <h2>Formats that mean something</h2>
          <p>
            A bare <code>7</code> is the cleanest choice for a document that will be bound and read
            front to back. <code>7 / 24</code> tells a reader how much is left, which matters for a
            long report someone may print. <code>Page 7 of 24</code> is the clearest when a single
            page might be photocopied or faxed on its own, because the words survive being separated
            from the rest of the file.
          </p>
          <p>
            If your document starts with a cover, tick “Skip the first page”. The cover stays clean
            but the count does not restart, so the first printed number is 2 — a reader who flips the
            cover sees 1 behind them, not a mystery gap.
          </p>

          <h2>Before you print</h2>
          <ul>
            <li>Scroll through the preview, then open the download and check the first, middle and last page.</li>
            <li>If existing numbers already occupy the corner you chose, move to the opposite one rather than stacking two numbers.</li>
            <li>Print one sheet before committing to 200 copies — it catches printer margins that crop a number you could still move.</li>
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
