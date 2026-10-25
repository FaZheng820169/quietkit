import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Dropzone } from '../components/Dropzone'
import { AdSlot } from '../components/AdSlot'
import { DownloadIcon, FileIcon, LockIcon, CheckIcon, TrashIcon } from '../components/Icons'
import { downloadBlob, formatBytes } from '../lib/files'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

type Angle = 90 | 180 | 270
type Result = { blob: Blob; pages: number; rotated: number }

const ANGLES: { value: Angle; label: string; hint: string }[] = [
  { value: 90, label: '90° clockwise', hint: 'sideways scan that reads top-to-bottom' },
  { value: 180, label: '180°', hint: 'upside-down page or fax' },
  { value: 270, label: '90° counter-clockwise', hint: 'sideways scan that reads bottom-to-top' },
]

const faqs = [
  {
    q: 'Does rotating a PDF reduce its quality?',
    a: 'No. Rotation is stored as a single number per page, the /Rotate entry. The text, images and vector lines are left exactly as they were, so nothing is re-rendered or re-compressed. A 40-page contract stays as sharp as the original.',
  },
  {
    q: 'Why does the page look upright in one viewer and sideways in another?',
    a: 'Because /Rotate is an instruction to the viewer, not a change to the page content. Every mainstream viewer honours it, but some older tools, print drivers and page-thumbnail scripts ignore it or apply it twice. If a destination must render the page itself, rotate the content instead — that means re-creating the page, which is what “rotate and flatten” options in desktop editors do.',
  },
  {
    q: 'Can I rotate only the pages that are wrong?',
    a: 'Yes. Choose “Selected pages” and enter ranges like 1-3, 7, 10-. Rotating a document where page 4 is upside down takes one line and leaves the other 39 pages alone.',
  },
  {
    q: 'What happens if a page was already rotated?',
    a: 'QuietKit adds to the existing value instead of overwriting it. A page already at 180° rotated by 180° becomes 0°, which is what you expect when you click rotate twice. Repeating the same rotation four times returns the page to its starting orientation.',
  },
  {
    q: 'Is my PDF uploaded while rotating?',
    a: 'No. The whole file is read from disk into this tab, modified in memory and saved back to a download. Nothing is transmitted, so medical records, contracts and ID scans stay on your device.',
  },
]

