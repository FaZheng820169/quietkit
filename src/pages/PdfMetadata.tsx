import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Dropzone } from '../components/Dropzone'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, DownloadIcon, FileIcon, LockIcon, TrashIcon } from '../components/Icons'
import type { MetaRisk, PdfCleanResult, PdfMetadataReport } from '../lib/pdfMeta'
import { baseName, downloadBlob, formatBytes } from '../lib/files'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const RISK_LABEL: Record<MetaRisk, string> = {
  identity: 'names a person',
  software: 'names the software',
  timeline: 'reveals when it was made',
  content: 'describes the contents',
  other: 'custom property',
}

const faqs = [
  {
    q: 'Where does PDF metadata come from?',
    a: 'Whoever produced the file writes it. Word and LaTeX fill in Title, Author and the application name; a scanner adds its own model as Producer; a “print to PDF” driver adds the printer and often the computer name. Acrobat and Preview expose all of it under File → Properties.',
  },
  {
    q: 'What exactly does QuietKit remove?',
    a: 'Three things: every entry in the document information dictionary (Title, Author, Subject, Keywords, Creator, Producer, both dates and any custom fields such as Company), the XMP metadata packet stored in the document catalog, and the trailer file identifier. Page content — text, images, vectors, fonts and page size — is copied through untouched.',
  },
  {
    q: 'Will the document look any different afterwards?',
    a: 'No. Nothing is re-rendered, re-compressed or flattened, so the pages are byte-for-byte the same objects. The only change is that the property block is now empty and the XMP packet is gone. Reopen the download and check File → Properties: the fields are blank.',
  },
  {
    q: 'Which metadata can this not remove?',
    a: 'Anything that is part of the visible page: the text itself, a scanned signature, a printed footer, and the XMP blocks buried inside embedded images. The original image still carries its own camera and GPS data, so run photos through the photo metadata cleaner before building the PDF. Font names embedded in the page resources are also left alone.',
  },
  {
    q: 'Can an encrypted or password-protected PDF be cleaned?',
    a: 'Yes, and it stays encrypted with the same password. The property strings are encrypted too, which is why the table above cannot show them without the password — QuietKit removes the whole property block instead of trying to read it. If the file only forbids editing through a permissions flag, some viewers may still ask for the owner password before they will open the result.',
  },
  {
    q: 'Does stripping metadata make the file smaller?',
    a: 'A little — usually a few kilobytes, more if the file carried a large XMP history packet. This is a privacy tool, not a compressor: for a real size reduction, compress the photos first and then rebuild the PDF.',
  },
]

