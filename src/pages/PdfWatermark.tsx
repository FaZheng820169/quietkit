import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { Dropzone } from '../components/Dropzone'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, DownloadIcon, FileIcon, LockIcon, TrashIcon } from '../components/Icons'
import {
  watermarkSpacing,
  type WatermarkAngle,
  type WatermarkPosition,
  type WatermarkResult,
} from '../lib/pdfLayout'
import { parsePageRanges } from '../lib/ranges'
import { openPdfPreview, type PdfPreview } from '../lib/pdfjs'
import { baseName, downloadBlob, formatBytes } from '../lib/files'
import { ENCRYPTED_PDF_HELP } from '../lib/pdfErrors'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const PREVIEW_WIDTH = 620
const PREVIEW_HEIGHT = 560

const ANGLES: { value: WatermarkAngle; label: string }[] = [
  { value: 45, label: 'Diagonal' },
  { value: 0, label: 'Horizontal' },
  { value: 90, label: 'Vertical' },
]

const SIZES = [24, 36, 48, 64]

const OPACITIES = [
  { value: 0.1, label: '10%' },
  { value: 0.2, label: '20%' },
  { value: 0.35, label: '35%' },
  { value: 0.5, label: '50%' },
]

const faqs = [
  {
    q: 'Is the watermark drawn on top, or does the page get flattened?',
    a: 'It is drawn on top. One text object per mark is added to a page that already exists, so the words, images and vectors underneath are copied through untouched. A scanned page stays a scan, a contract keeps its selectable text, and the file does not pass through an image re-compression step.',
  },
  {
    q: 'Can someone remove the watermark again?',
    a: 'Yes, with a PDF editor that can delete a text object. A watermark is a deterrent and a statement of status — it is not copy protection, and QuietKit does not pretend otherwise. If you need proof of ownership rather than a visible label, a digital signature or a hash of the file does that job properly.',
  },
  {
    q: 'How faint should it be?',
    a: '10% marks the page without competing with the text, which is what a draft or an internal copy needs. 20% is the usual choice for “CONFIDENTIAL”. 35% and 50% are for pages that will be photographed or copied, where the mark has to survive a bad reproduction. Anything above about 50% starts to hurt readability on dense pages.',
  },
  {
    q: 'What does tiled mean?',
    a: 'Centre places one mark in the middle of the page, which is easy to crop off with a screenshot. Tiled repeats it across the whole sheet on a grid, so any crop of the page still carries part of the mark. The grid is sized from the word length, so a long line repeats less often than a short one.',
  },
  {
    q: 'Is my PDF uploaded while the mark is added?',
    a: 'No. The bytes are read into this tab, the text layer is written in memory, and a new copy is handed to your download folder. Nothing is transmitted, so unpublished manuscripts, invoices and internal reports stay on your device.',
  },
]

type Selection = { pages: number[] | null; error: string | null }

