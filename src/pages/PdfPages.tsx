import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Dropzone } from '../components/Dropzone'
import { AdSlot } from '../components/AdSlot'
import { DownloadIcon, FileIcon, LockIcon, CheckIcon, TrashIcon } from '../components/Icons'
import { downloadBlob, formatBytes } from '../lib/files'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

type Mode = 'remove' | 'keep'
type Result = { blob: Blob; pages: number; changed: number }

const faqs = [
  {
    q: 'Can I split a PDF into two files?',
    a: 'Yes, by running it twice. To split at page 5 of a 12-page file, keep “1-5” first, download it, then keep “6-12” and download again. Each run takes a second and the original file is never modified.',
  },
  {
    q: 'What does “1-3, 7, 10-” mean?',
    a: 'It selects pages 1 to 3, page 7, and everything from page 10 to the end. The same box is used for both modes: with “Remove” those pages are deleted, with “Keep only” everything else is deleted.',
  },
  {
    q: 'Does removing pages reduce quality of the rest?',
    a: 'No. QuietKit copies the remaining page objects into a new document. Text stays selectable, links and images are unchanged, because nothing is rasterised or re-compressed.',
  },
  {
    q: 'Is my PDF uploaded to a server?',
    a: 'No. The file is read into this tab and written back out in memory. There is no upload step, which is why you can turn off the network after the page loads and still finish the job.',
  },
  {
    q: 'Why does it refuse my password-protected PDF?',
    a: 'A PDF that needs a password to open must be decrypted by your reader first. Open it, save an unprotected copy, and then edit that copy here.',
  },
]

export function PdfPages() {
  useSeo({
    ...routeMeta('/tools/pdf-remove-pages'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit PDF Page Editor',
          'Remove or extract pages from a PDF locally in the browser without uploading it.',
          '/tools/pdf-remove-pages',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [file, setFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState<number | null>(null)
  const [mode, setMode] = useState<Mode>('remove')
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
      const { editPdfPages } = await import('../lib/pdf')
      const edited = await editPdfPages(file, range, mode)
      setResult(edited)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not edit this PDF.')
    } finally {
      setBusy(false)
    }
  }

  const download = () => {
    if (!result || !file) return
    const base = file.name.replace(/\.pdf$/i, '')
    downloadBlob(result.blob, `${base}-${mode === 'remove' ? 'edited' : 'extract'}.pdf`)
  }

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Documents</span>
          <h1>Remove pages from a PDF, or pull pages out</h1>
          <p>
            Delete the blank page a scanner added, drop an appendix, or extract a signed page into
            its own file. The PDF is edited in this tab and never leaves your device.
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
                hint="One file · pages are copied, never rasterised"
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
                    <span className="field-label">What should happen to these pages?</span>
                    <div className="segmented">
                      <button aria-pressed={mode === 'remove'} onClick={() => setMode('remove')}>
                        Remove them
                      </button>
                      <button aria-pressed={mode === 'keep'} onClick={() => setMode('keep')}>
                        Keep only them
                      </button>
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="page-range">Pages</label>
                    <input
                      id="page-range"
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
                      {mode === 'remove'
                        ? 'These pages will be deleted; everything else is kept in order.'
                        : 'Only these pages will be kept; the rest are dropped.'}
                    </p>
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
                    disabled={!range.trim() || busy || pageCount === null}
                  >
                    {busy ? 'Editing locally…' : mode === 'remove' ? 'Remove pages' : 'Extract pages'}
                  </button>
                  {result && (
                    <button className="btn" onClick={download}>
                      <DownloadIcon size={16} /> Download ({formatBytes(result.blob.size)})
                    </button>
                  )}
                </div>

                {result && (
                  <div className="notice notice-ok" style={{ marginTop: 16 }}>
                    {mode === 'remove'
                      ? `Removed ${result.changed} page${result.changed === 1 ? '' : 's'}. `
                      : `Extracted ${result.pages} page${result.pages === 1 ? '' : 's'}. `}
                    The result has {result.pages} page{result.pages === 1 ? '' : 's'}. Your original
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
            <span className="panel-title">Edited in place</span>
            <p className="small muted">
              Pages are copied into a new document and saved from memory. Nothing is uploaded, so
              there is no copy of your contract or medical record on someone else's disk.
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
                  <CheckIcon size={15} /> Merge the result back into one file
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-rotate" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Rotate a sideways scan instead
                </Link>
              </li>
              <li>
                <Link to="/guides/merge-pdf-without-upload" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Guide: why local PDF tools matter
                </Link>
              </li>
              <li>
                <Link to="/tools/image-compressor" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Shrink scanned pages first
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="section">
        <div className="container-narrow prose">
          <h2>What the page range box accepts</h2>
          <ul>
            <li><code>5</code> — one page.</li>
            <li><code>1-3</code> — a closed range, pages 1, 2 and 3.</li>
            <li><code>10-</code> — page 10 to the end, however long the document is.</li>
            <li><code>-2</code> — page 2 and everything before it.</li>
            <li><code>1-3, 7, 10-</code> — combine as many as you like, separated by commas.</li>
          </ul>
          <p>
            Duplicates are ignored, so <code>1-5, 3</code> is the same as <code>1-5</code>. Anything
            outside the document is rejected with the real page count, rather than silently
            producing a broken file.
          </p>

          <h2>Why local editing matters for these files</h2>
          <p>
            The PDFs people most often want to split are the ones they would least like to hand to
            an anonymous website: signed contracts, bank statements, medical letters, passport
            scans, tenancy agreements. A free “split PDF online” service has to store the file for
            at least a few minutes to process it, and its privacy policy decides what happens next.
          </p>
          <p>
            This tool has no server to store anything on. The consequence is testable: open your
            browser's Network panel while editing, and you will not see the file leave.
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
