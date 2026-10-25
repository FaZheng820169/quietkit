import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Dropzone } from '../components/Dropzone'
import { AdSlot } from '../components/AdSlot'
import { DownloadIcon, FileIcon, LockIcon, CheckIcon, TrashIcon } from '../components/Icons'
import { downloadBlob, formatBytes } from '../lib/files'
import { EncryptedPdfError } from '../lib/pdfErrors'
import { parsePageOrder } from '../lib/ranges'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'Does reordering affect quality?',
    a: 'No. Pages are copied into a new document as they are, so text stays real text, images keep their original encoding and nothing is re-rasterised. The file size is usually within a few percent of the original.',
  },
  {
    q: 'What happens to bookmarks and the outline?',
    a: 'They are dropped. QuietKit rebuilds the document from the pages, and the navigation outline lives outside the pages. The visible content is intact, but a reader who relied on “Chapter 3 → page 41” will need the new page numbers. For long reports, reorder before you add bookmarks rather than after.',
  },
  {
    q: 'What about links between pages and form fields?',
    a: 'A link that jumps to another page keeps its target page number, which no longer matches after pages move — check the links afterwards if you moved the pages they point to. Fillable form fields are defined at document level, so they can render but stop being editable after a rebuild. If the form must stay fillable, reorder the source document instead.',
  },
  {
    q: 'How do I move just one page to the front?',
    a: 'List the new order: for a 5-page file, “4, 1-3, 5” puts page 4 first and leaves the rest in sequence. Ranges are shorthand, so most edits are two or three numbers rather than a full list.',
  },
  {
    q: 'Is the PDF uploaded?',
    a: 'No. The file is read into this tab, the pages are copied in a new order in memory, and the result is downloaded. Nothing is transmitted.',
  },
]

