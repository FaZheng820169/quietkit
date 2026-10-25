import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Dropzone } from '../components/Dropzone'
import { AdSlot } from '../components/AdSlot'
import { DownloadIcon, FileIcon, LockIcon, CheckIcon, TrashIcon } from '../components/Icons'
import { baseName, downloadBlob, formatBytes } from '../lib/files'
import { EncryptedPdfError } from '../lib/pdfErrors'
import { parsePageSegments, type PageSegment } from '../lib/ranges'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'
import type { SplitPart, SplitResult } from '../lib/pdf'

type Mode = 'each' | 'chunk' | 'ranges'

const MAX_PARTS = 100

const faqs = [
  {
    q: 'Can I split at a specific page?',
    a: 'Yes. Choose “Page ranges” and type 1-4, 5- to get two files: pages 1 to 4, and pages 5 to the end. Every range you type becomes its own PDF, in the order you typed it.',
  },
  {
    q: 'Does splitting reduce quality?',
    a: 'No. Pages are copied into new documents, not re-rendered. Text stays selectable, images keep their original resolution, and links between pages of the same part still work.',
  },
  {
    q: 'Are bookmarks and forms carried over?',
    a: 'Each page keeps its content, annotations and links. A document-wide outline (bookmarks panel) is not copied into the pieces, and form fields that span pages are not rebuilt — the pages keep their printed appearance.',
  },
  {
    q: 'How many files can one run create?',
    a: 'Up to 100. Beyond that a browser tab runs out of memory and stops halfway, which is worse than a clear limit — so the page stops at 100 and asks for larger chunks.',
  },
  {
    q: 'Is my PDF uploaded to a server?',
    a: 'No. The file is read into this tab and each part is written back in memory. There is no upload step, so you can switch the network off after the page loads and still finish.',
  },
]

function planSegments(
  pageCount: number,
  mode: Mode,
  chunk: string,
  ranges: string,
): { segments: PageSegment[]; error: string | null } {
  let segments: PageSegment[]
  try {
    if (mode === 'each') {
      segments = Array.from({ length: pageCount }, (_, index) => ({
        start: index + 1,
        end: index + 1,
      }))
    } else if (mode === 'chunk') {
      const size = Number.parseInt(chunk, 10)
      if (!Number.isFinite(size) || size < 1) {
        return { segments: [], error: 'Enter how many pages go in each file.' }
      }
      segments = []
      for (let start = 1; start <= pageCount; start += size) {
        segments.push({ start, end: Math.min(pageCount, start + size - 1) })
      }
    } else {
      segments = parsePageSegments(ranges, pageCount)
    }
  } catch (caught) {
    return {
      segments: [],
      error: caught instanceof Error ? caught.message : 'Check the page ranges.',
    }
  }

  if (segments.length > MAX_PARTS) {
    return {
      segments: [],
      error: `That would create ${segments.length} files. One run is capped at ${MAX_PARTS} — use larger chunks or fewer ranges.`,
    }
  }
  return { segments, error: null }
}