export function PdfRotate() {
  useSeo({
    ...routeMeta('/tools/pdf-rotate'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit PDF Rotator',
          'Rotate all or selected pages of a PDF by 90, 180 or 270 degrees locally in the browser.',
          '/tools/pdf-rotate',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [file, setFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState<number | null>(null)
  const [angle, setAngle] = useState<Angle>(90)
  const [scope, setScope] = useState<'all' | 'range'>('all')
  const [range, setRange] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Result | null>(null)

  const pick = async (files: File[]) => {
    const pdf = files.find(
      (entry) => entry.type === 'application/pdf' || /\.pdf$/i.test(entry.name),
    )
    if (!pdf) return
    setFile(pdf)
    setPageCount(null)
    setResult(null)
    setError(null)
    setScope('all')
    setRange('')
    try {
      const { countPdfPages } = await import('../lib/pdf')
      setPageCount(await countPdfPages(pdf))
    } catch {
      setError('This PDF could not be read. It may be password-protected or damaged.')
    }
  }

  const reset = () => {
    setFile(null)
    setPageCount(null)
    setResult(null)
    setError(null)
    setRange('')
  }

  const apply = async () => {
    if (!file || pageCount === null) return
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      const { rotatePdfPages } = await import('../lib/pdf')
      setResult(await rotatePdfPages(file, scope === 'range' ? range : '', angle))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not rotate this PDF.')
    } finally {
      setBusy(false)
    }
  }

  const download = () => {
    if (!result || !file) return
    downloadBlob(result.blob, `${file.name.replace(/\.pdf$/i, '')}-rotated.pdf`)
  }

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Documents</span>
          <h1>Rotate PDF pages, without redrawing them</h1>
          <p>
            A scanner fed the wrong way round leaves every page sideways. Turn all pages at once,
            or just the ones that are wrong, by 90° or 180° — edited in this tab, never uploaded.
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
                hint="One file · text stays vector, nothing is re-compressed"
                icon={<FileIcon size={30} />}
                onFiles={pick}
              />
            ) : (
              <>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="panel-title" style={{ marginBottom: 0 }}>
                    {file.name} · {pageCount ?? '…'} pages · {formatBytes(file.size)}
                  </span>
                  <button className="btn btn-sm" onClick={reset}>
                    <TrashIcon size={14} /> Start over
                  </button>
                </div>

                <div className="controls" style={{ marginTop: 18 }}>
                  <div className="field">
                    <span className="field-label">Rotate by</span>
                    <div className="segmented">
                      {ANGLES.map((option) => (
                        <button
                          key={option.value}
                          aria-pressed={angle === option.value}
                          onClick={() => {
                            setAngle(option.value)
                            setResult(null)
                          }}
                          title={option.hint}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="field">
                    <span className="field-label">Which pages?</span>
                    <div className="segmented">
                      <button
                        aria-pressed={scope === 'all'}
                        onClick={() => {
                          setScope('all')
                          setResult(null)
                        }}
                      >
                        All pages
                      </button>
                      <button
                        aria-pressed={scope === 'range'}
                        onClick={() => {
                          setScope('range')
                          setResult(null)
                        }}
                      >
                        Selected pages
                      </button>
                    </div>
                  </div>

                  {scope === 'range' && (
                    <div className="field">
                      <label htmlFor="rotate-range">Pages</label>
                      <input
                        id="rotate-range"
                        type="text"
                        value={range}
                        onChange={(event) => {
                          setRange(event.target.value)
                          setResult(null)
                        }}
                        placeholder="e.g. 1-3, 7, 10-"
                        autoComplete="off"
                      />
                      <p className="small muted" style={{ marginTop: 8 }}>
                        Pages are numbered as your viewer shows them, starting at 1.
                      </p>
                    </div>
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
                    disabled={busy || pageCount === null || (scope === 'range' && !range.trim())}
                  >
                    {busy ? 'Rotating locally…' : 'Rotate pages'}
                  </button>
                  {result && (
                    <button className="btn" onClick={download}>
                      <DownloadIcon size={16} /> Download ({formatBytes(result.blob.size)})
                    </button>
                  )}
                </div>

                {result && (
                  <div className="notice notice-ok" style={{ marginTop: 16 }}>
                    Rotated {result.rotated} of {result.pages} page
                    {result.pages === 1 ? '' : 's'} by {angle}°. Text and images are untouched; the
                    original file is unchanged.
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
            <span className="panel-title">Rotated in place</span>
            <p className="small muted">
              The file is read into this tab, the rotation is written into the page objects, and a
              new copy is downloaded. No upload, no queue, no copy on anyone's server.
            </p>
            <div className="row" style={{ marginTop: 14 }}>
              <LockIcon size={16} /> <span className="small">0 bytes uploaded</span>
            </div>
          </div>

          <div className="panel">
            <span className="panel-title">Related</span>
            <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
              <li>
                <Link to="/tools/pdf-remove-pages" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Delete the blank scan page
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-reorder" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Also fix the page order
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-merge" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Merge the rotated file with others
                </Link>
              </li>
              <li>
                <Link to="/guides/heic-to-jpg" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Convert those phone photos to JPEG
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="section">
        <div className="container-narrow prose">
          <h2>Why scanned pages come out sideways</h2>
          <p>
            A flatbed scanner records the paper as it sits on the glass, not as you intend to read
            it. Feed a landscape form the short edge first and the result is a portrait page rotated
            90°. Phone scanning apps add their own twist: they detect the page, rotate the image to
            save space, then the PDF builder applies a second rotation, and the two disagree.
          </p>
          <p>
            Once a document is assembled, fixing it page by page in a desktop editor means opening
            40 thumbnails by hand. Selecting a range does the same job in one line, which is why the
            range box exists on this page.
          </p>

          <h2>What “rotating” actually changes</h2>
          <p>
            A PDF page has a dictionary entry called <code>/Rotate</code>, a multiple of 90 that
            tells the viewer which way to turn the page before drawing it. Changing that number is
            instant, lossless and reversible — it is what Adobe Acrobat's “Rotate View” does, and
            what most viewers offer as “Save rotated page”.
          </p>
          <p>
            The alternative is transforming the page content itself: every text run and image gets
            a coordinate transform and the media box is swapped. That is heavier, it can subtly
            change how a printed page lands on paper, and most tools cannot do it reliably for
            mixed content. It is only worth it when the destination ignores <code>/Rotate</code>,
            which is rare in 2026.
          </p>

          <h2>How to check the result</h2>
          <ul>
            <li>Open the downloaded file in your usual viewer and confirm the first page is upright.</li>
            <li>Print one page, or export it to an image, if the file goes to a print workflow — that catches viewers that ignore rotation metadata.</li>
            <li>Keep the original until you have checked; Rotation is additive, so a second pass compounds with the first.</li>
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
