import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Dropzone } from '../components/Dropzone'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, DownloadIcon, FileIcon, LockIcon, TrashIcon } from '../components/Icons'
import type { PdfFormField, PdfFormFillResult, PdfFormReport } from '../lib/pdfForm'
import { baseName, downloadBlob, formatBytes } from '../lib/files'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'Does the form leave my device to be filled in?',
    a: 'No. The PDF is parsed in this tab with pdf-lib, the field values are written into the document in memory, and a fresh copy is saved straight to your disk. There is no upload endpoint. Open the Network tab in dev tools while you fill a form: no request carries the file.',
  },
  {
    q: 'What does “flatten” mean, and should I tick it?',
    a: 'Flattening bakes every field into the page, so the answers read as ordinary text in any viewer and can no longer be edited. Tick it when the form is being sent on — an application, a signed declaration. Leave it off when you want to keep editing the fields later, for example a form you save and update each month.',
  },
  {
    q: 'Which fields can be filled?',
    a: 'Text fields (single and multi-line), checkboxes, radio groups, dropdowns and option lists. Push buttons and signature placeholders are listed but left alone — a digital signature needs your certificate, not a form filler.',
  },
  {
    q: 'My PDF shows no fields. Is the tool broken?',
    a: 'Probably not. Many “forms” are just flat pages with lines and boxes — no interactive fields at all. Those cannot be typed into by any form filler; the honest answer is to print, sign and scan, or place text with an editor. QuietKit tells you when a file has no fillable fields instead of pretending to fill them.',
  },
  {
    q: 'Will the filled form look identical everywhere?',
    a: 'Almost. QuietKit regenerates the appearance of each field so viewers show the new values, and flattening removes the remaining doubt. A form that relies on exotic embedded fonts may render its answers in a plain fallback font — the text is correct, the typeface may differ.',
  },
  {
    q: 'Can an encrypted or password-protected form be filled?',
    a: 'A file that opens without a password but restricts editing can usually be filled and saved. A file that demands a password to open cannot — there is no way to read it without the password, and bypassing that would not be a feature to be proud of.',
  },
]

type Draft = Record<string, string>