export function PdfSplit() {
  useSeo({
    ...routeMeta('/tools/pdf-split'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit PDF Splitter',
          'Split a PDF into one file per page, fixed-size chunks, or custom ranges, locally in the browser.',
          '/tools/pdf-split',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [file, setFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState<number | null>(null)
  const [mode, setMode] = useState<Mode>('each')
  const [chunk, setChunk] = useState('10')
  const [ranges, setRanges] = useState('')
  const [busy, setBusy] = useState(false)
  const [built, setBuilt] = useState<{ done: number; total: number } | null>(null)
  const [zipping, setZipping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SplitResult | null>(null)

  const plan = useMemo(
    () =>
      pageCount === null
        ? { segments: [] as PageSegment[], error: null as string | null }
        : planSegments(pageCount, mode, chunk, ranges),
    [pageCount, mode, chunk, ranges],
  )

  const covered = useMemo(() => {
    const pages = new Set<number>()
    for (const segment of plan.segments) {
      for (let page = segment.start; page <= segment.end; page += 1) pages.add(page)
    }
    return pages.size
  }, [plan])

  const base = file ? baseName(file.name) : 'document'
  const nameForRange = (start: number, end: number) =>
    start === end ? `${base}-${start}.pdf` : `${base}-${start}-${end}.pdf`
  const nameFor = (part: SplitPart) => nameForRange(part.start, part.end)

  const pick = async (files: File[]) => {
    const pdf = files.find(
      (entry) => entry.type === 'application/pdf' || /\.pdf$/i.test(entry.name),
    )
    if (!pdf) return
    setFile(pdf)
    setPageCount(null)
    setResult(null)
    setError(null)
    setBuilt(null)
    try {
      const { countPdfPages } = await import('../lib/pdf')
      setPageCount(await countPdfPages(pdf))
    } catch (caught) {
      setError(
        caught instanceof EncryptedPdfError
          ? caught.message
          : 'This PDF could not be read. It may be damaged.',
      )
    }
  }

  const reset = () => {
    setFile(null)
    setPageCount(null)
    setResult(null)
    setError(null)
    setBuilt(null)
    setRanges('')
  }

  const split = async () => {
    if (!file || !pageCount || plan.error || plan.segments.length === 0) return
    setBusy(true)
    setError(null)
    setResult(null)
    setBuilt({ done: 0, total: plan.segments.length })
    try {
      const { splitPdf } = await import('../lib/pdf')
      const splitResult = await splitPdf(file, plan.segments, (done, total) =>
        setBuilt({ done, total }),
      )
      setResult(splitResult)
    } catch (caught) {
      setError(
        caught instanceof EncryptedPdfError
          ? caught.message
          : 'Could not split this PDF. It may be damaged or use an unsupported structure.',
      )
    } finally {
      setBusy(false)
      setBuilt(null)
    }
  }

  const downloadAll = async () => {
    if (!result || result.parts.length === 0) return
    if (result.parts.length === 1) {
      downloadBlob(result.parts[0].blob, nameFor(result.parts[0]))
      return
    }
    setZipping(true)
    try {
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      result.parts.forEach((part) => zip.file(nameFor(part), part.blob))
      const blob = await zip.generateAsync({ type: 'blob' })
      downloadBlob(blob, `${base}-split.zip`)
    } finally {
      setZipping(false)
    }
  }

  const preview = plan.segments.slice(0, 12)
  const rest = plan.segments.length - preview.length
  const totalOut = result ? result.parts.reduce((sum, part) => sum + part.blob.size, 0) : 0

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Documents</span>
          <h1>Split a PDF into separate files, locally</h1>
          <p>
            One file per page, fixed-size chunks, or your own ranges like 1-3, 4-9, 10-. Each part
            is copied rather than re-rendered, and the whole run downloads as a single ZIP. Nothing
            leaves this tab.
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
                hint="One file · every part is a copy, never a re-render"
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
                    <span className="field-label">How should it be cut?</span>
                    <div className="segmented">
                      <button
                        aria-pressed={mode === 'each'}
                        onClick={() => {
                          setMode('each')
                          setResult(null)
                        }}
                      >
                        Every page
                      </button>
                      <button
                        aria-pressed={mode === 'chunk'}
                        onClick={() => {
                          setMode('chunk')
                          setResult(null)
                        }}
                      >
                        Fixed chunks
                      </button>
                      <button
                        aria-pressed={mode === 'ranges'}
                        onClick={() => {
                          setMode('ranges')
                          setResult(null)
                        }}
                      >
                        Page ranges
                      </button>
                    </div>
                  </div>

                  {mode === 'each' && (
                    <p className="small muted">
                      Each page becomes its own PDF — the usual choice for forms, invoices and
                      scans that need to be filed one at a time.
                    </p>
                  )}

                  {mode === 'chunk' && (
                    <div className="field">
                      <label htmlFor="chunk-size">Pages per file</label>
                      <input
                        id="chunk-size"
                        type="number"
                        min={1}
                        max={500}
                        value={chunk}
                        onChange={(event) => {
                          setChunk(event.target.value)
                          setResult(null)
                        }}
                        style={{ maxWidth: 110 }}
                      />
                      <p className="small muted" style={{ marginTop: 8 }}>
                        A 40-page file with 10 here gives four files of ten pages.
                      </p>
                    </div>
                  )}

                  {mode === 'ranges' && (
                    <div className="field">
                      <label htmlFor="split-ranges">Ranges, one file each</label>
                      <input
                        id="split-ranges"
                        type="text"
                        value={ranges}
                        onChange={(event) => {
                          setRanges(event.target.value)
                          setResult(null)
                        }}
                        placeholder="e.g. 1-4, 5-8, 9-"
                        autoComplete="off"
                      />
                      <p className="small muted" style={{ marginTop: 8 }}>
                        “9-” means page 9 to the end. Ranges may overlap, and each one produces
                        its own file in the order typed.
                      </p>
                    </div>
                  )}
                </div>

                {pageCount !== null && !plan.error && plan.segments.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      <span className="panel-title" style={{ marginBottom: 0 }}>
                        {plan.segments.length} file{plan.segments.length === 1 ? '' : 's'} will be
                        created
                      </span>
                      {covered < pageCount && (
                        <span className="small muted">
                          {pageCount - covered} page{pageCount - covered === 1 ? '' : 's'} not in a
                          range
                        </span>
                      )}
                    </div>
                    <div className="result-list" style={{ marginTop: 10 }}>
                      {preview.map((segment) => (
                        <div key={`${segment.start}-${segment.end}`} className="result-row">
                          <span className="thumb-file">PDF</span>
                          <div style={{ minWidth: 0 }}>
                            <div className="result-name">
                              {nameForRange(segment.start, segment.end)}
                            </div>
                            <div className="result-sub">
                              page{segment.end - segment.start === 0 ? '' : 's'} {segment.start}
                              {segment.end > segment.start ? `–${segment.end}` : ''} ·{' '}
                              {segment.end - segment.start + 1} page
                              {segment.end - segment.start === 0 ? '' : 's'}
                            </div>
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

                {plan.error && (
                  <div className="notice" style={{ marginTop: 16 }}>
                    {plan.error}
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
                      Created {result.parts.length} file
                      {result.parts.length === 1 ? '' : 's'} from {result.pages} pages ·{' '}
                      {formatBytes(totalOut)} total. Your original file is untouched.
                    </div>
                    <div className="result-list" style={{ marginTop: 12 }}>
                      {result.parts.map((part) => (
                        <div key={`${part.start}-${part.end}-done`} className="result-row">
                          <span className="thumb-file">PDF</span>
                          <div style={{ minWidth: 0 }}>
                            <div className="result-name">{nameFor(part)}</div>
                            <div className="result-sub">
                              {part.end - part.start + 1} page
                              {part.end - part.start === 0 ? '' : 's'} ·{' '}
                              {formatBytes(part.blob.size)}
                            </div>
                          </div>
                          <button
                            className="btn btn-sm"
                            onClick={() => downloadBlob(part.blob, nameFor(part))}
                            aria-label={`Download ${nameFor(part)}`}
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
                    onClick={split}
                    disabled={busy || pageCount === null || Boolean(plan.error) || plan.segments.length === 0}
                  >
                    {busy
                      ? built
                        ? `Splitting ${built.done} of ${built.total}…`
                        : 'Splitting locally…'
                      : `Split into ${plan.segments.length || '…'} file${
                          plan.segments.length === 1 ? '' : 's'
                        }`}
                  </button>
                  {result && (
                    <button className="btn" onClick={downloadAll} disabled={zipping}>
                      <DownloadIcon size={16} />{' '}
                      {zipping
                        ? 'Zipping locally…'
                        : result.parts.length === 1
                          ? `Download (${formatBytes(result.parts[0].blob.size)})`
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
            <span className="panel-title">Copied, not re-rendered</span>
            <p className="small muted">
              Each part is a new PDF that points at the same page content as the original. Text
              stays selectable, images keep their resolution, and there is no upload step to leak a
              contract or a medical record.
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
                  <CheckIcon size={15} /> Put the parts back together
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-remove-pages" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Delete pages instead of splitting
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-reorder" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Change the page order first
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-page-numbers" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Number each part before sharing
                </Link>
              </li>
              <li>
                <Link to="/guides/split-pdf-without-upload" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Guide: what a split keeps and drops
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="section">
        <div className="container prose">
          <h2>Questions people ask before splitting</h2>
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
