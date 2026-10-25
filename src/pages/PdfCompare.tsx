import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Dropzone } from '../components/Dropzone'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, FileIcon, LockIcon, TrashIcon } from '../components/Icons'
import { formatBytes } from '../lib/files'
import { EncryptedPdfError } from '../lib/pdfErrors'
import type { DiffResult, PdfCompareSession } from '../lib/pdfCompare'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'What exactly counts as a difference?',
    a: 'Any pixel that is not the same colour in both pages. Both pages are rendered at the same size and compared channel by channel, with a small tolerance so the anti-aliasing fuzz along letter edges is ignored. A changed word, a moved paragraph, a swapped image or a new stamp all change pixels; a file that was re-saved without real changes usually shows nothing at all.',
  },
  {
    q: 'Why compare pictures of the pages instead of the text?',
    a: 'Because the page is what a reader actually sees. A text comparison reports edited words but misses a replaced logo, a moved signature block or a chart that now says something different. The visual comparison catches all of that. The trade-off: it shows where something changed, not which word was edited.',
  },
  {
    q: 'The two files have different page counts. What happens?',
    a: 'You can page through as far as the longer document goes. Pages that exist in only one file are marked as missing on the other side in the side-by-side view, and the highlight view skips them — there is nothing to compare them against.',
  },
  {
    q: 'Will it list every change in a 200-page contract?',
    a: 'No. The comparison covers the page you are looking at, one page at a time — it is built for checking a revised quote, a reissued certificate or this month’s report against last month’s, not for auditing a whole book. Identical pages say so explicitly, so you can move through them quickly.',
  },
  {
    q: 'Do the two files get uploaded anywhere?',
    a: 'No. Both PDFs are opened by the PDF renderer already inside your browser, and the comparison happens in this tab’s memory. Open the network monitor while you compare: no request carries either file. Close the tab and both are gone.',
  },
]

function pickPdf(files: File[]): File | null {
  return (
    files.find((entry) => entry.type === 'application/pdf' || /\.pdf$/i.test(entry.name)) ?? null
  )
}

