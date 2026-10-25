import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Dropzone } from '../components/Dropzone'
import { AdSlot } from '../components/AdSlot'
import {
  CheckIcon,
  DownloadIcon,
  ImageIcon,
  LockIcon,
  PlusIcon,
  ShieldIcon,
  TrashIcon,
} from '../components/Icons'
import { baseName, downloadBlob, formatBytes } from '../lib/files'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'Are my images uploaded for recognition?',
    a: 'No. The photo is decoded in this tab and read by Tesseract — an OCR engine compiled to WebAssembly that runs on your device. The engine, its language data and your image never leave the browser. Open the Network tab in dev tools and run a recognition: no request carries your file.',
  },
  {
    q: 'Which languages are supported?',
    a: 'English for now. Recognising English text keeps the language data small enough (about 3 MB) to download once and cache. More languages may follow, each with the same guarantee: downloaded from this site, cached, never an upload.',
  },
  {
    q: 'What kind of images work best?',
    a: 'Screenshots, scanned pages and photos of printed text in good light work well. Handwriting, heavy perspective, low contrast and decorative fonts reliably confuse any OCR engine — this one included. If the result looks scrambled, crop tighter or straighten the photo and try again.',
  },
  {
    q: 'Is the extracted text perfect?',
    a: 'No OCR is. Expect clean results on crisp documents, and expect to proofread numbers, punctuation and unusual names. Confidence is highest on dark text on a light background at 300 DPI or better.',
  },
  {
    q: 'Is there a file or size limit?',
    a: 'No fixed limit. Each image is recognised in turn on your own device, so the ceiling is your hardware, not a plan. Large photos are downscaled in memory before recognition to keep things fast.',
  },
]

type Item = {
  id: string
  file: File
  state: 'queued' | 'reading' | 'done' | 'error'
  stage?: string
  ratio?: number
  text?: string
  note?: string
}

