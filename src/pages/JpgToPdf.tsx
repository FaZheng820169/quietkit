import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Dropzone } from '../components/Dropzone'
import { AdSlot } from '../components/AdSlot'
import { DownloadIcon, FileIcon, ImageIcon, LockIcon, TrashIcon, CheckIcon } from '../components/Icons'
import { downloadBlob, formatBytes } from '../lib/files'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

type Item = { id: string; file: File; url: string | null }
type PageSize = 'a4' | 'letter' | 'fit'

const faqs = [
  {
    q: 'Are my photos uploaded to a server?',
    a: 'No. Each image is decoded into this tab, drawn onto a canvas and embedded into a PDF built in memory. The download is the first time any data leaves the page — nothing is transmitted, logged or queued.',
  },
  {
    q: 'Does the PDF keep the GPS location of my photos?',
    a: 'No. Every image is re-encoded before it goes into the PDF, so the EXIF block — GPS coordinates, camera model, capture time — is discarded. That is deliberate: a PDF of holiday photos is exactly the file people email to strangers.',
  },
  {
    q: 'Should I choose A4, Letter or Fit?',
    a: 'Choose A4 for printing in most of the world, Letter for the US and Canada, and Fit when the PDF is read on a screen and you want no white bars around the image. Fit sizes each page exactly to its image, so a batch of different photos produces pages of different sizes.',
  },
  {
    q: 'Why is one landscape photo not sideways?',
    a: 'The orientation stored in EXIF is applied before the image is placed, so a photo taken in portrait stays portrait even if the raw pixels were landscape. Rotating happens once, on the way in, not again in the PDF.',
  },
  {
    q: 'What happens to a portrait photo on an A4 page?',
    a: 'It is centred and scaled to touch the margins, with white space on the left and right. The page itself becomes landscape when the image is wider than it is tall, so every page is oriented to suit its content.',
  },
  {
    q: 'Can I combine iPhone HEIC photos too?',
    a: 'Yes. HEIC and HEIF are decoded with a WebAssembly decoder that loads only when such a file appears, then converted like any other image. PNG screenshots stay PNG so text does not pick up JPEG artefacts.',
  },
]

let counter = 0