export function PdfWatermark() {
  useSeo({
    ...routeMeta('/tools/pdf-watermark'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit PDF Watermark',
          'Add a text watermark to a PDF — diagonal, horizontal or vertical, centred or tiled, with a live preview. Entirely in the browser.',
          '/tools/pdf-watermark',
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
  const [displayBox, setDisplayBox] = useState({ width: 0, height: 0 })
  const [text, setText] = useState('DRAFT')
  const [angle, setAngle] = useState<WatermarkAngle>(45)
  const [position, setPosition] = useState<WatermarkPosition>('center')
  const [fontSize, setFontSize] = useState(36)
  const [opacity, setOpacity] = useState(0.2)
  const [range, setRange] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<WatermarkResult | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewRef = useRef<PdfPreview | null>(null)
  const renderSeq = useRef(0)

  const pageCount = preview?.pageCount ?? null

  const selection = useMemo<Selection>(() => {
    if (!range.trim() || pageCount === null) return { pages: null, error: null }
    try {
      return { pages: parsePageRanges(range, pageCount), error: null }
    } catch (caught) {
      return {
        pages: [],
        error: caught instanceof Error ? caught.message : 'Check the page range.',
      }
    }
  }, [range, pageCount])

  const previewPage = selection.pages && selection.pages.length > 0 ? selection.pages[0] + 1 : 1
  const previewMarked = !selection.error && (selection.pages === null || selection.pages.includes(previewPage - 1))

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

  // The canvas is capped by the panel width on narrow screens, so the overlay
  // is sized from what is actually on screen rather than from the render size.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || previewBox.pageWidth === 0) return
    const measure = () => {
      const box = canvas.getBoundingClientRect()
      setDisplayBox({ width: box.width, height: box.height })
    }
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
    setDisplayBox({ width: 0, height: 0 })
    setFile(pdf)
    setResult(null)
    setError(null)

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
    setPreviewBox({ width: 0, height: 0, pageWidth: 0, pageHeight: 0 })
    setDisplayBox({ width: 0, height: 0 })
    setResult(null)
    setError(null)
    setRange('')
  }

  const touch = () => setResult(null)

  const apply = async () => {
    if (!file || pageCount === null) return
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      const { stampWatermark } = await import('../lib/pdf')
      const stamped = await stampWatermark(file, {
        text,
        fontSize,
        opacity,
        angle,
        position,
        range,
      })
      setResult(stamped)
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Could not watermark this PDF. It may be damaged or restricted.',
      )
    } finally {
      setBusy(false)
    }
  }

  const download = () => {
    if (!result || !file) return
    downloadBlob(result.blob, `${baseName(file.name)}-watermarked.pdf`)
  }

  const scale =
    previewBox.pageWidth > 0
      ? (displayBox.width || previewBox.width) / previewBox.pageWidth
      : 0
  const markWidth = text.trim() || 'DRAFT'
  const spacing = watermarkSpacing(markWidth, fontSize)
  const sizePx = Math.max(7, fontSize * scale)
  const spacingPx = { x: spacing.x * scale, y: spacing.y * scale }

  // The overlay grid is laid out on a layer twice the canvas size and then
  // rotated, so a diagonal tiling still reaches every corner of the page.
  const layerWidth = displayBox.width * 2
  const layerHeight = displayBox.height * 2
  const tiles = useMemo(() => {
    if (position === 'center') return [{ x: layerWidth / 2, y: layerHeight / 2 }]
    if (layerWidth === 0 || spacingPx.x <= 0 || spacingPx.y <= 0) return []
    const columns = Math.min(24, Math.ceil(layerWidth / spacingPx.x) + 1)
    const rows = Math.min(24, Math.ceil(layerHeight / spacingPx.y) + 1)
    const next: { x: number; y: number }[] = []
    for (let column = 0; column < columns; column += 1) {
      for (let row = 0; row < rows; row += 1) {
        next.push({
          x: (column + 0.5) * spacingPx.x,
          y: (row + 0.5) * spacingPx.y,
        })
      }
    }
    return next
  }, [position, layerWidth, layerHeight, spacingPx.x, spacingPx.y])

  const layerStyle: CSSProperties = {
    position: 'absolute',
    width: layerWidth,
    height: layerHeight,
    left: (displayBox.width - layerWidth) / 2,
    top: (displayBox.height - layerHeight) / 2,
    transform: `rotate(${-angle}deg)`,
    pointerEvents: 'none',
  }

  const markStyle: CSSProperties = {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: 700,
    fontSize: sizePx,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    color: '#20201c',
    opacity,
  }

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Documents</span>
          <h1>Watermark a PDF, on your own machine</h1>
          <p>
            Type the mark, choose how faint and how slanted it sits, and check the page before you
            download. It is added as a text layer — the pages underneath are never re-rendered, and
            the file never leaves this tab.
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
                hint="One file · the mark is drawn on top, pages stay as they are"
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
                    {previewBox.width > 0 && displayBox.width > 0 && previewMarked && (
                      <div className="watermark-layer" style={layerStyle} aria-hidden="true">
                        {tiles.map((tile, index) => (
                          <span
                            key={`${tile.x}-${tile.y}-${index}`}
                            style={{ ...markStyle, left: tile.x, top: tile.y }}
                          >
                            {markWidth}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <p className="small muted" style={{ marginTop: 8 }}>
                  Live preview of page {previewPage} of {pageCount ?? '…'} — this is where the mark
                  lands in the download. Opacity and size are shown to scale.
                </p>

                <div className="controls">
                  <div className="field">
                    <label htmlFor="watermark-text">Watermark text</label>
                    <input
                      id="watermark-text"
                      type="text"
                      maxLength={80}
                      value={text}
                      onChange={(event) => {
                        setText(event.target.value)
                        touch()
                      }}
                      placeholder="e.g. CONFIDENTIAL"
                      autoComplete="off"
                    />
                    <p className="small muted" style={{ marginTop: 8 }}>
                      One short line works best — a date or a company name is harder to crop off
                      than a single generic word.
                    </p>
                  </div>

                  <div className="row" style={{ gap: 18, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <div className="field">
                      <span className="field-label">Placement</span>
                      <div className="segmented">
                        <button
                          aria-pressed={position === 'center'}
                          onClick={() => {
                            setPosition('center')
                            touch()
                          }}
                        >
                          Centre
                        </button>
                        <button
                          aria-pressed={position === 'tile'}
                          onClick={() => {
                            setPosition('tile')
                            touch()
                          }}
                        >
                          Tiled
                        </button>
                      </div>
                    </div>

                    <div className="field">
                      <span className="field-label">Angle</span>
                      <div className="segmented">
                        {ANGLES.map((option) => (
                          <button
                            key={option.value}
                            aria-pressed={angle === option.value}
                            onClick={() => {
                              setAngle(option.value)
                              touch()
                            }}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="row" style={{ gap: 18, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <div className="field">
                      <span className="field-label">Size</span>
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

                    <div className="field">
                      <span className="field-label">Opacity</span>
                      <div className="segmented">
                        {OPACITIES.map((option) => (
                          <button
                            key={option.value}
                            aria-pressed={opacity === option.value}
                            onClick={() => {
                              setOpacity(option.value)
                              touch()
                            }}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="watermark-range">Pages</label>
                    <input
                      id="watermark-range"
                      type="text"
                      value={range}
                      onChange={(event) => {
                        setRange(event.target.value)
                        touch()
                      }}
                      placeholder="All pages — or 1-3, 7"
                      autoComplete="off"
                    />
                    <p className="small muted" style={{ marginTop: 8 }}>
                      Leave this empty to mark every page. Use a range to keep a signed page or a
                      cover clean.
                    </p>
                    {selection.error && (
                      <p className="small" style={{ marginTop: 6, color: 'var(--danger)' }}>
                        {selection.error}
                      </p>
                    )}
                  </div>
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
                    disabled={
                      busy ||
                      pageCount === null ||
                      text.trim().length === 0 ||
                      selection.error !== null
                    }
                  >
                    {busy ? 'Stamping locally…' : 'Add the watermark'}
                  </button>
                  {result && (
                    <button className="btn" onClick={download}>
                      <DownloadIcon size={16} /> Download ({formatBytes(result.blob.size)})
                    </button>
                  )}
                </div>

                {result && (
                  <div className="notice notice-ok" style={{ marginTop: 16 }}>
                    Marked {result.marked} of {result.pages} page{result.pages === 1 ? '' : 's'}.
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
            <span className="panel-title">A text layer, not a picture</span>
            <p className="small muted">
              The mark is real text in the PDF, so it stays sharp at any zoom and costs almost
              nothing in file size. It is not baked into the page image.
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
                <Link to="/guides/watermark-pdf-without-upload" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Read the full guide
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-page-numbers" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Add page numbers as well
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-metadata" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Strip the author before sending
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-remove-pages" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Pull out the pages you need
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-merge" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Merge a marked copy with the rest
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="section">
        <div className="container-narrow prose">
          <h2>What a watermark actually does</h2>
          <p>
            A watermark states a status on the page itself: this is a draft, this is confidential,
            this copy belongs to a review on a certain date. It travels with the file when it is
            opened somewhere else, printed, or photographed off a screen — which is exactly where
            a header in an email fails to follow.
          </p>
          <p>
            It is not copy protection. The mark added here is a text object, and anyone with a PDF
            editor can select and delete it. What it does do is make casual reuse awkward and make
            the status of a page obvious at a glance, without locking the document for the readers
            who are supposed to have it.
          </p>

          <h2>Choosing an opacity you can live with</h2>
          <p>
            The mark sits on top of the body text, so its job is to be seen without being read
            instead of the page. Around 10% it registers as a label in the margin of attention and
            leaves every word underneath legible; that is the right setting for an internal review
            copy. Twenty percent is where “CONFIDENTIAL” still reads on a printed page from a metre
            away.
          </p>
          <p>
            Higher settings are for copies that will be rephotographed, faxed or scanned again,
            where contrast survives badly. Past roughly 50%, dense paragraphs start to fight the
            mark, and a reader ends up straining. If you need the page to remain perfectly readable
            and the mark to remain, put it in a corner at a small size instead of turning up the
            opacity.
          </p>

          <h2>Centre or tiled</h2>
          <p>
            One mark in the middle is the cleanest looking option and the one most people mean by
            “watermark”. Its weakness is a crop: a screenshot of the top half of the page contains
            no mark at all. Tiled repeats the same text on a grid, so any fragment of the page still
            carries part of it. The trade is legibility — a tiled page is busier — so tiled suits
            reference sheets and previews, while a centred mark suits documents that are read in
            full.
          </p>
          <p>
            A diagonal mark is harder to crop around than a horizontal one and is the convention for
            drafts. Horizontal works better where the mark has to sit in a clear band, such as above
            a title. Vertical is rare, but it fits a narrow table column or a form printed in
            landscape.
          </p>

          <h2>Pages that should stay clean</h2>
          <p>
            Marking every page is usually right, but a signature page, a cover, or an exhibit that
            will be filed elsewhere often has to stay untouched. Put a range such as{' '}
            <code>1-4, 7-</code> in the Pages field and the rest is left exactly as it arrived.
            The preview follows the first page in your range, so you can see what will actually be
            stamped rather than always looking at page one.
          </p>

          <h2>Before you send it</h2>
          <ul>
            <li>Open the download and check the first and last marked page, not just the preview.</li>
            <li>Confirm the mark does not cover a signature, a stamp or a barcode you need to keep.</li>
            <li>If the file is also going to a client, send the clean original from your own copy — the marked PDF here is a separate file, never an edit in place.</li>
            <li>For anything that needs proof of origin rather than a label, use a signature or a checksum instead of a visible mark.</li>
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
