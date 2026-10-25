import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Dropzone } from '../components/Dropzone'
import { AdSlot } from '../components/AdSlot'
import { DownloadIcon, FileIcon, TrashIcon, LockIcon, CheckIcon } from '../components/Icons'
import { downloadBlob, formatBytes } from '../lib/files'
import { faqJsonLd, toolJsonLd, useSeo } from '../lib/seo'

type Part = { id: string; file: File; pages?: number; error?: string }

const faqs = [
  {
    q: 'Is there a page limit?',
    a: 'No page limit is imposed by QuietKit. The limit is your device memory — merging a few hundred pages is routine; multi-gigabyte scans may exhaust memory on older machines.',
  },
  {
    q: 'Can I choose the order of the documents?',
    a: 'Yes. Move files up and down in the list before merging. Pages inside each PDF keep their original order.',
  },
  {
    q: 'Are password-protected PDFs supported?',
    a: 'Files that open without a password usually work. If a PDF requires a password to open, the browser cannot read it and you should unlock it in your PDF reader first.',
  },
  {
    q: 'Does merging reduce quality?',
    a: 'No. QuietKit copies the existing pages into a new document without rasterising them, so text stays selectable and images keep their original resolution.',
  },
]

export function PdfMerge() {
  useSeo({
    title: 'Merge PDF files locally — no upload | QuietKit',
    description:
      'Combine several PDFs into one document in the order you choose. Everything happens inside your browser, so contracts and scans never leave your device.',
    path: '/tools/pdf-merge',
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit PDF Merge',
          'Merge multiple PDF files into one document locally in the browser.',
          '/tools/pdf-merge',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [parts, setParts] = useState<Part[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ blob: Blob; pages: number } | null>(null)

  const addFiles = async (files: File[]) => {
    const pdfs = files.filter((file) => file.type === 'application/pdf' || /\.pdf$/i.test(file.name))
    if (pdfs.length === 0) return
    const additions: Part[] = pdfs.map((file) => ({
      id: `${file.name}-${file.size}-${Math.random()}`,
      file,
    }))
    setParts((prev) => [...prev, ...additions])
    setResult(null)
    setError(null)

    const { countPdfPages } = await import('../lib/pdf')
    for (const part of additions) {
      try {
        const pages = await countPdfPages(part.file)
        setParts((prev) => prev.map((entry) => (entry.id === part.id ? { ...entry, pages } : entry)))
      } catch {
        setParts((prev) =>
          prev.map((entry) =>
            entry.id === part.id ? { ...entry, error: 'Password-protected or damaged' } : entry,
          ),
        )
      }
    }
  }

  const move = (index: number, direction: -1 | 1) => {
    setParts((prev) => {
      const next = [...prev]
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
    setResult(null)
  }

  const remove = (id: string) => {
    setParts((prev) => prev.filter((part) => part.id !== id))
    setResult(null)
  }

  const merge = async () => {
    const usable = parts.filter((part) => !part.error)
    if (usable.length < 2) return
    setBusy(true)
    setError(null)
    try {
      const { mergePdfs } = await import('../lib/pdf')
      const merged = await mergePdfs(usable.map((part) => part.file))
      setResult(merged)
    } catch {
      setError('One of the files could not be read. Remove it and try again.')
    } finally {
      setBusy(false)
    }
  }

  const download = () => {
    if (!result) return
    downloadBlob(result.blob, 'quietkit-merged.pdf')
  }

  const totalPages = parts.reduce((sum, part) => sum + (part.pages || 0), 0)
  const canMerge = parts.filter((part) => !part.error).length >= 2

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Documents</span>
          <h1>Merge PDFs without handing them to a server</h1>
          <p>
            Add two or more PDFs, drag them into the order you want, and get a single file back.
            Contracts, invoices and scans stay on your device the whole time.
          </p>
        </div>
      </section>

      <div className="container workspace">
        <div>
          <div className="panel">
            {parts.length === 0 ? (
              <Dropzone
                accept="application/pdf,.pdf"
                multiple
                title="Drop PDFs here, or click to choose"
                hint="Two or more files · pages are copied, never rasterised"
                icon={<FileIcon size={30} />}
                onFiles={addFiles}
              />
            ) : (
              <>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="panel-title" style={{ marginBottom: 0 }}>
                    {parts.length} files · {totalPages || '…'} pages
                  </span>
                  <button
                    className="btn btn-sm"
                    onClick={() => {
                      setParts([])
                      setResult(null)
                    }}
                  >
                    <TrashIcon size={14} /> Clear
                  </button>
                </div>

                <div className="result-list">
                  {parts.map((part, index) => (
                    <div key={part.id} className="result-row">
                      <span className="thumb-file">PDF</span>
                      <div style={{ minWidth: 0 }}>
                        <div className="result-name">{part.file.name}</div>
                        <div className="result-sub">
                          {part.error ? (
                            <span style={{ color: 'var(--danger)' }}>{part.error}</span>
                          ) : part.pages !== undefined ? (
                            `${part.pages} page${part.pages === 1 ? '' : 's'} · ${formatBytes(part.file.size)}`
                          ) : (
                            'reading…'
                          )}
                        </div>
                      </div>
                      <div className="row" style={{ gap: 6 }}>
                        <button
                          className="btn btn-sm"
                          onClick={() => move(index, -1)}
                          disabled={index === 0}
                          aria-label={`Move ${part.file.name} up`}
                        >
                          ↑
                        </button>
                        <button
                          className="btn btn-sm"
                          onClick={() => move(index, 1)}
                          disabled={index === parts.length - 1}
                          aria-label={`Move ${part.file.name} down`}
                        >
                          ↓
                        </button>
                        <button
                          className="btn btn-sm"
                          onClick={() => remove(part.id)}
                          aria-label={`Remove ${part.file.name}`}
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 16 }}>
                  <label className="btn btn-sm" style={{ cursor: 'pointer' }}>
                    <FileIcon size={14} /> Add more PDFs
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      multiple
                      className="sr-only"
                      onChange={(event) => {
                        if (event.target.files) addFiles(Array.from(event.target.files))
                        event.currentTarget.value = ''
                      }}
                    />
                  </label>
                </div>

                {error && (
                  <div className="notice notice-error" style={{ marginTop: 16 }}>
                    {error}
                  </div>
                )}

                <div className="row" style={{ marginTop: 20, justifyContent: 'space-between' }}>
                  <button className="btn btn-forest" onClick={merge} disabled={!canMerge || busy}>
                    {busy ? 'Merging locally…' : `Merge ${parts.filter((p) => !p.error).length} PDFs`}
                  </button>
                  {result && (
                    <button className="btn" onClick={download}>
                      <DownloadIcon size={16} /> Download ({formatBytes(result.blob.size)})
                    </button>
                  )}
                </div>

                {result && (
                  <div className="notice notice-ok" style={{ marginTop: 16 }}>
                    Merged {result.pages} pages into one document. Your original files are untouched.
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
            <span className="panel-title">Kept intact</span>
            <p className="small muted">
              Pages are copied into a new PDF structure. Text stays selectable, links and
              bookmarks are preserved, and nothing is re-compressed.
            </p>
            <div className="row" style={{ marginTop: 14 }}>
              <LockIcon size={16} /> <span className="small">Local merge · 0 bytes uploaded</span>
            </div>
          </div>

          <div className="panel">
            <span className="panel-title">Related</span>
            <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
              <li>
                <Link to="/tools/image-compressor" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Compress scanned images first
                </Link>
              </li>
              <li>
                <Link to="/tools/metadata-cleaner" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Remove photo metadata
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="section">
        <div className="container-narrow prose">
          <h2>Merging PDFs is a copy job, not a conversion</h2>
          <p>
            A PDF is a container of objects: pages, fonts, images and the instructions that place
            them. Merging does not turn pages into pictures. QuietKit opens each document, copies
            its page objects into a new container, and writes the result. Text remains text,
            vectors remain vectors, and image data is copied byte for byte.
          </p>
          <p>
            That is why the output looks identical to the inputs rather than “slightly softer”.
            Upload-based merge services often re-render pages to normalise them, which is how a
            crisp scan comes back fuzzy.
          </p>

          <h3>When merging fails</h3>
          <ul>
            <li>Encrypted PDFs: remove the open password in your PDF reader, then retry.</li>
            <li>Damaged downloads: open the file once locally to confirm it renders.</li>
            <li>Very large scans: close other tabs; the merge needs the whole document set in memory.</li>
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