export function PdfMetadata() {
  useSeo({
    ...routeMeta('/tools/pdf-metadata'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit PDF Metadata Viewer',
          'Inspect and remove the author, producer, dates and XMP packet a PDF carries about itself — entirely in the browser.',
          '/tools/pdf-metadata',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [file, setFile] = useState<File | null>(null)
  const [report, setReport] = useState<PdfMetadataReport | null>(null)
  const [reading, setReading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PdfCleanResult | null>(null)

  const pick = async (files: File[]) => {
    const pdf = files.find(
      (entry) => entry.type === 'application/pdf' || /\.pdf$/i.test(entry.name),
    )
    if (!pdf) return

    setFile(pdf)
    setReport(null)
    setResult(null)
    setError(null)
    setReading(true)
    try {
      const { inspectPdfMetadata } = await import('../lib/pdfMeta')
      const next = await inspectPdfMetadata(pdf)
      setReport(next)
    } catch {
      setError('This PDF could not be read. It may be damaged or use an unsupported encryption.')
    } finally {
      setReading(false)
    }
  }

  const reset = () => {
    setFile(null)
    setReport(null)
    setResult(null)
    setError(null)
  }

  const clean = async () => {
    if (!file) return
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      const { stripPdfMetadata } = await import('../lib/pdfMeta')
      const cleaned = await stripPdfMetadata(file)
      setResult(cleaned)
    } catch {
      setError('Could not rewrite this PDF. It may be damaged or use an unsupported encryption.')
    } finally {
      setBusy(false)
    }
  }

  const download = () => {
    if (!result || !file) return
    downloadBlob(result.blob, `${baseName(file.name)}-clean.pdf`)
  }

  const fields = report?.fields ?? []
  const xmpPresent = (report?.xmpBytes ?? 0) > 0
  const nothingToRemove = report !== null && fields.length === 0 && !xmpPresent

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Privacy</span>
          <h1>See what a PDF says about you, then take it out</h1>
          <p>
            Every PDF carries a property block: who wrote it, which program produced it, when, and
            often the company and computer name. Read it field by field, then download a copy with
            the block emptied — the pages themselves are untouched.
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
                hint="One file · properties are read locally · nothing is uploaded"
                icon={<FileIcon size={30} />}
                onFiles={pick}
              />
            ) : (
              <>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="panel-title" style={{ marginBottom: 0 }}>
                    {file.name} · {formatBytes(file.size)}
                  </span>
                  <button className="btn btn-sm" onClick={reset}>
                    <TrashIcon size={14} /> Start over
                  </button>
                </div>

                {reading && (
                  <p className="small muted" style={{ marginTop: 14 }}>
                    Reading the properties locally…
                  </p>
                )}

                {error && (
                  <div className="notice notice-error" style={{ marginTop: 16 }}>
                    {error}
                  </div>
                )}

                {report && (
                  <>
                    <div
                      className="stat-grid"
                      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}
                    >
                      <dl className="stat">
                        <dt>Pages</dt>
                        <dd>{report.pageCount}</dd>
                      </dl>
                      <dl className="stat">
                        <dt>File size</dt>
                        <dd>{formatBytes(file.size)}</dd>
                      </dl>
                      <dl className="stat">
                        <dt>Properties</dt>
                        <dd>{report.encrypted ? '—' : fields.length}</dd>
                      </dl>
                      <dl className="stat">
                        <dt>XMP packet</dt>
                        <dd>{xmpPresent ? formatBytes(report.xmpBytes) : 'None'}</dd>
                      </dl>
                    </div>

                    {report.encrypted && (
                      <div className="notice notice-error" style={{ marginTop: 16, display: 'block' }}>
                        <strong>This PDF is encrypted.</strong>
                        <div style={{ marginTop: 6 }}>
                          Its property strings are encrypted too, so they cannot be shown without the
                          password. QuietKit can still delete the property block and the XMP packet;
                          the file stays encrypted with the same password.
                        </div>
                      </div>
                    )}

                    {!report.encrypted && !nothingToRemove && (
                      <div style={{ marginTop: 18 }}>
                        <span className="panel-title">
                          {fields.length === 1 ? '1 document property' : `${fields.length} document properties`}
                        </span>
                        <table className="kv">
                          <tbody>
                            {fields.map((field) => (
                              <tr key={`${field.key}-${field.value}`}>
                                <th>
                                  {field.label}
                                  <span
                                    style={{
                                      display: 'block',
                                      marginTop: 2,
                                      fontFamily: 'var(--mono)',
                                      fontSize: 10.5,
                                      fontWeight: 400,
                                      letterSpacing: '0.04em',
                                      color: field.risk === 'identity' ? 'var(--danger)' : 'var(--ink-3)',
                                    }}
                                  >
                                    {RISK_LABEL[field.risk]}
                                  </span>
                                </th>
                                <td>{field.value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {!report.encrypted && nothingToRemove && (
                      <div className="notice notice-ok" style={{ marginTop: 16 }}>
                        No document properties and no XMP packet in this file. There is nothing to
                        strip — the producer left the property block empty.
                      </div>
                    )}

                    {report.xmpBytes === 0 && !nothingToRemove && (
                      <p className="tiny muted" style={{ marginTop: 10 }}>
                        No XMP packet — older or minimal producers write only the property table.
                      </p>
                    )}

                    <div style={{ marginTop: 20 }}>
                      <span className="panel-title">Page size</span>
                      <table className="kv">
                        <tbody>
                          {report.pageSizes.map((size) => (
                            <tr key={`${size.width}x${size.height}-${size.rotation}`}>
                              <th>{size.label}</th>
                              <td>
                                {size.width} × {size.height} pt · {size.count} page
                                {size.count === 1 ? '' : 's'}
                                {size.rotation ? ` · rotated ${size.rotation}°` : ''}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="row" style={{ marginTop: 22, justifyContent: 'space-between' }}>
                      <button className="btn btn-forest" onClick={clean} disabled={busy}>
                        {busy ? 'Stripping locally…' : 'Remove all metadata'}
                      </button>
                      {result && (
                        <button className="btn" onClick={download}>
                          <DownloadIcon size={16} /> Download ({formatBytes(result.blob.size)})
                        </button>
                      )}
                    </div>

                    {result && (
                      <div className="notice notice-ok" style={{ marginTop: 16, display: 'block' }}>
                        {result.fieldsRemoved === 0 && !result.xmpRemoved && !result.idRemoved ? (
                          <>Nothing needed removing — this file carried no properties.</>
                        ) : (
                          <>
                            Removed {result.fieldsRemoved} document propert
                            {result.fieldsRemoved === 1 ? 'y' : 'ies'}
                            {result.xmpRemoved ? ', the XMP packet' : ''}
                            {result.idRemoved ? ' and the file identifier' : ''}. Page content is
                            unchanged.
                          </>
                        )}
                        <div style={{ marginTop: 6 }}>
                          Open the download and check File → Properties to confirm the fields are
                          blank. The original file is still on your disk.
                        </div>
                      </div>
                    )}
                  </>
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
            <span className="panel-title">What leaves with the block</span>
            <p className="small muted">
              The author name, the software chain that produced the file, both timestamps with the
              timezone they were written in, and any custom fields — Company, SourceApplication,
              document number.
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
                  <CheckIcon size={15} /> Drop a blank or sensitive page
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-merge" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Merge the cleaned files
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-text" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Read what the pages actually say
                </Link>
              </li>
              <li>
                <Link to="/tools/metadata-cleaner" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Clean the photos before they go in
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="section">
        <div className="container-narrow prose">
          <h2>A property block nobody reads, until someone does</h2>
          <p>
            Open any PDF, press File → Properties in Acrobat, Preview or Edge, and a small table
            appears: Title, Author, Subject, Keywords, Creator, Producer, Creation Date, Modified
            Date. Most people have never looked. When you send a CV, a signed contract, a client
            report or a listing for a template you sell, that table goes along with it.
          </p>
          <p>
            The values are rarely neutral. A scan from an office multifunction printer often lists
            the device and a department. A Word export lists the document manager or the author on
            the licence. A PDF printed from a browser can carry the computer name. Custom fields are
            worse, because nothing in a viewer shows them prominently — <code>/Company</code>, an
            internal project code, a source application.
          </p>

          <h2>Two places, not one</h2>
          <p>
            PDF metadata lives in two different structures, and a tool that clears only one leaves
            the other behind. The <strong>information dictionary</strong> is a small trailer object:
            the table you see in the properties dialog. The <strong>XMP packet</strong> is a separate
            XML stream stored in the document catalog, written by Adobe tools, scanned by editors,
            and frequently containing a full editing history — the tool that created the file, the
            tool that converted it, and the tool that last saved it.
          </p>
          <p>
            QuietKit empties the first and drops the second, plus the trailer file identifier, in one
            pass. It does this by editing the parsed document in memory and writing a fresh copy, so
            the file is rebuilt without the metadata objects rather than patched incrementally —
            nothing of the old block survives at the end of the file.
          </p>

          <h2>What stays, on purpose</h2>
          <p>
            Page content is copied through unchanged: text stays selectable, scans stay scans,
            vectors stay vectors, and bookmarks and links keep working. What this tool cannot reach
            is metadata that is part of the page or part of an embedded image. If a scanned page
            contains a printed footer with a name, that footer is content, not metadata. If a photo
            was placed into the PDF, the JPEG inside still carries its own EXIF and XMP — clean the
            photo first, then build the PDF.
          </p>
          <p>
            One caveat worth stating plainly: archival PDF/A files rely on the XMP packet to declare
            their conformance. Stripping it keeps every page intact but drops the PDF/A claim, and a
            validator will notice. If the file must stay PDF/A, do not clean it.
          </p>

          <h2>When it is worth doing</h2>
          <ul>
            <li>Sending a CV, a portfolio or a grant application — the author field is often your full legal name.</li>
            <li>Delivering a client document produced from an internal template that carries a project code.</li>
            <li>Publishing a template, planner or ebook you sell: buyers should not receive your machine name.</li>
            <li>Sharing a PDF publicly where the creation date and software chain are nobody's business.</li>
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
