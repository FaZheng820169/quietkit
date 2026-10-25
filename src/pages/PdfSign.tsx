import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Dropzone } from '../components/Dropzone'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, DownloadIcon, FileIcon, LockIcon, TrashIcon } from '../components/Icons'
import { openPdfPreview, type PdfPreview } from '../lib/pdfjs'
import { trimSignatureCanvas } from '../lib/signaturePad'
import type { SignPlacement, SignResult } from '../lib/pdfSign'
import { baseName, downloadBlob, formatBytes } from '../lib/files'
import { ENCRYPTED_PDF_HELP } from '../lib/pdfErrors'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const PREVIEW_WIDTH = 620
const PREVIEW_HEIGHT = 640

const PAD_WIDTH = 520
const PAD_HEIGHT = 180

const INKS = [
  { value: '#15151f', label: 'Black' },
  { value: '#1c3faa', label: 'Blue' },
]

const TYPE_FONTS = [
  { value: "'Segoe Script', 'Brush Script MT', cursive", label: 'Script' },
  { value: "'Snell Roundhand', 'Apple Chancery', cursive", label: 'Round' },
  { value: "Georgia, 'Times New Roman', serif", label: 'Serif', italic: true },
]

const faqs = [
  {
    q: 'Is a signature drawn in a browser legally valid?',
    a: 'In most of the world, yes for ordinary agreements. The US ESIGN Act, the EU eIDAS regulation and similar laws elsewhere accept electronic signatures for everyday contracts — offers, NDAs, freelance agreements, approvals. What they do not cover are the exceptions written into statute: wills, property deeds and some court filings still demand wet ink or a witnessed process. When the stakes are high, ask the other party what they accept.',
  },
  {
    q: 'What is the difference between this and a digital signature?',
    a: 'This tool places an image of your signature on the page — an electronic signature, the everyday kind. A digital signature is a cryptographic operation that binds the document to a certificate and breaks visibly if a byte changes afterwards. QuietKit does the first; banks and government portals that ask for the second will say so explicitly.',
  },
  {
    q: 'Should I draw the signature or type my name?',
    a: 'Draw it if you can — a drawn mark looks like you, and a trackpad or touchscreen is accurate enough for the purpose. Typed names in a script font are accepted just as widely in practice; pick whichever the recipient is used to seeing from you. Blue ink reads as a signature on a printout; black disappears into the text.',
  },
  {
    q: 'Does signing flatten the PDF or change the pages?',
    a: 'No. The signature is one image drawn on top of each page you choose. The original text, scans, links and form fields underneath are copied through untouched — nothing is re-rendered or re-compressed. If the PDF has fillable fields, fill them in first with the form tool, then sign last.',
  },
  {
    q: 'Is my signed document uploaded anywhere?',
    a: 'No. The PDF is read into this tab, the signature you draw never leaves the page, and the stamped copy is assembled in memory and handed straight to your download folder. Open the Network panel while you sign: no request carries the document or the signature.',
  },
]

