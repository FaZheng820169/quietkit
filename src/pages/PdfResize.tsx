import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Dropzone } from '../components/Dropzone'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, DownloadIcon, FileIcon, LockIcon, TrashIcon } from '../components/Icons'
import {
  PDF_PAPERS,
  targetSize,
  type PdfFitMode,
  type PdfOrientation,
  type PdfPageBox,
  type PdfPaper,
  type ResizeResult,
} from '../lib/pdfLayout'
import { baseName, downloadBlob, formatBytes } from '../lib/files'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const SHAPES: { value: PdfPaper; label: string; hint: string }[] = [
  { value: 'a4', label: 'A4', hint: '210 × 297 mm — most of the world' },
  { value: 'letter', label: 'Letter', hint: '8.5 × 11 in — US and Canada' },
  { value: 'legal', label: 'Legal', hint: '8.5 × 14 in' },
  { value: 'a5', label: 'A5', hint: '148 × 210 mm — booklets' },
  { value: 'a3', label: 'A3', hint: '297 × 420 mm — posters and plans' },
]

const faqs = [
  {
    q: 'Why are the pages of one PDF different sizes?',
    a: 'Because they came from different places. A report written in Word on A4, a contract scanned on Letter, a diagram exported at 16:9 and a photo attached as a page all keep their own paper size in the same file. Viewers hide it, but a printer will not: some print each page on its own sheet size, others shrink everything to fit the first page.',
  },
  {
    q: 'What is the difference between Fit and Fill?',
    a: 'Fit scales the page until the whole thing is visible, then centres it — you get white margins where the proportions differ. Fill scales until the page covers the sheet completely, then crops the overflow — no margins, but something at the edge is cut. Fit is right for contracts and forms, Fill for photos and full-bleed artwork.',
  },
  {
    q: 'Does the text stay sharp?',
    a: 'Yes. Each page is placed as a vector form, not converted to an image, so text remains selectable, searchable and printed at the printer’s resolution. Nothing is re-compressed or re-rendered.',
  },
  {
    q: 'What does it lose?',
    a: 'The printed page is rebuilt, so interactive objects do not come along: hyperlinks, form fields, comments, and bookmarks. If those matter, keep the original. Password-protected PDFs are refused rather than silently corrupted — remove the password first.',
  },
  {
    q: 'The pages were sideways. Will they stay sideways?',
    a: 'No. The rotation your viewer applied is baked into the page, so the result is upright with no rotation flag. A landscape page keeps its landscape shape when you choose “Match each page”.',
  },
  {
    q: 'Will a small page be enlarged to fill A4?',
    a: 'Yes — both modes scale the page to the sheet, so a 6 × 4 inch photo becomes a full A4 page. Fit contains it, Fill covers it; neither keeps the original size. If upscaling is the problem, choose the sheet that matches the source instead, or place the file in a layout tool afterwards.',
  },
]