export function PdfFormFill() {
  useSeo({
    ...routeMeta('/tools/pdf-form-fill'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit PDF Form Filler',
          'Fill in a PDF form — text fields, checkboxes, radio groups and dropdowns — entirely in the browser, with an optional flatten step. No uploads.',
          '/tools/pdf-form-fill',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [file, setFile] = useState<File | null>(null)
  const [report, setReport] = useState<PdfFormReport | null>(null)
  const [draft, setDraft] = useState<Draft>({})
  const [flatten, setFlatten] = useState(true)
  const [reading, setReading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PdfFormFillResult | null>(null)

  const pick = async (files: File[]) => {
    const pdf = files.find(
      (entry) => entry.type === 'application/pdf' || /\.pdf$/i.test(entry.name),
    )
    if (!pdf) return

    setFile(pdf)
    setReport(null)
    setResult(null)
    setError(null)
    setDraft({})
    setReading(true)
    try {
      const { inspectPdfForm } = await import('../lib/pdfForm')
      const next = await inspectPdfForm(pdf)
      setReport(next)
      // Pre-fill the draft with current values so untouched fields stay as-is.
      const initial: Draft = {}
      next.fields.forEach((field) => {
        initial[field.name] = field.value
      })
      setDraft(initial)
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
    setDraft({})
  }

  const setValue = (name: string, value: string) => {
    setDraft((prev) => ({ ...prev, [name]: value }))
    setResult(null)
  }

  const fill = async () => {
    if (!file) return
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      const { fillPdfForm } = await import('../lib/pdfForm')
      const filled = await fillPdfForm(file, draft, flatten)
      setResult(filled)
    } catch {
      setError('Could not save this form. It may be damaged or password-protected against edits.')
    } finally {
      setBusy(false)
    }
  }

  const download = () => {
    if (!result || !file) return
    downloadBlob(result.blob, `${baseName(file.name)}-filled.pdf`)
  }

  const fields = report?.fields ?? []
  const editable = fields.filter((field) => field.type !== 'other' && !field.readOnly)
  const changed = editable.filter((field) => draft[field.name] !== field.value).length

  const renderEditor = (field: PdfFormField) => {
    const value = draft[field.name] ?? ''
    if (field.type === 'checkbox') {
      return (
        <label className="row" style={{ gap: 8, cursor: field.readOnly ? 'default' : 'pointer' }}>
          <input
            type="checkbox"
            checked={value === 'yes'}
            disabled={field.readOnly}
            onChange={(event) => setValue(field.name, event.target.checked ? 'yes' : '')}
          />
          <span className="small muted">{value === 'yes' ? 'Checked' : 'Unchecked'}</span>
        </label>
      )
    }
    if (field.type === 'radio' || field.type === 'choice') {
      return (
        <select
          className="input"
          value={value}
          disabled={field.readOnly}
          onChange={(event) => setValue(field.name, event.target.value)}
        >
          <option value="">— not set —</option>
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )
    }
    if (field.type === 'text' && field.multiline) {
      return (
        <textarea
          className="input"
          rows={3}
          value={value}
          disabled={field.readOnly}
          onChange={(event) => setValue(field.name, event.target.value)}
        />
      )
    }
    if (field.type === 'text') {
      return (
        <input
          className="input"
          type="text"
          value={value}
          disabled={field.readOnly}
          onChange={(event) => setValue(field.name, event.target.value)}
        />
      )
    }
    return <span className="small muted">Not fillable here (button or signature field)</span>
  }

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Documents</span>
          <h1>Fill in a PDF form without uploading it</h1>
          <p>
            Tax forms, rental applications, school permissions — type into the fields, tick the
            boxes, pick the options, and download a filled copy. The form is read and written in
            this tab; nothing is sent anywhere.
          </p>
        </div>
      </section>

      <div className="container workspace">
        <div>
          <div className="panel">
            {!file ? (
              <Dropzone
                accept="application/pdf,.pdf"
                title="Drop a PDF form here, or click to choose"
                hint="One file · fields are read and filled locally · nothing is uploaded"
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
                    Reading the form fields locally…
                  </p>
                )}

                {error && (
                  <div className="notice notice-error" style={{ marginTop: 16 }}>
                    {error}
                  </div>
                )}

                {report && fields.length === 0 && (
                  <div className="notice notice-error" style={{ marginTop: 16, display: 'block' }}>
                    <strong>No fillable fields in this PDF.</strong>
                    <div style={{ marginTop: 6 }}>
                      The {report.pageCount}-page document is flat — lines and boxes printed on the
                      page, not interactive fields. No form filler can type into it; it needs to be
                      printed and signed by hand, or annotated in an editor.
                    </div>
                  </div>
                )}

                {report && fields.length > 0 && (
                  <>
                    <div
                      className="stat-grid"
                      style={{
                        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                        marginTop: 16,
                      }}
                    >
                      <dl className="stat">
                        <dt>Pages</dt>
                        <dd>{report.pageCount}</dd>
                      </dl>
                      <dl className="stat">
                        <dt>Fields</dt>
                        <dd>{fields.length}</dd>
                      </dl>
                      <dl className="stat">
                        <dt>Fillable</dt>
                        <dd>{editable.length}</dd>
                      </dl>
                      <dl className="stat">
                        <dt>Changed</dt>
                        <dd>{changed}</dd>
                      </dl>
                    </div>

                    <div className="stack-md" style={{ marginTop: 20 }}>
                      {fields.map((field, index) => (
                        <div key={`${field.name}-${index}`} className="panel" style={{ padding: 14 }}>
                          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                            <span className="result-name" style={{ wordBreak: 'break-all' }}>
                              {field.name}
                            </span>
                            <span className="tiny muted">
                              {field.type}
                              {field.readOnly ? ' · read-only' : ''}
                              {draft[field.name] !== field.value ? ' · changed' : ''}
                            </span>
                          </div>
                          {renderEditor(field)}
                        </div>
                      ))}
                    </div>

                    <label className="row" style={{ marginTop: 18, gap: 8, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={flatten}
                        onChange={(event) => setFlatten(event.target.checked)}
                      />
                      <span className="small">
                        Flatten the form — answers become plain page text and can no longer be edited
                        <span className="muted"> (recommended before sending)</span>
                      </span>
                    </label>

                    <div className="row" style={{ marginTop: 18, justifyContent: 'space-between' }}>
                      <button className="btn btn-forest" onClick={fill} disabled={busy}>
                        {busy ? 'Writing locally…' : 'Fill the form'}
                      </button>
                      {result && (
                        <button className="btn" onClick={download}>
                          <DownloadIcon size={16} /> Download ({formatBytes(result.blob.size)})
                        </button>
                      )}
                    </div>

                    {result && (
                      <div className="notice notice-ok" style={{ marginTop: 16, display: 'block' }}>
                        Wrote {result.filled} field{result.filled === 1 ? '' : 's'}
                        {result.flattened ? ' and flattened the form' : ''}. The original file is
                        untouched on your disk.
                        {!result.flattened && (
                          <div style={{ marginTop: 6 }}>
                            The copy keeps its fields editable — reopen it in any PDF viewer to keep
                            typing, or run it through here again.
                          </div>
                        )}
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
            <span className="panel-title">Why fill a form locally</span>
            <p className="small muted">
              The forms worth typing into are the ones with your identity number, salary or medical
              details on them. A local filler never opens a connection, so the filled copy exists
              only on your disk.
            </p>
            <div className="row" style={{ marginTop: 14 }}>
              <LockIcon size={16} /> <span className="small">0 bytes uploaded</span>
            </div>
          </div>

          <div className="panel">
            <span className="panel-title">Related</span>
            <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
              <li>
                <Link to="/guides/fill-pdf-form-without-upload" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Read the full guide
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-metadata" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Strip the form's metadata before sending
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-page-numbers" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Number the pages of a long form
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-compress" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Shrink a scanned form for email
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-merge" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Merge the form with its attachments
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="section">
        <div className="container-narrow prose">
          <h2>Two kinds of “PDF form”</h2>
          <p>
            Only one of them can be filled on a computer. An <strong>AcroForm</strong> — the kind
            this tool handles — carries real interactive fields: text boxes, checkboxes, radio
            groups and dropdowns, each with a name and a value stored inside the file. The other
            kind is a flat page: a scan or an export where the boxes are just printed lines. Open
            both in a viewer and they look identical; only the first accepts typing, because only
            the first has anywhere to put the text.
          </p>
          <p>
            QuietKit reads the field dictionary and tells you honestly which kind you are holding.
            If the fields exist, they are listed by name with their current values, ready to edit.
            If none exist, that is the answer — printing and a pen, or an annotation editor, is the
            way forward.
          </p>

          <h2>Editable copy versus flattened copy</h2>
          <p>
            A filled form can be saved two ways. Kept <strong>editable</strong>, the fields still
            work in any viewer — useful for a template you reuse monthly, risky for a document you
            send on, because the recipient can change your answers by accident or curiosity.{' '}
            <strong>Flattened</strong>, every field is baked into the page: the answers become
            ordinary text, the file shrinks a little, and nothing can be re-typed. Send the
            flattened copy; keep the editable one for yourself.
          </p>

          <h2>What a local filler will not do</h2>
          <ul>
            <li>
              <strong>Sign for you.</strong> Signature fields and push buttons are listed but left
              alone. A digital signature needs a certificate you hold; drawing a squiggle is a
              different tool.
            </li>
            <li>
              <strong>Type into a flat page.</strong> No fields means nothing to fill. The tool says
              so instead of silently producing an identical copy.
            </li>
            <li>
              <strong>Open a password-protected form.</strong> A file that demands a password to
              open cannot be read without it.
            </li>
            <li>
              <strong>Validate your answers.</strong> Required flags and formats are shown as the
              form declares them; whether “date” really is a date is between you and the form's
              author.
            </li>
          </ul>

          <h2>Before the filled form goes out</h2>
          <p>
            A form that has been through several editors can carry their names in its metadata, and
            the flattened file still has its property block. Run the finished copy through the{' '}
            <Link to="/tools/pdf-metadata">metadata cleaner</Link> if the author field is not yours
            to share, and check the result in a second viewer before sending — five seconds that
            catch a font fallback or an empty checkbox.
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