export function PdfSign() {
  useSeo({
    ...routeMeta('/tools/pdf-sign'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit PDF Sign',
          'Draw or type a signature and place it on any page of a PDF, entirely in the browser. Nothing is uploaded.',
          '/tools/pdf-sign',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<PdfPreview | null>(null)
  const [previewBox, setPreviewBox] = useState({ width: 0, height: 0, pageWidth: 0, pageHeight: 0 })
  const [page, setPage] = useState(1)
  const [placements, setPlacements] = useState<SignPlacement[]>([])
  const [widthPt, setWidthPt] = useState(140)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SignResult | null>(null)

  const [mode, setMode] = useState<'draw' | 'type'>('draw')
  const [ink, setInk] = useState(INKS[1].value)
  const [typed, setTyped] = useState('')
  const [typeFont, setTypeFont] = useState(0)
  const [signature, setSignature] = useState<{ blob: Blob; url: string; aspect: number } | null>(
    null,
  )

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const padRef = useRef<HTMLCanvasElement>(null)
  const previewRef = useRef<PdfPreview | null>(null)
  const renderSeq = useRef(0)
  const drawing = useRef(false)

  const pageCount = preview?.pageCount ?? null
  const scale = previewBox.pageWidth > 0 ? previewBox.width / previewBox.pageWidth : 0

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
      .render(page, canvas, PREVIEW_WIDTH, PREVIEW_HEIGHT)
      .then((box) => {
        if (mine === renderSeq.current) setPreviewBox(box)
      })
      .catch(() => {
        if (mine === renderSeq.current) {
          setError('Could not preview this PDF. It may be password-protected or damaged.')
        }
      })
  }, [preview, page])

  // Set up (or re-render) the signature pad whenever the tab or inputs change.
  useEffect(() => {
    const pad = padRef.current
    if (!pad) return
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    pad.width = PAD_WIDTH * ratio
    pad.height = PAD_HEIGHT * ratio
    const ctx = pad.getContext('2d')
    if (!ctx) return
    ctx.scale(ratio, ratio)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 3
    if (mode === 'type' && typed.trim()) {
      const spec = TYPE_FONTS[typeFont]
      let size = 64
      ctx.font = `${spec.italic ? 'italic ' : ''}${size}px ${spec.value}`
      const measured = ctx.measureText(typed.trim()).width
      if (measured > PAD_WIDTH - 40) {
        size = Math.max(18, Math.floor((size * (PAD_WIDTH - 40)) / measured))
        ctx.font = `${spec.italic ? 'italic ' : ''}${size}px ${spec.value}`
      }
      ctx.fillStyle = ink
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(typed.trim(), PAD_WIDTH / 2, PAD_HEIGHT / 2)
    }
    // mode is a dependency: switching tabs mounts a fresh pad
  }, [mode, typed, typeFont, ink])

  const padPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * PAD_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * PAD_HEIGHT,
    }
  }

  const strokeStart = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = event.currentTarget.getContext('2d')
    if (!ctx) return
    drawing.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
    const point = padPoint(event)
    ctx.strokeStyle = ink
    ctx.beginPath()
    ctx.moveTo(point.x, point.y)
    ctx.lineTo(point.x + 0.01, point.y + 0.01)
    ctx.stroke()
  }

  const strokeMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    const ctx = event.currentTarget.getContext('2d')
    if (!ctx) return
    const point = padPoint(event)
    ctx.lineTo(point.x, point.y)
    ctx.stroke()
  }

  const strokeEnd = () => {
    drawing.current = false
  }

  const clearPad = () => {
    const pad = padRef.current
    const ctx = pad?.getContext('2d')
    if (!pad || !ctx) return
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, pad.width, pad.height)
    ctx.restore()
  }

  const useSignature = async () => {
    const pad = padRef.current
    if (!pad) return
    const blob = await trimSignatureCanvas(pad)
    if (!blob) {
      setError(mode === 'draw' ? 'Draw your signature first.' : 'Type your name first.')
      return
    }
    setError(null)
    if (signature) URL.revokeObjectURL(signature.url)
    const url = URL.createObjectURL(blob)
    const image = new Image()
    image.onload = () => {
      setSignature({ blob, url, aspect: image.naturalWidth / image.naturalHeight })
    }
    image.src = url
  }

  const discardSignature = () => {
    if (signature) URL.revokeObjectURL(signature.url)
    setSignature(null)
  }

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
    setPage(1)
    setPlacements([])
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
    setPlacements([])
    setResult(null)
    setError(null)
    setPage(1)
  }

  const placeAt = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!signature || !file) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height
    if (x < 0 || x > 1 || y < 0 || y > 1) return
    setPlacements((prev) => [...prev, { page, x, y }])
    setResult(null)
  }

  const signEveryPage = () => {
    if (!signature || pageCount === null) return
    const spot = placements.filter((p) => p.page === page).at(-1) ?? { page, x: 0.72, y: 0.86 }
    const next: SignPlacement[] = []
    for (let n = 1; n <= pageCount; n += 1) {
      next.push({ page: n, x: spot.x, y: spot.y })
    }
    setPlacements(next)
    setResult(null)
  }

  const removePlacement = (index: number) => {
    setPlacements((prev) => prev.filter((_, i) => i !== index))
    setResult(null)
  }

  const apply = async () => {
    if (!file || !signature || placements.length === 0) return
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      const { signPdf } = await import('../lib/pdfSign')
      const stamped = await signPdf(file, signature.blob, placements, widthPt)
      setResult(stamped)
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Could not sign this PDF. It may be damaged or restricted.',
      )
    } finally {
      setBusy(false)
    }
  }

  const download = () => {
    if (!result || !file) return
    downloadBlob(result.blob, `${baseName(file.name)}-signed.pdf`)
  }

  const placementsOnPage = placements
    .map((p, index) => ({ ...p, index }))
    .filter((p) => p.page === page)

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Documents</span>
          <h1>Sign a PDF without uploading it</h1>
          <p>
            Draw your signature or type your name, click where it belongs on the page, and download
            a signed copy. The document never leaves this tab — no account, no server, no copy
            kept anywhere.
          </p>
        </div>
      </section>

      <div className="container workspace">
        <div>
          <div className="panel">
            <span className="panel-title">1 · Make your signature</span>
            {signature ? (
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span
                  className="row"
                  style={{ gap: 12, background: 'var(--paper-2)', padding: '8px 14px' }}
                >
                  <img
                    src={signature.url}
                    alt="Your signature"
                    style={{ height: 40, maxWidth: 200 }}
                  />
                  <span className="small muted">Ready — click the page preview to place it.</span>
                </span>
                <button className="btn btn-sm" onClick={discardSignature}>
                  <TrashIcon size={14} /> Redo
                </button>
              </div>
            ) : (
              <>
                <div className="row" style={{ gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                  <div className="segmented">
                    <button aria-pressed={mode === 'draw'} onClick={() => setMode('draw')}>
                      Draw
                    </button>
                    <button aria-pressed={mode === 'type'} onClick={() => setMode('type')}>
                      Type
                    </button>
                  </div>
                  <div className="segmented">
                    {INKS.map((option) => (
                      <button
                        key={option.value}
                        aria-pressed={ink === option.value}
                        onClick={() => setInk(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {mode === 'type' && (
                    <div className="segmented">
                      {TYPE_FONTS.map((option, index) => (
                        <button
                          key={option.label}
                          aria-pressed={typeFont === index}
                          onClick={() => setTypeFont(index)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {mode === 'type' && (
                  <div className="field" style={{ maxWidth: 320, marginBottom: 12 }}>
                    <label htmlFor="typed-name">Your name</label>
                    <input
                      id="typed-name"
                      type="text"
                      value={typed}
                      placeholder="Ada Lovelace"
                      onChange={(event) => setTyped(event.target.value)}
                    />
                  </div>
                )}

                <canvas
                  ref={padRef}
                  className="sign-pad"
                  style={{ width: '100%', maxWidth: PAD_WIDTH, height: PAD_HEIGHT }}
                  onPointerDown={mode === 'draw' ? strokeStart : undefined}
                  onPointerMove={mode === 'draw' ? strokeMove : undefined}
                  onPointerUp={mode === 'draw' ? strokeEnd : undefined}
                  onPointerLeave={mode === 'draw' ? strokeEnd : undefined}
                />
                <p className="small muted" style={{ marginTop: 6 }}>
                  {mode === 'draw'
                    ? 'Sign with a mouse, trackpad, finger or stylus. Transparent background — only the ink is stamped.'
                    : 'A script style is pre-selected; switch fonts or ink above. The typed name is rendered locally.'}
                </p>

                <div className="row" style={{ marginTop: 12, gap: 10 }}>
                  <button className="btn btn-forest" onClick={useSignature}>
                    <CheckIcon size={15} /> Use this signature
                  </button>
                  {mode === 'draw' && (
                    <button className="btn btn-sm" onClick={clearPad}>
                      Clear
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="panel" style={{ marginTop: 20 }}>
            <span className="panel-title">2 · Place it on the document</span>
            {!file ? (
              <Dropzone
                accept="application/pdf,.pdf"
                title="Drop a PDF here, or click to choose"
                hint="One file · the signature is drawn on top, pages stay as they are"
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

                {pageCount !== null && pageCount > 1 && (
                  <div className="row" style={{ justifyContent: 'center', gap: 10, margin: '10px 0' }}>
                    <button
                      className="btn btn-sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      ← Previous
                    </button>
                    <span className="small muted" style={{ alignSelf: 'center' }}>
                      Page {page} of {pageCount}
                    </span>
                    <button
                      className="btn btn-sm"
                      disabled={page >= pageCount}
                      onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                    >
                      Next →
                    </button>
                  </div>
                )}

                <div style={{ textAlign: 'center' }}>
                  <div
                    className="pdf-preview sign-preview"
                    onClick={placeAt}
                    style={{ cursor: signature ? 'crosshair' : 'default' }}
                  >
                    <canvas ref={canvasRef} aria-label={`Preview of page ${page}`} />
                    {previewBox.width > 0 &&
                      signature &&
                      placementsOnPage.map((p) => (
                        <img
                          key={p.index}
                          src={signature.url}
                          alt=""
                          aria-hidden="true"
                          style={{
                            position: 'absolute',
                            left: `${p.x * 100}%`,
                            top: `${p.y * 100}%`,
                            transform: 'translate(-50%, -50%)',
                            width: Math.max(24, widthPt * scale),
                            pointerEvents: 'none',
                          }}
                        />
                      ))}
                  </div>
                </div>
                <p className="small muted" style={{ marginTop: 8 }}>
                  {signature
                    ? 'Click the page to place the signature — click again to add another copy.'
                    : 'Make the signature in step 1, then click here to place it.'}
                </p>

                <div className="controls">
                  <div className="field">
                    <label htmlFor="sign-size">Signature size — {widthPt} pt wide</label>
                    <input
                      id="sign-size"
                      type="range"
                      min={70}
                      max={240}
                      step={5}
                      value={widthPt}
                      onChange={(event) => {
                        setWidthPt(Number(event.target.value))
                        setResult(null)
                      }}
                    />
                  </div>

                  <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-sm"
                      onClick={signEveryPage}
                      disabled={!signature || pageCount === null || pageCount < 2}
                    >
                      Repeat on every page
                    </button>
                    {placements.length > 0 && (
                      <button
                        className="btn btn-sm"
                        onClick={() => {
                          setPlacements([])
                          setResult(null)
                        }}
                      >
                        Remove all placements
                      </button>
                    )}
                  </div>

                  {placements.length > 0 && (
                    <ul
                      className="stack-sm"
                      style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}
                    >
                      {placements.map((p, index) => (
                        <li key={index} className="row placement-row" style={{ gap: 8 }}>
                          <CheckIcon size={14} />
                          <span>
                            Page {p.page} · {Math.round(p.x * 100)}% across, {Math.round(p.y * 100)}%
                            down
                          </span>
                          <button
                            className="btn btn-sm"
                            onClick={() => removePlacement(index)}
                            aria-label={`Remove placement on page ${p.page}`}
                          >
                            <TrashIcon size={13} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
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
                    disabled={busy || !signature || placements.length === 0}
                  >
                    {busy ? 'Signing locally…' : 'Sign the PDF'}
                  </button>
                  {result && (
                    <button className="btn" onClick={download}>
                      <DownloadIcon size={16} /> Download ({formatBytes(result.blob.size)})
                    </button>
                  )}
                </div>

                {result && (
                  <div className="notice notice-ok" style={{ marginTop: 16 }}>
                    Signed {result.signed} page{result.signed === 1 ? '' : 's'} with{' '}
                    {placements.length} placement{placements.length === 1 ? '' : 's'}. The original
                    file is untouched.
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
            <span className="panel-title">An image on top, not a rebuild</span>
            <p className="small muted">
              The signature is a transparent PNG stamped onto the pages you pick. Text stays
              selectable, scans stay sharp, and form fields survive underneath.
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
                <Link to="/tools/pdf-form-fill" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Fill the form fields first
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-page-numbers" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Number the signed pages
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-metadata" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Strip the metadata before sending
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-compress" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Shrink the signed copy
                </Link>
              </li>
              <li>
                <Link to="/guides/sign-pdf-without-upload" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Guide: sign a PDF properly
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="section">
        <div className="container-narrow prose">
          <h2>Why signing a PDF usually means uploading it</h2>
          <p>
            Search for “sign a PDF” and the first results all work the same way: the document goes
            to a server, you draw on a picture of it, and a signed copy comes back. That is fine
            for a pizza loyalty form. It is a strange habit for an employment contract, a rental
            agreement or a medical release — documents that exist precisely because they say
            something sensitive about you.
          </p>
          <p>
            The step nobody needs is the upload. Reading a PDF, drawing an image on a page and
            saving the result are all things a browser tab does on its own. QuietKit does exactly
            those three steps and nothing else, so the document — and the signature, which is
            itself biometric-adjacent data — stays on your machine.
          </p>

          <h2>Placing a signature so it looks signed, not pasted</h2>
          <p>
            Size is most of the trick. A signature that spans the full width of the line looks
            stamped by a machine; one that covers about two-thirds of the “Signature” line looks
            written. Start at 140 pt — roughly 5 cm — and adjust against the preview. On a form
            with a printed line, the bottom of the signature should sit on the line, not float
            above it.
          </p>
          <p>
            Blue ink exists for a reason: on a printout, a blue signature is visibly a signature,
            while black can pass for part of the form. If the recipient will print the document,
            blue is the safer habit. If they will only ever see it on screen, either works.
          </p>

          <h2>Sign last, after everything else</h2>
          <p>
            A signature certifies the document as it is, so it belongs on the finished version.
            Fill every field, check every date, fix the page order — then sign. If the PDF has
            fillable form fields, complete them with the form filler first and sign the result.
            Changing a signed document afterwards means signing again, which is exactly what the
            ritual is designed to make noticeable.
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