export function JpgToPdf() {
  useSeo({
    ...routeMeta('/tools/jpg-to-pdf'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit JPG to PDF',
          'Combine JPG, PNG and HEIC images into one PDF locally in the browser, with A4, Letter or fitted pages.',
          '/tools/jpg-to-pdf',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [items, setItems] = useState<Item[]>([])
  const [pageSize, setPageSize] = useState<PageSize>('a4')
  const [margin, setMargin] = useState(24)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ blob: Blob; pages: number } | null>(null)
  const resultUrl = useRef('')

  const clearResult = () => {
    if (resultUrl.current) URL.revokeObjectURL(resultUrl.current)
    resultUrl.current = ''
    setResult(null)
  }

  const addFiles = (files: File[]) => {
    const images = files.filter(
      (file) => file.type.startsWith('image/') || /\.(heic|heif)$/i.test(file.name),
    )
    if (!images.length) return
    clearResult()
    setError(null)
    setItems((current) => [
      ...current,
      ...images.map((file) => {
        counter += 1
        const heic = /\.(heic|heif)$/i.test(file.name) || file.type === 'image/heic'
        return {
          id: `${file.name}-${file.lastModified}-${counter}`,
          file,
          url: heic ? null : URL.createObjectURL(file),
        }
      }),
    ])
  }

  const remove = (id: string) => {
    clearResult()
    setItems((current) => {
      const target = current.find((item) => item.id === id)
      if (target?.url) URL.revokeObjectURL(target.url)
      return current.filter((item) => item.id !== id)
    })
  }

  const move = (index: number, direction: -1 | 1) => {
    clearResult()
    setItems((current) => {
      const next = [...current]
      const target = index + direction
      if (target < 0 || target >= next.length) return current
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const reset = () => {
    clearResult()
    items.forEach((item) => item.url && URL.revokeObjectURL(item.url))
    setItems([])
    setError(null)
  }

  const build = async () => {
    if (!items.length) return
    setBusy(true)
    setError(null)
    clearResult()
    try {
      const { imagesToPdf } = await import('../lib/imagesToPdf')
      const output = await imagesToPdf(
        items.map((item) => item.file),
        { pageSize, marginPt: margin, maxPixels: 3000 },
      )
      const url = URL.createObjectURL(output.blob)
      resultUrl.current = url
      setResult(output)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not build this PDF.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Documents</span>
          <h1>Turn photos and screenshots into one PDF</h1>
          <p>
            Drop receipts, ID scans or holiday photos, put them in order, and get a single PDF on
            A4, Letter or pages fitted to each image. Built in this tab — the photos never leave
            your device, and their GPS data never enters the file.
          </p>
        </div>
      </section>

      <div className="container workspace">
        <div>
          <div className="panel">
            {!items.length ? (
              <Dropzone
                accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif,.heic,.heif"
                multiple
                title="Drop images here, or click to choose"
                hint="JPG · PNG · HEIC · WebP — one page per image, in the order you pick"
                icon={<ImageIcon size={30} />}
                onFiles={addFiles}
              />
            ) : (
              <>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="panel-title" style={{ marginBottom: 0 }}>
                    {items.length} image{items.length === 1 ? '' : 's'} · first one becomes page 1
                  </span>
                  <button className="btn btn-sm" onClick={reset}>
                    <TrashIcon size={14} /> Start over
                  </button>
                </div>

                <ol className="order-list">
                  {items.map((item, index) => (
                    <li key={item.id} className="order-item">
                      <span className="order-index">{index + 1}</span>
                      <span className="order-thumb">
                        {item.url ? (
                          <img src={item.url} alt="" loading="lazy" />
                        ) : (
                          <FileIcon size={18} />
                        )}
                      </span>
                      <span className="order-name">
                        {item.file.name}
                        <small className="muted"> · {formatBytes(item.file.size)}</small>
                      </span>
                      <span className="order-actions">
                        <button
                          className="btn btn-sm"
                          onClick={() => move(index, -1)}
                          disabled={index === 0}
                          aria-label={`Move ${item.file.name} up`}
                        >
                          ↑
                        </button>
                        <button
                          className="btn btn-sm"
                          onClick={() => move(index, 1)}
                          disabled={index === items.length - 1}
                          aria-label={`Move ${item.file.name} down`}
                        >
                          ↓
                        </button>
                        <button
                          className="btn btn-sm"
                          onClick={() => remove(item.id)}
                          aria-label={`Remove ${item.file.name}`}
                        >
                          <TrashIcon size={14} />
                        </button>
                      </span>
                    </li>
                  ))}
                </ol>

                <label className="btn btn-sm add-more">
                  Add more images
                  <input
                    type="file"
                    accept="image/*,.heic,.heif"
                    multiple
                    hidden
                    onChange={(event) => {
                      addFiles(Array.from(event.target.files ?? []))
                      event.target.value = ''
                    }}
                  />
                </label>

                <div className="controls" style={{ marginTop: 22 }}>
                  <div className="field">
                    <span className="field-label">Page size</span>
                    <div className="segmented">
                      <button aria-pressed={pageSize === 'a4'} onClick={() => { setPageSize('a4'); clearResult() }}>
                        A4 · print
                      </button>
                      <button aria-pressed={pageSize === 'letter'} onClick={() => { setPageSize('letter'); clearResult() }}>
                        Letter · US
                      </button>
                      <button aria-pressed={pageSize === 'fit'} onClick={() => { setPageSize('fit'); clearResult() }}>
                        Fit to image
                      </button>
                    </div>
                  </div>

                  {pageSize !== 'fit' && (
                    <div className="field">
                      <span className="field-label">Margin</span>
                      <div className="segmented">
                        {[0, 24, 48].map((value) => (
                          <button
                            key={value}
                            aria-pressed={margin === value}
                            onClick={() => { setMargin(value); clearResult() }}
                          >
                            {value === 0 ? 'None' : `${Math.round(value / 2.83)} mm`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="notice notice-error" style={{ marginTop: 16 }}>
                    {error}
                  </div>
                )}

                <div className="row" style={{ marginTop: 20, justifyContent: 'space-between' }}>
                  <button className="btn btn-forest" onClick={build} disabled={busy}>
                    {busy ? 'Building locally…' : 'Create PDF'}
                  </button>
                  {result && (
                    <button
                      className="btn"
                      onClick={() => downloadBlob(result.blob, `quietkit-${result.pages}-pages.pdf`)}
                    >
                      <DownloadIcon size={16} /> Download ({formatBytes(result.blob.size)})
                    </button>
                  )}
                </div>

                {result && (
                  <div className="notice notice-ok" style={{ marginTop: 16 }}>
                    {result.pages} page{result.pages === 1 ? '' : 's'} · {formatBytes(result.blob.size)} ·
                    images re-encoded, so no EXIF or GPS is carried over.
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
            <span className="panel-title">What leaves your device</span>
            <p className="small muted">
              Nothing until you download. No upload, no preview request, no analytics on the file
              itself — the PDF is assembled in memory and handed straight to the browser.
            </p>
            <div className="row" style={{ marginTop: 14 }}>
              <LockIcon size={16} /> <span className="small">0 bytes uploaded</span>
            </div>
          </div>

          <div className="panel">
            <span className="panel-title">Related</span>
            <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
              <li>
                <Link to="/tools/pdf-merge" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Merge existing PDFs instead
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-rotate" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Rotate pages afterwards
                </Link>
              </li>
              <li>
                <Link to="/guides/heic-to-jpg" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Guide: HEIC, explained
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="section">
        <div className="container-narrow prose">
          <h2>One page per image, in the order you choose</h2>
          <p>
            Scanned receipts, photographed documents and screenshots arrive as separate files. A
            PDF is the format every portal, accountant and email client accepts, and the order of
            the pages is the only thing that carries meaning: invoice, receipt, ID, cover letter.
            The list above is the page order — move an item and page 2 becomes page 1.
          </p>

          <h2>Printing versus reading</h2>
          <p>
            A4 and Letter exist to be printed and punched. Images are scaled to fit inside the
            margins and centred, so nothing is cropped and the page keeps a consistent geometry.
            Landscape photos get a landscape page automatically, which is why a batch of mixed
            orientations does not end up with sideways pictures.
          </p>
          <p>
            “Fit to image” does the opposite: the page takes the exact proportions of its photo at
            96 pixels per inch. Good for a PDF that will be read on a screen or sent to a phone, and
            bad for a printer, which will scale every page differently.
          </p>

          <h2>Why the images are re-encoded</h2>
          <p>
            Copying a JPEG into a PDF byte-for-byte is faster, but it carries two problems straight
            through: the EXIF orientation is often wrong, so photos appear rotated, and the same EXIF
            block contains GPS coordinates and the camera serial number. Re-drawing each image on a
            canvas fixes the rotation and drops the metadata. JPEG photos are encoded at 92%;
            screenshots stay PNG so their text does not pick up ringing artefacts.
          </p>

          <h2>When not to use this</h2>
          <ul>
            <li>If the source is already a PDF, <Link to="/tools/pdf-merge">merge the PDFs</Link> instead — nothing is re-encoded that way.</li>
            <li>If the image is a signature with a transparent background, it will be flattened onto white; that is usually what you want on paper.</li>
            <li>If you need the original photo quality preserved in the PDF, keep the photos alongside the PDF rather than relying on the PDF as an archive.</li>
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