export function PdfResize() {
  useSeo({
    ...routeMeta('/tools/pdf-resize'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit PDF Page Resizer',
          'Rebuild every page of a PDF on A4, Letter, Legal, A5 or A3, fitted or filled, with rotation baked in — entirely in the browser.',
          '/tools/pdf-resize',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [file, setFile] = useState<File | null>(null)
  const [boxes, setBoxes] = useState<PdfPageBox[] | null>(null)
  const [reading, setReading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ResizeResult | null>(null)
  const [paper, setPaper] = useState<PdfPaper>('a4')
  const [orientation, setOrientation] = useState<PdfOrientation>('auto')
  const [mode, setMode] = useState<PdfFitMode>('fit')

  const touch = () => setResult(null)

  const pick = async (files: File[]) => {
    const pdf = files.find(
      (entry) => entry.type === 'application/pdf' || /\.pdf$/i.test(entry.name),
    )
    if (!pdf) return

    setFile(pdf)
    setBoxes(null)
    setResult(null)
    setError(null)
    setReading(true)
    try {
      const { readPdfPageBoxes } = await import('../lib/pdf')
      setBoxes(await readPdfPageBoxes(pdf))
    } catch {
      setError('This PDF could not be read. It may be damaged.')
    } finally {
      setReading(false)
    }
  }

  const reset = () => {
    setFile(null)
    setBoxes(null)
    setResult(null)
    setError(null)
  }

  const apply = async () => {
    if (!file) return
    setBusy(true)
    setError(null)
    setResult(null)
    const mod = await import('../lib/pdf')
    try {
      setResult(await mod.resizePdfPages(file, { paper, orientation, mode }))
    } catch (err) {
      setError(
        err instanceof mod.EncryptedPdfError
          ? 'This PDF is password-protected. Remove the password in a viewer first, then resize it.'
          : 'Could not rebuild this PDF. It may be damaged or use an unsupported structure.',
      )
    } finally {
      setBusy(false)
    }
  }

  const download = () => {
    if (!result || !file) return
    downloadBlob(result.blob, `${baseName(file.name)}-${paper}.pdf`)
  }

  const counts = new Map<string, number>()
  boxes?.forEach((box) => counts.set(box.paper, (counts.get(box.paper) ?? 0) + 1))
  const sizeSummary = Array.from(counts)
    .map(([name, count]) => (count === 1 ? name : `${name} ×${count}`))
    .join(' · ')
  const rotated = boxes?.filter((box) => box.rotation !== 0).length ?? 0

  const first = boxes?.[0]
  const sheet = first ? targetSize(paper, orientation, first.landscape) : null
  const previewScale =
    first && sheet
      ? mode === 'fill'
        ? Math.max(sheet.width / first.width, sheet.height / first.height)
        : Math.min(sheet.width / first.width, sheet.height / first.height)
      : 1
  const drawnWidth = first ? first.width * previewScale : 0
  const drawnHeight = first ? first.height * previewScale : 0

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Documents</span>
          <h1>Make every page the same size</h1>
          <p>
            A Word report, a Letter-size scan and a photo page in one file will print at three
            different sizes. Put every page on A4, Letter or A3 — fitted to show it all, or filled
            to cover the sheet — without uploading anything.
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
                hint="One file · pages are rebuilt as vectors, not screenshots"
                icon={<FileIcon size={30} />}
                onFiles={pick}
              />
            ) : (
              <>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="panel-title" style={{ marginBottom: 0 }}>
                    {file.name} · {boxes ? `${boxes.length} pages` : '…'} ·{' '}
                    {formatBytes(file.size)}
                  </span>
                  <button className="btn btn-sm" onClick={reset}>
                    <TrashIcon size={14} /> Start over
                  </button>
                </div>

                {reading && (
                  <p className="small muted" style={{ marginTop: 14 }}>
                    Measuring the pages locally…
                  </p>
                )}

                {boxes && (
                  <p className="small muted" style={{ marginTop: 12 }}>
                    Found {sizeSummary}
                    {rotated > 0 ? ` · ${rotated} rotated` : ''}.
                  </p>
                )}

                {error && (
                  <div className="notice notice-error" style={{ marginTop: 16 }}>
                    {error}
                  </div>
                )}

                <div className="controls" style={{ marginTop: 18 }}>
                  <div className="field">
                    <span className="field-label">Sheet size</span>
                    <div className="segmented">
                      {SHAPES.map((shape) => (
                        <button
                          key={shape.value}
                          aria-pressed={paper === shape.value}
                          onClick={() => {
                            setPaper(shape.value)
                            touch()
                          }}
                          title={shape.hint}
                        >
                          {shape.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="field">
                    <span className="field-label">Orientation</span>
                    <div className="segmented">
                      <button
                        aria-pressed={orientation === 'auto'}
                        onClick={() => {
                          setOrientation('auto')
                          touch()
                        }}
                        title="A landscape page stays landscape"
                      >
                        Match each page
                      </button>
                      <button
                        aria-pressed={orientation === 'portrait'}
                        onClick={() => {
                          setOrientation('portrait')
                          touch()
                        }}
                      >
                        Portrait
                      </button>
                      <button
                        aria-pressed={orientation === 'landscape'}
                        onClick={() => {
                          setOrientation('landscape')
                          touch()
                        }}
                      >
                        Landscape
                      </button>
                    </div>
                  </div>

                  <div className="field">
                    <span className="field-label">How to place it</span>
                    <div className="segmented">
                      <button
                        aria-pressed={mode === 'fit'}
                        onClick={() => {
                          setMode('fit')
                          touch()
                        }}
                        title="Whole page visible, white margins where needed"
                      >
                        Fit — whole page
                      </button>
                      <button
                        aria-pressed={mode === 'fill'}
                        onClick={() => {
                          setMode('fill')
                          touch()
                        }}
                        title="Cover the sheet completely, crop the overflow"
                      >
                        Fill — cover it
                      </button>
                    </div>
                  </div>
                </div>

                {first && sheet && (
                  <div style={{ marginTop: 22 }}>
                    <span className="panel-title">Page 1 on the new sheet</span>
                    <div className="row" style={{ gap: 20, alignItems: 'flex-end' }}>
                      <div
                        style={{
                          position: 'relative',
                          width: 132,
                          aspectRatio: `${sheet.width} / ${sheet.height}`,
                          background: 'var(--paper-2, #f4f2ec)',
                          border: '1px solid var(--line, #d8d4c8)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            left: `${((sheet.width - drawnWidth) / 2 / sheet.width) * 100}%`,
                            top: `${((sheet.height - drawnHeight) / 2 / sheet.height) * 100}%`,
                            width: `${(drawnWidth / sheet.width) * 100}%`,
                            height: `${(drawnHeight / sheet.height) * 100}%`,
                            background: 'var(--ink, #23211c)',
                            opacity: 0.82,
                          }}
                        />
                      </div>
                      <div className="small muted">
                        <div>
                          {first.paper} · {first.width} × {first.height} pt
                          {first.rotation ? ` · rotated ${first.rotation}°` : ''}
                        </div>
                        <div style={{ marginTop: 4 }}>
                          → {PDF_PAPERS[paper].label}
                          {sheet.width > sheet.height ? ' landscape' : ' portrait'} ·{' '}
                          {mode === 'fit' ? 'fitted' : 'filled'} · scale{' '}
                          {(previewScale * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="row" style={{ marginTop: 22, justifyContent: 'space-between' }}>
                  <button
                    className="btn btn-forest"
                    onClick={apply}
                    disabled={busy || !boxes || boxes.length === 0}
                  >
                    {busy ? 'Rebuilding locally…' : 'Resize pages'}
                  </button>
                  {result && (
                    <button className="btn" onClick={download}>
                      <DownloadIcon size={16} /> Download ({formatBytes(result.blob.size)})
                    </button>
                  )}
                </div>

                {result && (
                  <div className="notice notice-ok" style={{ marginTop: 16 }}>
                    Rebuilt {result.pages} page{result.pages === 1 ? '' : 's'} on{' '}
                    {PDF_PAPERS[paper].label}
                    {result.scaled < result.pages
                      ? ` — ${result.pages - result.scaled} already matched the sheet`
                      : ''}
                    . Text stays vector; links, form fields and comments do not carry over.
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
            <span className="panel-title">Rebuilt, not screenshotted</span>
            <p className="small muted">
              Each page is placed as a vector form and scaled as geometry, so text stays
              selectable and prints at full resolution. No rasterisation, no re-compression.
            </p>
            <div className="row" style={{ marginTop: 14 }}>
              <LockIcon size={16} /> <span className="small">0 bytes uploaded</span>
            </div>
          </div>

          <div className="panel">
            <span className="panel-title">Related</span>
            <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
              <li>
                <Link to="/tools/pdf-rotate" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Turn the sideways pages first
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-remove-pages" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Drop the pages you do not need
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-merge" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Merge several files into one
                </Link>
              </li>
              <li>
                <Link to="/guides/compress-image-to-100kb" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Shrink the photos inside it
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="section">
        <div className="container-narrow prose">
          <h2>One file, three paper sizes</h2>
          <p>
            A PDF page carries its own width and height, in points, and nothing forces the pages to
            agree. Merge a Word export (A4), a scanned contract (Letter) and a diagram exported at
            16:9, and the file contains three different sheets. On screen it is invisible — viewers
            scale pages to the window. On paper it is the first thing you notice: the printer either
            feeds a different tray for every page, or shrinks all of them to fit one size.
          </p>
          <p>
            Upload portals are less forgiving. “Maximum A4, 210 × 297 mm” is common, and a page at
            612 × 792 pt is not that. Rebuilding the pages on one sheet solves both problems at once.
          </p>

          <h2>Fit and Fill are two different promises</h2>
          <p>
            <strong>Fit</strong> scales each page by the smaller of the two ratios — enough to make
            the longest side fit — then centres it. Nothing is cut, but a page whose proportions
            differ from the sheet gets white margins. That is what you want for a contract: a
            missing clause costs more than a blank strip.
          </p>
          <p>
            <strong>Fill</strong> scales by the larger ratio, so the page covers the sheet corner to
            corner, and everything outside the sheet is cropped. No margins, but a chart’s axis label
            can disappear. For photographs and full-bleed artwork that is usually the right call.
          </p>

          <h2>Rotation is normalised on the way</h2>
          <p>
            Scans are often stored sideways with a rotation flag that tells the viewer to turn the
            page. When a page is rebuilt, that rotation is baked into the content and the new sheet
            carries no flag, so the result reads upright in every viewer and in print — one less
            thing that can be ignored by a printer driver.
          </p>

          <h2>What is deliberately not carried over</h2>
          <p>
            The visible page is rebuilt as vector content, so annotations do not survive: hyperlinks,
            form fields, comments and bookmarks are dropped. Text, images, lines, fills and embedded
            fonts are all preserved, and nothing is re-compressed. If the file is a fillable form you
            still need, keep the original.
          </p>
          <p>
            Password-protected files are refused instead of being written out broken. Remove the
            password in a viewer, then resize. And if the PDF has to remain PDF/A, note that a
            rebuilt page is not a PDF/A page — validate it before archiving.
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