export function PdfReorder() {
  useSeo({
    ...routeMeta('/tools/pdf-reorder'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit PDF Page Reorder',
          'Rearrange the pages of a PDF with a simple order list, locally in the browser.',
          '/tools/pdf-reorder',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [file, setFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState<number | null>(null)
  const [order, setOrder] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ blob: Blob; pages: number; moved: number } | null>(null)

  const pick = async (files: File[]) => {
    const pdf = files.find(
      (entry) => entry.type === 'application/pdf' || /\.pdf$/i.test(entry.name),
    )
    if (!pdf) return
    setFile(pdf)
    setPageCount(null)
    setOrder('')
    setResult(null)
    setError(null)
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
    setOrder('')
    setResult(null)
    setError(null)
  }

  const status = (() => {
    if (!file || pageCount === null) return null
    if (!order.trim()) return { ok: true, message: `Original order · ${pageCount} pages` }
    try {
      parsePageOrder(order, pageCount)
      return { ok: true, message: `All ${pageCount} pages listed exactly once` }
    } catch (caught) {
      return { ok: false, message: caught instanceof Error ? caught.message : 'Check the order.' }
    }
  })()

  const reverse = () => {
    if (!pageCount) return
    setOrder(
      Array.from({ length: pageCount }, (_, index) => pageCount - index).join(', '),
    )
    setResult(null)
  }

  const build = async () => {
    if (!file || pageCount === null) return
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      const { reorderPdfPages } = await import('../lib/pdf')
      setResult(await reorderPdfPages(file, order))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not reorder this PDF.')
    } finally {
      setBusy(false)
    }
  }

  const download = () => {
    if (!result || !file) return
    downloadBlob(result.blob, `${file.name.replace(/\.pdf$/i, '')}-reordered.pdf`)
  }

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Documents</span>
          <h1>Put PDF pages in the right order</h1>
          <p>
            A scan came back with the signature page at the end, or the appendix in the middle.
            Type the order you want — <code>4, 1-3, 5</code> — and download the rearranged file.
            Pages are copied, not redrawn, and nothing is uploaded.
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
                hint="One file · pages keep their original quality"
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

                <div className="field" style={{ marginTop: 18 }}>
                  <label htmlFor="page-order">New page order</label>
                  <input
                    id="page-order"
                    type="text"
                    className="mono"
                    value={order}
                    onChange={(event) => {
                      setOrder(event.target.value)
                      setResult(null)
                    }}
                    placeholder={pageCount ? `e.g. 2, 1, 3-${pageCount}` : 'e.g. 2, 1, 3-5'}
                    autoComplete="off"
                  />
                  {status && (
                    <p className="small" style={{ marginTop: 8, color: status.ok ? 'var(--forest)' : 'var(--danger)' }}>
                      {status.message}
                    </p>
                  )}
                  <p className="small muted" style={{ marginTop: 8 }}>
                    Ranges are expanded in the order you write them. Leave the box empty to keep the
                    original order; the reverse button fills it in so you can check the result
                    before applying.
                  </p>
                </div>

                <div className="row" style={{ marginTop: 4 }}>
                  <button className="btn btn-sm" onClick={reverse} disabled={!pageCount}>
                    Reverse order
                  </button>
                  <button className="btn btn-sm" onClick={() => { setOrder(''); setResult(null) }} disabled={!order}>
                    Keep original order
                  </button>
                </div>

                {error && (
                  <div className="notice notice-error" style={{ marginTop: 16 }}>
                    {error}
                  </div>
                )}

                <div className="row" style={{ marginTop: 20, justifyContent: 'space-between' }}>
                  <button
                    className="btn btn-forest"
                    onClick={build}
                    disabled={busy || pageCount === null || (status ? !status.ok : true)}
                  >
                    {busy ? 'Rebuilding locally…' : 'Reorder pages'}
                  </button>
                  {result && (
                    <button className="btn" onClick={download}>
                      <DownloadIcon size={16} /> Download ({formatBytes(result.blob.size)})
                    </button>
                  )}
                </div>

                {result && (
                  <div className="notice notice-ok" style={{ marginTop: 16 }}>
                    {result.pages} pages · {result.moved === 0 ? 'order unchanged' : `${result.moved} pages moved`} ·
                    original file untouched.
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
            <span className="panel-title">Pages, not pixels</span>
            <p className="small muted">
              Each page is copied into a new document intact — same fonts, same images, same
              rotation. Only the order of the pages changes.
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
                  <CheckIcon size={15} /> Remove a page entirely
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-rotate" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Rotate the sideways scans
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-text" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Copy the text out of it
                </Link>
              </li>
              <li>
                <Link to="/tools/jpg-to-pdf" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Build a PDF from photos
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="section">
        <div className="container-narrow prose">
          <h2>When page order goes wrong</h2>
          <p>
            Three patterns cover most of it. A duplex scanner returns the back sides in reverse, so
            a 20-page contract comes back as 1, 3, 5… 20, 18, 16… — reversable in one click. A
            signed page arrives as its own file and gets merged at the end. And an appendix is
            written last but belongs in the middle, which no scanner can know.
          </p>
          <p>
            Editing order in a viewer means dragging thumbnails and hoping the drop lands between
            the right two pages. Writing the order down is precise, repeatable, and reviewable
            before you commit.
          </p>

          <h2>How the order string works</h2>
          <p>
            Commas separate positions; ranges are shorthand. For a 6-page file:
          </p>
          <ul>
            <li><code>1-6</code> — unchanged.</li>
            <li><code>2, 1, 3-6</code> — swap the first two pages.</li>
            <li><code>6, 1-5</code> — last page to the front.</li>
            <li><code>1-5, 6</code> — the file you already have.</li>
          </ul>
          <p>
            Every page must appear exactly once. That rule is enforced rather than assumed: a
            missing page or a duplicate stops the tool with a message that names the problem,
            because silently appending the leftovers would produce a document nobody asked for.
          </p>

          <h2>What is preserved, and what is not</h2>
          <p>
            Page content, fonts, embedded images, vector art and page rotation all survive. Three
            things live outside the page objects and do not: the outline (bookmarks), document-level
            form fields, and metadata such as the original author and title — QuietKit writes its
            own. If those matter, reorder in the source application instead.
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