export function ImageOcr() {
  useSeo({
    ...routeMeta('/tools/image-ocr'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit Image OCR',
          'Extract text from photos and screenshots with OCR that runs entirely in the browser — no uploads, no accounts.',
          '/tools/image-ocr',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [items, setItems] = useState<Item[]>([])
  const [running, setRunning] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current)
    }
  }, [])

  const update = (id: string, patch: Partial<Item>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  const addFiles = (files: File[]) => {
    const additions: Item[] = files
      .filter((file) => file.type.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(file.name))
      .map((file) => ({
        id: `${file.name}-${file.size}-${Math.random()}`,
        file,
        state: 'queued',
      }))
    setItems((prev) => [...prev, ...additions])
  }

  const remove = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const run = async () => {
    if (running) return
    setRunning(true)
    // tesseract.js stays out of the main bundle; it loads on the first run.
    const { recognizeText, friendlyOcrError } = await import('../lib/ocr')
    const queue = items.filter((item) => item.state === 'queued' || item.state === 'error')
    for (const item of queue) {
      update(item.id, { state: 'reading', stage: 'loading engine', ratio: 0, note: undefined })
      try {
        const text = await recognizeText(item.file, (p) =>
          update(item.id, { stage: p.stage, ratio: p.ratio }),
        )
        update(item.id, {
          state: 'done',
          text,
          note: text ? undefined : 'No text found — try a sharper or more upright image',
        })
      } catch (caught) {
        update(item.id, { state: 'error', note: friendlyOcrError(caught) })
      }
    }
    setRunning(false)
  }

  const copyText = async (item: Item) => {
    if (!item.text) return
    try {
      await navigator.clipboard.writeText(item.text)
      setCopiedId(item.id)
      if (copyTimer.current) clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopiedId(null), 1800)
    } catch {
      update(item.id, { note: 'Clipboard is blocked here — select the text and copy it manually.' })
    }
  }

  const downloadOne = (item: Item) => {
    if (!item.text) return
    downloadBlob(
      new Blob([item.text], { type: 'text/plain;charset=utf-8' }),
      `${baseName(item.file.name)}.txt`,
    )
  }

  const downloadAll = () => {
    const done = items.filter((item) => item.text)
    if (done.length === 0) return
    const body = done
      .map((item) => `=== ${item.file.name} ===\n\n${item.text}`)
      .join('\n\n\n')
    downloadBlob(new Blob([body], { type: 'text/plain;charset=utf-8' }), 'quietkit-ocr.txt')
  }

  const queued = items.filter((item) => item.state === 'queued' || item.state === 'error').length
  const doneCount = items.filter((item) => item.state === 'done').length
  const words = items.reduce(
    (sum, item) => sum + (item.text ? item.text.trim().split(/\s+/).filter(Boolean).length : 0),
    0,
  )

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Images</span>
          <h1>Extract text from an image, without uploading it</h1>
          <p>
            A screenshot of an error message, a photographed receipt, a scanned letter —
            QuietKit reads the characters with an OCR engine that runs in this tab and
            hands you plain text to copy or download.
          </p>
        </div>
      </section>

      <div className="container workspace">
        <div>
          <div className="panel">
            <Dropzone
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              title="Drop images here, or click to choose"
              hint="JPEG · PNG · WebP · English text · 0 bytes uploaded"
              icon={<ImageIcon size={30} />}
              onFiles={addFiles}
            />
            <p className="small muted" style={{ marginTop: 12 }}>
              The OCR engine downloads once on the first run — about 7 MB from this site, then
              cached. After that, recognition works even on a flaky connection.
            </p>

            {items.length > 0 && (
              <>
                <div className="row" style={{ marginTop: 18, justifyContent: 'space-between' }}>
                  <span className="small muted">
                    {items.length} image{items.length === 1 ? '' : 's'}
                    {doneCount > 0 && ` · ${doneCount} read · ${words} words`}
                  </span>
                  <div className="row">
                    <label className="btn btn-sm" style={{ cursor: 'pointer' }}>
                      <PlusIcon size={14} /> Add more
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                        className="sr-only"
                        onChange={(event) => {
                          if (event.target.files) addFiles(Array.from(event.target.files))
                          event.currentTarget.value = ''
                        }}
                      />
                    </label>
                    <button className="btn btn-sm" onClick={() => setItems([])} disabled={running}>
                      <TrashIcon size={14} /> Clear
                    </button>
                    <button className="btn btn-forest btn-sm" onClick={run} disabled={running || queued === 0}>
                      {running ? 'Reading…' : queued > 0 ? `Read ${queued} image${queued === 1 ? '' : 's'}` : 'All read'}
                    </button>
                  </div>
                </div>

                <ul className="stack-sm" style={{ listStyle: 'none', margin: '16px 0 0', padding: 0 }}>
                  {items.map((item) => (
                    <li key={item.id} className="panel" style={{ padding: 14 }}>
                      <div className="row" style={{ justifyContent: 'space-between' }}>
                        <div style={{ minWidth: 0 }}>
                          <div className="result-name">{item.file.name}</div>
                          <div className="result-sub">
                            {formatBytes(item.file.size)}
                            {item.state === 'reading' &&
                              ` · ${item.stage ?? 'working'}${item.stage === 'recognizing text' ? ` ${Math.round((item.ratio ?? 0) * 100)}%` : ''}…`}
                            {item.state === 'queued' && ' · queued'}
                            {item.state === 'done' &&
                              item.text &&
                              ` · ${item.text.trim().split(/\s+/).filter(Boolean).length} words`}
                          </div>
                        </div>
                        <div className="row">
                          {item.state === 'done' && item.text && (
                            <>
                              <button className="btn btn-sm" onClick={() => copyText(item)}>
                                <CheckIcon size={14} /> {copiedId === item.id ? 'Copied' : 'Copy'}
                              </button>
                              <button className="btn btn-sm" onClick={() => downloadOne(item)}>
                                <DownloadIcon size={14} /> .txt
                              </button>
                            </>
                          )}
                          <button className="btn btn-sm" onClick={() => remove(item.id)} disabled={running}>
                            <TrashIcon size={14} />
                          </button>
                        </div>
                      </div>
                      {item.note && (
                        <div
                          className={`notice${item.state === 'error' ? ' notice-error' : ''}`}
                          style={{ marginTop: 10 }}
                        >
                          {item.note}
                        </div>
                      )}
                      {item.state === 'done' && item.text && (
                        <pre className="text-preview" style={{ marginTop: 10 }}>{item.text}</pre>
                      )}
                    </li>
                  ))}
                </ul>

                {doneCount > 1 && (
                  <div className="row" style={{ marginTop: 16, justifyContent: 'flex-end' }}>
                    <button className="btn btn-forest" onClick={downloadAll}>
                      <DownloadIcon size={15} /> Download all as one .txt
                    </button>
                  </div>
                )}

                <div className="notice" style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                  <ShieldIcon size={16} />
                  <span className="small">
                    Nothing left this tab. The engine, the language data and your images stay on
                    this device; closing the tab drops them from memory.
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
              Plain text, one block per image — ready to paste into notes, email or a ticket.
              No layout, no tables, just the words the engine could read.
            </p>
            <div className="row" style={{ marginTop: 14 }}>
              <LockIcon size={16} /> <span className="small">Local OCR · 0 bytes uploaded</span>
            </div>
          </div>

          <div className="panel">
            <span className="panel-title">Related</span>
            <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
              <li>
                <Link to="/tools/pdf-text" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Extract text from a PDF
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-to-jpg" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> PDF pages to JPG
                </Link>
              </li>
              <li>
                <Link to="/tools/image-compressor" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Compress images
                </Link>
              </li>
              <li>
                <Link to="/tools/metadata-cleaner" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Strip photo metadata
                </Link>
              </li>
              <li>
                <Link to="/guides/ocr-image-without-upload" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Guide: local OCR, explained
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="section">
        <div className="container-narrow prose">
          <h2>How OCR works without a server</h2>
          <p>
            Optical character recognition is usually sold as a cloud API: upload a picture, get
            text back. But the engine behind most of those services, Tesseract, is open source —
            and it compiles to WebAssembly. QuietKit ships that compiled engine to your browser,
            along with a small English language model, and runs it on your device. The image is
            decoded into pixels here, the characters are recognised here, and the text appears
            here. There is no upload endpoint to send anything to.
          </p>
          <p>
            The first run downloads about 7 MB — the engine and its language data — from this
            site, the same way it downloads the page itself. Your browser caches those files, so
            later recognitions start almost immediately.
          </p>

          <h2>Getting a clean read</h2>
          <p>
            OCR is pattern matching over pixels, and the patterns it knows are printed characters.
            Dark text on a light background, photographed straight on, in focus, at reasonable
            resolution — that is the input every engine is tuned for. Screenshots of error
            messages and terminal output are nearly ideal. Photos of receipts and letters work
            well when the paper is flat and evenly lit.
          </p>
          <p>
            The failure modes are consistent too: handwriting, decorative fonts, text on a
            busy background, motion blur, strong perspective and deep shadows. If the output is
            scrambled, the fix is almost always a better image, not a different engine — crop to
            the text, straighten the page, or re-shoot in brighter light.
          </p>

          <h2>Why local recognition matters</h2>
          <p>
            The images people feed to OCR are rarely casual: medical letters, contracts,
            invoices, ID documents, screenshots of private conversations. Sending those to a
            stranger's server for convenience is exactly the trade QuietKit exists to remove.
            Here the recognition happens in the same tab that renders this page — verifiable in
            your own dev tools, no trust required.
          </p>
          <p>
            The trade-offs are stated plainly: English only, printed text only, and accuracy that
            depends on image quality. What the tool does — turning a picture of words into text
            you can paste — it does entirely on your device, for free.
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