export function PdfCompare() {
  useSeo({
    ...routeMeta('/tools/pdf-compare'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit PDF Compare',
          'Put two versions of a PDF side by side, page through them together and highlight what changed, pixel by pixel — entirely in the browser.',
          '/tools/pdf-compare',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [fileA, setFileA] = useState<File | null>(null)
  const [fileB, setFileB] = useState<File | null>(null)
  const [session, setSession] = useState<PdfCompareSession | null>(null)
  const [opening, setOpening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [mode, setMode] = useState<'side' | 'diff'>('side')
  const [hasA, setHasA] = useState(true)
  const [hasB, setHasB] = useState(true)
  const [sideBusy, setSideBusy] = useState(false)
  const [diff, setDiff] = useState<DiffResult | null>(null)
  const [diffBusy, setDiffBusy] = useState(false)

  const canvasA = useRef<HTMLCanvasElement>(null)
  const canvasB = useRef<HTMLCanvasElement>(null)
  const diffCanvas = useRef<HTMLCanvasElement>(null)
  const sessionRef = useRef<PdfCompareSession | null>(null)

  // The open documents are released when the tab closes or the session ends.
  useEffect(
    () => () => {
      void sessionRef.current?.destroy()
    },
    [],
  )

  const open = async (a: File, b: File) => {
    void sessionRef.current?.destroy()
    sessionRef.current = null
    setSession(null)
    setOpening(true)
    setError(null)
    setPage(1)
    setMode('side')
    setDiff(null)
    try {
      const { openPdfCompare } = await import('../lib/pdfCompare')
      const created = await openPdfCompare(a, b)
      sessionRef.current = created
      setSession(created)
      setSideBusy(true)
    } catch (caught) {
      setError(
        caught instanceof EncryptedPdfError
          ? caught.message
          : 'One of these PDFs could not be read. It may be damaged.',
      )
    } finally {
      setOpening(false)
    }
  }

  const choose = (side: 'a' | 'b') => (files: File[]) => {
    const picked = pickPdf(files)
    if (!picked) {
      setError('Only PDF files can be compared here.')
      return
    }
    setError(null)
    if (side === 'a') {
      setFileA(picked)
      if (fileB) void open(picked, fileB)
    } else {
      setFileB(picked)
      if (fileA) void open(fileA, picked)
    }
  }

  const reset = () => {
    void sessionRef.current?.destroy()
    sessionRef.current = null
    setSession(null)
    setFileA(null)
    setFileB(null)
    setPage(1)
    setMode('side')
    setDiff(null)
    setError(null)
  }

  // Side-by-side rendering. Busy flags are raised by the controls that change
  // the page or view; the effect only draws and settles them.
  useEffect(() => {
    if (!session || mode !== 'side') return
    let cancelled = false
    const targetA = canvasA.current
    const targetB = canvasB.current
    void Promise.all([
      targetA ? session.renderPage('a', page, targetA, 520) : Promise.resolve(false),
      targetB ? session.renderPage('b', page, targetB, 520) : Promise.resolve(false),
    ])
      .then(([okA, okB]) => {
        if (cancelled) return
        setHasA(okA)
        setHasB(okB)
        setSideBusy(false)
      })
      .catch(() => {
        if (cancelled) return
        setError('A page could not be rendered. The file may be damaged.')
        setSideBusy(false)
      })
    return () => {
      cancelled = true
    }
  }, [session, page, mode])

  // Difference highlighting.
  useEffect(() => {
    if (!session || mode !== 'diff') return
    let cancelled = false
    void session
      .diffPage(page)
      .then((result) => {
        if (cancelled) return
        setDiff(result)
        setDiffBusy(false)
        const target = diffCanvas.current
        if (result && target) {
          target.width = result.width
          target.height = result.height
          target.getContext('2d')?.drawImage(result.canvas, 0, 0)
        }
      })
      .catch(() => {
        if (cancelled) return
        setError('This page could not be compared. The file may be damaged.')
        setDiffBusy(false)
      })
    return () => {
      cancelled = true
    }
  }, [session, page, mode])

  const pages = session?.pages ?? 0
  const go = (delta: number) => {
    setPage((current) => Math.min(pages, Math.max(1, current + delta)))
    if (mode === 'side') setSideBusy(true)
    else {
      setDiffBusy(true)
      setDiff(null)
    }
  }
  const showSide = () => {
    if (mode === 'side') return
    setMode('side')
    setSideBusy(true)
  }
  const showDiff = () => {
    if (mode === 'diff') return
    setMode('diff')
    setDiffBusy(true)
    setDiff(null)
  }
  const comparable = session ? page <= Math.min(session.a.pageCount, session.b.pageCount) : false
  // A one-word edit on a page is a few hundred pixels in a million — "0.0%"
  // would read as "nothing", so small shares say what they are.
  const diffPercent = (() => {
    if (!diff || diff.totalPixels === 0) return ''
    const percent = (100 * diff.changedPixels) / diff.totalPixels
    return percent >= 0.1 ? `${percent.toFixed(1)}%` : 'under 0.1%'
  })()

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Documents</span>
          <h1>Compare two PDFs side by side</h1>
          <p>
            Version two of a quote, a reissued certificate, a contract that came back “with small
            changes” — open both files here, page through them together and highlight exactly what
            moved. Neither file leaves your browser.
          </p>
        </div>
      </section>

      <div className="container workspace">
        <div>
          <div className="panel">
            {!session ? (
              <>
                <div className="split" style={{ gap: 20 }}>
                  <div className="field" style={{ margin: 0 }}>
                    <span className="field-label">A — the original</span>
                    {fileA ? (
                      <div className="row" style={{ justifyContent: 'space-between' }}>
                        <span className="small">
                          {fileA.name} · {formatBytes(fileA.size)}
                        </span>
                        <button className="btn btn-sm" onClick={() => setFileA(null)}>
                          Change
                        </button>
                      </div>
                    ) : (
                      <Dropzone
                        accept="application/pdf,.pdf"
                        title="Drop the original PDF"
                        hint="or click to choose — nothing is uploaded"
                        icon={<FileIcon size={26} />}
                        onFiles={choose('a')}
                      />
                    )}
                  </div>
                  <div className="field" style={{ margin: 0 }}>
                    <span className="field-label">B — the revised version</span>
                    {fileB ? (
                      <div className="row" style={{ justifyContent: 'space-between' }}>
                        <span className="small">
                          {fileB.name} · {formatBytes(fileB.size)}
                        </span>
                        <button className="btn btn-sm" onClick={() => setFileB(null)}>
                          Change
                        </button>
                      </div>
                    ) : (
                      <Dropzone
                        accept="application/pdf,.pdf"
                        title="Drop the revised PDF"
                        hint="or click to choose — nothing is uploaded"
                        icon={<FileIcon size={26} />}
                        onFiles={choose('b')}
                      />
                    )}
                  </div>
                </div>

                {opening && (
                  <p className="small muted" style={{ marginTop: 14 }}>
                    Opening both PDFs locally…
                  </p>
                )}
                {error && (
                  <div className="notice notice-error" style={{ marginTop: 16 }}>
                    {error}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="panel-title" style={{ marginBottom: 0 }}>
                    {session.a.pageCount} vs {session.b.pageCount} pages
                  </span>
                  <button className="btn btn-sm" onClick={reset}>
                    <TrashIcon size={14} /> Start over
                  </button>
                </div>

                <div className="split" style={{ gap: 20, marginTop: 12 }}>
                  <p className="small muted" style={{ margin: 0 }}>
                    A · {session.a.name} · {formatBytes(session.a.size)}
                  </p>
                  <p className="small muted" style={{ margin: 0 }}>
                    B · {session.b.name} · {formatBytes(session.b.size)}
                  </p>
                </div>

                {error && (
                  <div className="notice notice-error" style={{ marginTop: 16 }}>
                    {error}
                  </div>
                )}

                <div className="controls" style={{ marginTop: 18 }}>
                  <div className="field">
                    <span className="field-label">Page</span>
                    <div className="row">
                      <button className="btn btn-sm" onClick={() => go(-1)} disabled={page <= 1}>
                        ‹ Previous
                      </button>
                      <span className="small mono">
                        Page {page} of {pages}
                      </span>
                      <button className="btn btn-sm" onClick={() => go(1)} disabled={page >= pages}>
                        Next ›
                      </button>
                    </div>
                  </div>

                  <div className="field">
                    <span className="field-label">View</span>
                    <div className="segmented">
                      <button aria-pressed={mode === 'side'} onClick={showSide}>
                        Side by side
                      </button>
                      <button aria-pressed={mode === 'diff'} onClick={showDiff}>
                        Highlight differences
                      </button>
                    </div>
                  </div>
                </div>

                {mode === 'side' && (
                  <>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                        gap: 16,
                      }}
                    >
                      {(['a', 'b'] as const).map((side) => {
                        const has = side === 'a' ? hasA : hasB
                        const info = side === 'a' ? session.a : session.b
                        return (
                          <div key={side}>
                            <span className="field-label">
                              {side === 'a' ? 'A — original' : 'B — revised'}
                            </span>
                            <div className="pdf-preview" style={{ display: 'block', marginTop: 8 }}>
                              <canvas
                                ref={side === 'a' ? canvasA : canvasB}
                                style={{ display: has ? undefined : 'none' }}
                              />
                              {!has && (
                                <p className="small muted" style={{ padding: '26px 16px' }}>
                                  No page {page} — “{info.name}” has {info.pageCount}{' '}
                                  page{info.pageCount === 1 ? '' : 's'}.
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    {sideBusy && (
                      <p className="small muted" style={{ marginTop: 10 }}>
                        Rendering page {page}…
                      </p>
                    )}
                  </>
                )}

                {mode === 'diff' && (
                  <div style={{ marginTop: 8 }}>
                    {comparable ? (
                      <>
                        <span className="field-label">Page {page} — changes in red</span>
                        <div className="pdf-preview" style={{ display: 'block', marginTop: 8 }}>
                          <canvas ref={diffCanvas} />
                        </div>
                        {diffBusy && (
                          <p className="small muted" style={{ marginTop: 10 }}>
                            Comparing pixels…
                          </p>
                        )}
                        {!diffBusy && diff && diff.identical && (
                          <div className="notice notice-ok" style={{ marginTop: 14 }}>
                            Page {page} is pixel-identical in both files.
                          </div>
                        )}
                        {!diffBusy && diff && !diff.identical && (
                          <div className="notice" style={{ marginTop: 14 }}>
                            {diff.changedPixels.toLocaleString('en-US')} of{' '}
                            {diff.totalPixels.toLocaleString('en-US')} pixels differ on page {page}{' '}
                            ({diffPercent}).
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="notice" style={{ marginTop: 8 }}>
                        Page {page} exists in only one of the two PDFs, so there is nothing to
                        compare it against. Switch to the side-by-side view to see it.
                      </div>
                    )}
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
            <span className="panel-title">Compared in this tab</span>
            <p className="small muted">
              Both files are opened by the PDF renderer already inside your browser, and the
              comparison runs in this tab’s memory. Nothing is transmitted — switch the network
              off after the page loads and it still works.
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
                  <CheckIcon size={15} /> Merge the versions you keep
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-metadata" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Check what the properties say
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-text" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Extract the text of either file
                </Link>
              </li>
              <li>
                <Link to="/guides/merge-pdf-without-upload" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Why local beats upload
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="section">
        <div className="container-narrow prose">
          <h2>Version two arrives as an attachment</h2>
          <p>
            A supplier sends a revised quote. A landlord returns the lease “with small edits”. A
            certificate is reissued and looks, at a glance, identical. The question is always the
            same — <em>what changed?</em> — and reading both documents line by line is exactly how a
            changed bank account number or a new clause gets missed.
          </p>
          <p>
            This tool puts the two files next to each other and lets you page through them in
            lockstep. The highlight view goes further: it renders both versions of the page at the
            same size and compares them pixel by pixel, so anything a reader would notice lights up
            in red.
          </p>

          <h2>A visual diff, not a text diff</h2>
          <p>
            Comparing the text inside two PDFs answers a narrower question than it seems to. Text
            comparison finds edited words, but it is blind to a replaced logo, a chart that now
            shows different numbers, a signature block that moved or a stamp that appeared. The
            page, not the text layer, is what a reader signs off on — so the page is what gets
            compared.
          </p>
          <p>
            The comparison tolerates the tiny anti-aliasing fuzz along letter edges, which means a
            file that was simply re-saved usually compares clean. A page that was re-exported with a
            different font engine will show a fine speckle along the text; large, solid red areas
            are where content genuinely moved or changed.
          </p>

          <h2>Reading the highlight view</h2>
          <p>
            Unchanged content fades toward white; changed pixels are drawn in red, and the summary
            counts them. “Pixel-identical” is a strong statement — the two pages render to exactly
            the same image — and the tool says it explicitly when it holds, so identical pages can
            be skipped quickly. A few tenths of a percent in red is an edit; double-digit
            percentages mean the page was rebuilt.
          </p>

          <h2>When the page counts disagree</h2>
          <p>
            A revised file often gains or loses pages. Navigation runs as far as the longer
            document; in the side-by-side view, a page that exists in only one file is marked as
            missing on the other side rather than silently skipped. The highlight view needs both
            pages to exist, so it stops where the shorter document ends — a page with no
            counterpart is itself a change worth noticing.
          </p>

          <h2>What this view cannot tell you</h2>
          <p>
            It shows <em>where</em> something changed, not <em>which word</em> was edited — for
            that, open the page in both files and read the red region. A paragraph that moved down
            looks like a deletion plus an insertion, not a move. And two scans of the same paper
            document, made at different resolutions, will speckle everywhere: the comparison
            assumes both files were exported from the same source. Password-protected PDFs are
            refused rather than compared half-open — save an unprotected copy first.
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
