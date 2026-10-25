import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Dropzone } from '../components/Dropzone'
import { AdSlot } from '../components/AdSlot'
import {
  BoltIcon,
  CheckIcon,
  DownloadIcon,
  FileIcon,
  ImageIcon,
  LockIcon,
  PlusIcon,
  TrashIcon,
} from '../components/Icons'
import { compressImage, outputExtension } from '../lib/image'
import { baseName, downloadBlob, formatBytes } from '../lib/files'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

type Kind = 'image' | 'pdf' | 'skip'

type Item = {
  id: string
  file: File
  kind: Kind
  pages?: number
  state: 'idle' | 'working' | 'done' | 'error'
  note?: string
  out?: { blob: Blob; name: string }
}

type PdfOutput = { name: string; blob: Blob; pages: number; steps: string[] }

type ImageFormat = 'keep' | 'image/jpeg' | 'image/webp' | 'image/png'
type PaperChoice = 'none' | 'a4' | 'letter'

const faqs = [
  {
    q: 'Are the files uploaded anywhere?',
    a: 'No. The folder is read by your own browser, every step runs in this tab with Canvas and WebAssembly, and the ZIP is written straight to your disk. Open the Network tab in your dev tools and run a batch — no request carries a file.',
  },
  {
    q: 'What happens to the metadata in my photos?',
    a: 'It is dropped completely. Every photo is decoded and re-encoded from raw pixels, so the EXIF block, GPS coordinates, XMP packets and embedded thumbnails simply do not exist in the output. Rotation is applied into the pixels, so photos still display upright.',
  },
  {
    q: 'Can photos and PDFs go through in one drop?',
    a: 'Yes. QuietKit sorts the folder into two lanes: photos are cleaned, converted and compressed one by one, while PDFs are merged in name order and then stamped or resized as one document. Everything lands in a single ZIP.',
  },
  {
    q: 'What happens to files the batch cannot handle?',
    a: 'They are listed as skipped and left out of the ZIP — text files, videos, ZIP archives and anything else that is not a photo or PDF. A PDF that asks for a password is skipped too, with a note, so the rest of the folder still finishes.',
  },
  {
    q: 'Is there a file or size limit?',
    a: 'No fixed limit. A few hundred photos or a handful of heavy PDFs are fine on a modern laptop; the ceiling is your device’s memory, not a plan or an account. If a batch feels slow, split the folder and run it in two passes.',
  },
]

function FolderPicker({ onFiles, label }: { onFiles: (files: File[]) => void; label: string }) {
  return (
    <label className="btn btn-sm" style={{ cursor: 'pointer' }}>
      <PlusIcon size={14} /> {label}
      <input
        type="file"
        multiple
        className="sr-only"
        onChange={(event) => {
          if (event.target.files) onFiles(Array.from(event.target.files))
          event.currentTarget.value = ''
        }}
        {...({ webkitdirectory: 'true' } as Record<string, string>)}
      />
    </label>
  )
}

function classify(file: File): Kind {
  if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) return 'pdf'
  if (file.type.startsWith('image/') || /\.(jpe?g|png|webp|heic|heif|avif)$/i.test(file.name)) {
    return 'image'
  }
  return 'skip'
}

export function Batch() {
  useSeo({
    ...routeMeta('/tools/batch'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit Batch',
          'Drop one folder and run several tools in a single pass: photos are stripped of metadata, converted and compressed, PDFs are merged, numbered and resized — all locally.',
          '/tools/batch',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [items, setItems] = useState<Item[]>([])
  const [running, setRunning] = useState(false)
  const [pdfOuts, setPdfOuts] = useState<PdfOutput[]>([])
  const [pdfError, setPdfError] = useState<string | null>(null)

  const [format, setFormat] = useState<ImageFormat>('keep')
  const [maxDimension, setMaxDimension] = useState<number | null>(1920)
  const [quality, setQuality] = useState(0.82)

  const [merge, setMerge] = useState(true)
  const [numbers, setNumbers] = useState(true)
  const [paper, setPaper] = useState<PaperChoice>('none')

  const update = (id: string, patch: Partial<Item>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  const addFiles = (files: File[]) => {
    const additions: Item[] = files.map((file) => ({
      id: `${file.name}-${file.size}-${Math.random()}`,
      file,
      kind: classify(file),
      state: 'idle',
    }))
    setItems((prev) => [...prev, ...additions])
    // Page counts double as an encryption check: a locked PDF fails here, gets
    // a note, and is excluded from the chain before it can abort the merge.
    additions
      .filter((item) => item.kind === 'pdf')
      .forEach(async (item) => {
        // pdf-lib stays out of the main bundle; it loads only when a PDF shows up.
        const { countPdfPages, EncryptedPdfError } = await import('../lib/pdf')
        try {
          const pages = await countPdfPages(item.file)
          update(item.id, { pages })
        } catch (error) {
          update(item.id, {
            state: 'error',
            note:
              error instanceof EncryptedPdfError
                ? 'Locked with a password — skipped'
                : 'Could not be read as a PDF — skipped',
          })
        }
      })
  }

  const reset = () => {
    setItems([])
    setPdfOuts([])
    setPdfError(null)
  }

  const remove = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const images = items.filter((item) => item.kind === 'image')
  const pdfs = items.filter((item) => item.kind === 'pdf')
  const skipped = items.filter((item) => item.kind === 'skip')
  const healthyPdfs = pdfs.filter((item) => item.state !== 'error')
  const pdfLaneActive = merge || numbers || paper !== 'none'

  const run = async () => {
    if (running) return
    setRunning(true)
    setPdfOuts([])
    setPdfError(null)

    for (const item of images) {
      update(item.id, { state: 'working', out: undefined })
      try {
        const result = await compressImage(item.file, {
          maxDimension,
          quality,
          format: format === 'keep' ? 'original' : format,
        })
        update(item.id, {
          state: 'done',
          out: {
            blob: result.blob,
            name: `${baseName(item.file.name)}.${outputExtension(result.type)}`,
          },
        })
      } catch {
        update(item.id, { state: 'error', note: 'Could not be decoded — skipped' })
      }
    }

    if (healthyPdfs.length > 0 && pdfLaneActive) {
      try {
        const { mergePdfs, resizePdfPages, stampPageNumbers } = await import('../lib/pdf')
        let targets: { file: File; name: string; pages: number; steps: string[] }[]
        if (merge) {
          const sorted = [...healthyPdfs].sort((a, b) =>
            a.file.name.localeCompare(b.file.name, undefined, { numeric: true }),
          )
          const merged = await mergePdfs(sorted.map((item) => item.file))
          targets = [
            {
              file: new File([merged.blob], 'combined.pdf', { type: 'application/pdf' }),
              name: 'combined.pdf',
              pages: merged.pages,
              steps: [`${sorted.length} file${sorted.length === 1 ? '' : 's'} merged in name order`],
            },
          ]
        } else {
          targets = healthyPdfs.map((item) => ({
            file: item.file,
            name: item.file.name,
            pages: item.pages ?? 0,
            steps: [],
          }))
        }

        const outs: PdfOutput[] = []
        for (const target of targets) {
          let file = target.file
          const steps = [...target.steps]
          if (numbers) {
            const stamped = await stampPageNumbers(file, {
              position: 'bottom-right',
              format: 'slash',
              start: 1,
              fontSize: 10,
              skipFirst: false,
            })
            file = new File([stamped.blob], target.name, { type: 'application/pdf' })
            steps.push('page numbers')
          }
          if (paper !== 'none') {
            const resized = await resizePdfPages(file, {
              paper,
              orientation: 'auto',
              mode: 'fit',
            })
            file = new File([resized.blob], target.name, { type: 'application/pdf' })
            steps.push(paper === 'a4' ? 'A4 pages' : 'Letter pages')
          }
          const suffix = steps.filter((s) => !s.includes('merged')).length > 0
            ? `-${steps.includes('page numbers') ? 'numbered' : ''}${paper !== 'none' ? `-${paper}` : ''}`
            : ''
          const name = merge
            ? 'combined.pdf'
            : `${baseName(target.name)}${suffix || '-processed'}.pdf`
          outs.push({ name, blob: file, pages: target.pages, steps })
        }
        setPdfOuts(outs)
        healthyPdfs.forEach((item) => update(item.id, { state: 'done' }))
      } catch {
        setPdfError('The PDF lane stopped on a damaged file. Remove it and run the batch again.')
      }
    }
    setRunning(false)
  }

  const imageOuts = images.filter((item) => item.out)
  const totalOuts = imageOuts.length + pdfOuts.length
  const beforeBytes = imageOuts.reduce((sum, item) => sum + item.file.size, 0)
  const afterBytes = imageOuts.reduce((sum, item) => sum + (item.out as { blob: Blob }).blob.size, 0)

  const downloadAll = async () => {
    if (totalOuts === 0) return
    if (totalOuts === 1) {
      if (imageOuts[0]?.out) downloadBlob(imageOuts[0].out.blob, imageOuts[0].out.name)
      else if (pdfOuts[0]) downloadBlob(pdfOuts[0].blob, pdfOuts[0].name)
      return
    }
    const { default: JSZip } = await import('jszip')
    const zip = new JSZip()
    const used = new Set<string>()
    const push = (name: string, blob: Blob) => {
      let candidate = name
      let counter = 2
      while (used.has(candidate)) {
        const dot = name.lastIndexOf('.')
        candidate = `${name.slice(0, dot)}-${counter}${name.slice(dot)}`
        counter += 1
      }
      used.add(candidate)
      zip.file(candidate, blob)
    }
    imageOuts.forEach((item) => push((item.out as { name: string }).name, (item.out as { blob: Blob }).blob))
    pdfOuts.forEach((out) => push(out.name, out.blob))
    const blob = await zip.generateAsync({ type: 'blob' })
    downloadBlob(blob, 'quietkit-batch.zip')
  }

  const canRun =
    !running &&
    (images.length > 0 || (healthyPdfs.length > 0 && pdfLaneActive))

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Batch</span>
          <h1>One folder in, one ZIP out.</h1>
          <p>
            Drop a whole folder — photos and PDFs together. Photos are stripped of metadata,
            converted and compressed; PDFs are merged in name order, numbered and resized. Every
            step runs in this tab.
          </p>
        </div>
      </section>

      <div className="container workspace">
        <div>
          <div className="panel">
            {items.length === 0 ? (
              <>
                <Dropzone
                  accept="image/*,.heic,.heif,.pdf,application/pdf"
                  multiple
                  title="Drop a folder here, or click to choose files"
                  hint="Photos and PDFs together · subfolders included · nothing is uploaded"
                  icon={<BoltIcon size={30} />}
                  onFiles={addFiles}
                />
                <div className="row" style={{ marginTop: 14, justifyContent: 'center' }}>
                  <FolderPicker onFiles={addFiles} label="Choose a whole folder" />
                </div>
                <p className="small muted" style={{ marginTop: 10, textAlign: 'center' }}>
                  Anything that is not a photo or PDF is listed as skipped, never silently
                  dropped.
                </p>
              </>
            ) : (
              <>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="panel-title" style={{ marginBottom: 0 }}>
                    {images.length} photo{images.length === 1 ? '' : 's'} · {pdfs.length} PDF
                    {pdfs.length === 1 ? '' : 's'}
                    {skipped.length > 0 && ` · ${skipped.length} skipped`}
                  </span>
                  <div className="row">
                    <button className="btn btn-sm" onClick={reset}>
                      <TrashIcon size={14} /> Clear
                    </button>
                    {totalOuts > 0 && (
                      <button className="btn btn-sm btn-forest" onClick={downloadAll}>
                        <DownloadIcon size={14} />{' '}
                        {totalOuts === 1 ? 'Download' : `Download ${totalOuts} as ZIP`}
                      </button>
                    )}
                  </div>
                </div>

                <div className="controls">
                  {images.length > 0 && (
                    <div className="field">
                      <span className="field-label">
                        Photos — always cleaned of metadata
                        <span className="field-value">EXIF · GPS · XMP dropped</span>
                      </span>
                      <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
                        <div className="segmented">
                          {(
                            [
                              ['keep', 'Keep format'],
                              ['image/jpeg', 'JPEG'],
                              ['image/webp', 'WebP'],
                              ['image/png', 'PNG'],
                            ] as [ImageFormat, string][]
                          ).map(([value, label]) => (
                            <button
                              key={value}
                              aria-pressed={format === value}
                              onClick={() => setFormat(value)}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                        <div className="segmented">
                          {(
                            [
                              [null, 'Original size'],
                              [2560, '≤ 2560 px'],
                              [1920, '≤ 1920 px'],
                              [1280, '≤ 1280 px'],
                            ] as [number | null, string][]
                          ).map(([value, label]) => (
                            <button
                              key={label}
                              aria-pressed={maxDimension === value}
                              onClick={() => setMaxDimension(value)}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="row" style={{ gap: 12, marginTop: 12, alignItems: 'center' }}>
                        <input
                          type="range"
                          min={0.5}
                          max={0.95}
                          step={0.01}
                          value={quality}
                          onChange={(event) => setQuality(Number(event.target.value))}
                          style={{ maxWidth: 220 }}
                          aria-label="JPEG and WebP quality"
                        />
                        <span className="field-value">
                          quality {Math.round(quality * 100)}% · JPEG/WebP only
                        </span>
                      </div>
                    </div>
                  )}

                  {pdfs.length > 0 && (
                    <div className="field">
                      <span className="field-label">
                        PDFs — run as one chain
                        <span className="field-value">merge → number → resize</span>
                      </span>
                      <div className="row" style={{ gap: 18, flexWrap: 'wrap' }}>
                        <label className="checkline">
                          <input
                            type="checkbox"
                            checked={merge}
                            onChange={(event) => setMerge(event.target.checked)}
                          />
                          Combine into one document, in name order
                        </label>
                        <label className="checkline">
                          <input
                            type="checkbox"
                            checked={numbers}
                            onChange={(event) => setNumbers(event.target.checked)}
                          />
                          Stamp page numbers, bottom-right
                        </label>
                        <div className="segmented">
                          {(
                            [
                              ['none', 'Keep size'],
                              ['a4', 'A4'],
                              ['letter', 'Letter'],
                            ] as [PaperChoice, string][]
                          ).map(([value, label]) => (
                            <button
                              key={value}
                              aria-pressed={paper === value}
                              onClick={() => setPaper(value)}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {pdfError && (
                  <div className="notice notice-error" style={{ marginTop: 16 }}>{pdfError}</div>
                )}

                <div className="result-list">
                  {images.map((item) => (
                    <div key={item.id} className="result-row">
                      <span className="thumb-file">
                        <ImageIcon size={18} />
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div className="result-name">{item.file.name}</div>
                        <div className="result-sub">
                          {item.state === 'working' && 'processing locally…'}
                          {item.state === 'done' && item.out && (
                            <>
                              {formatBytes(item.file.size)} → {formatBytes(item.out.blob.size)}
                              <span className="saved"> · cleaned</span>
                            </>
                          )}
                          {item.state === 'error' && (
                            <span style={{ color: 'var(--danger)' }}>{item.note}</span>
                          )}
                          {item.state === 'idle' && `${formatBytes(item.file.size)} · waiting`}
                        </div>
                      </div>
                      <div className="row" style={{ gap: 6 }}>
                        {item.out && (
                          <button
                            className="btn btn-sm"
                            onClick={() => item.out && downloadBlob(item.out.blob, item.out.name)}
                            aria-label={`Download ${item.file.name}`}
                          >
                            <DownloadIcon size={14} />
                          </button>
                        )}
                        <button
                          className="btn btn-sm"
                          onClick={() => remove(item.id)}
                          aria-label={`Remove ${item.file.name}`}
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {pdfs.map((item) => (
                    <div key={item.id} className="result-row">
                      <span className="thumb-file">PDF</span>
                      <div style={{ minWidth: 0 }}>
                        <div className="result-name">{item.file.name}</div>
                        <div className="result-sub">
                          {item.state === 'error' ? (
                            <span style={{ color: 'var(--danger)' }}>{item.note}</span>
                          ) : (
                            <>
                              {formatBytes(item.file.size)}
                              {item.pages !== undefined &&
                                ` · ${item.pages} page${item.pages === 1 ? '' : 's'}`}
                              {item.state === 'done' && <span className="saved"> · in the output</span>}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="row" style={{ gap: 6 }}>
                        <button
                          className="btn btn-sm"
                          onClick={() => remove(item.id)}
                          aria-label={`Remove ${item.file.name}`}
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {pdfOuts.map((out) => (
                    <div key={out.name} className="result-row" style={{ borderColor: 'var(--forest)' }}>
                      <span className="thumb-file">
                        <FileIcon size={18} />
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div className="result-name">{out.name}</div>
                        <div className="result-sub">
                          {formatBytes(out.blob.size)} · {out.pages} page{out.pages === 1 ? '' : 's'}
                          {out.steps.length > 0 && ` · ${out.steps.join(' · ')}`}
                        </div>
                      </div>
                      <div className="row" style={{ gap: 6 }}>
                        <button
                          className="btn btn-sm"
                          onClick={() => downloadBlob(out.blob, out.name)}
                          aria-label={`Download ${out.name}`}
                        >
                          <DownloadIcon size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {skipped.length > 0 && (
                  <p className="small muted" style={{ marginTop: 12 }}>
                    Skipped: {skipped.map((item) => item.file.name).join(', ')} — not photos or
                    PDFs.
                  </p>
                )}

                <div className="row" style={{ marginTop: 20, justifyContent: 'space-between' }}>
                  <button className="btn btn-forest" onClick={run} disabled={!canRun}>
                    <BoltIcon size={16} />{' '}
                    {running
                      ? 'Running locally…'
                      : `Run the batch${images.length + healthyPdfs.length > 0 ? ` on ${images.length + healthyPdfs.length} file${images.length + healthyPdfs.length === 1 ? '' : 's'}` : ''}`}
                  </button>
                  <div className="row">
                    <label className="btn btn-sm" style={{ cursor: 'pointer' }}>
                      <PlusIcon size={14} /> Add files
                      <input
                        type="file"
                        accept="image/*,.heic,.heif,.pdf,application/pdf"
                        multiple
                        className="sr-only"
                        onChange={(event) => {
                          if (event.target.files) addFiles(Array.from(event.target.files))
                          event.currentTarget.value = ''
                        }}
                      />
                    </label>
                    <FolderPicker onFiles={addFiles} label="Add folder" />
                  </div>
                </div>

                {imageOuts.length > 0 && (
                  <div className="stat-grid" style={{ marginTop: 18 }}>
                    <div className="stat">
                      <dt>Photos processed</dt>
                      <dd>{imageOuts.length}</dd>
                    </div>
                    <div className="stat">
                      <dt>Before</dt>
                      <dd>{formatBytes(beforeBytes)}</dd>
                    </div>
                    <div className="stat">
                      <dt>After</dt>
                      <dd>
                        {formatBytes(afterBytes)}
                        {afterBytes < beforeBytes && (
                          <span className="result-sub" style={{ display: 'block' }}>
                            {formatBytes(beforeBytes - afterBytes)} smaller
                          </span>
                        )}
                      </dd>
                    </div>
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
            <span className="panel-title">Why one pass</span>
            <p className="small muted">
              Preparing a folder for a client, a listing or an upload form usually means the same
              four or five steps in a row. The batch runs them together, so each file is opened
              once and the results arrive as a single ZIP.
            </p>
            <div className="row" style={{ marginTop: 14 }}>
              <LockIcon size={16} /> <span className="small">Two lanes · 0 bytes uploaded</span>
            </div>
          </div>

          <div className="panel">
            <span className="panel-title">Next step</span>
            <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
              <li>
                <Link to="/tools/pdf-watermark" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Watermark the combined PDF
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-compress" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Compress a heavy PDF further
                </Link>
              </li>
              <li>
                <Link to="/tools/image-resizer" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Need exact pixels instead of a cap
                </Link>
              </li>
              <li>
                <Link to="/guides/remove-exif-metadata-without-upload" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Guide: what metadata reveals
                </Link>
              </li>
            </ul>
          </div>

          <div className="panel">
            <span className="panel-title">Supported</span>
            <p className="small muted">
              JPEG, PNG, WebP and HEIC photos; unencrypted PDFs. Subfolders are walked. Anything
              else is listed as skipped and left out of the ZIP.
            </p>
          </div>
        </aside>
      </div>

      <section className="section">
        <div className="container-narrow prose">
          <h2>What a batch run actually does</h2>
          <p>
            A batch is not a new tool — it is the existing QuietKit tools queued behind one
            dropzone. Photos go down the image lane: each one is decoded, rotated upright, capped
            at the size you picked and re-encoded. Because the output is built from raw pixels,
            every metadata block — EXIF, GPS, XMP, the embedded thumbnail — is gone from the
            copy, not just hidden.
          </p>
          <p>
            PDFs go down the document lane as one chain. Files are sorted by name, merged without
            re-rendering a single page, then optionally stamped with page numbers and rebuilt on
            a uniform sheet. A locked or damaged PDF is flagged before the chain starts, so one
            bad file cannot hold the rest of the folder hostage.
          </p>

          <h2>Recipes this replaces</h2>
          <ul>
            <li>
              <strong>The listing folder</strong> — twenty photos for a marketplace or a rental
              ad: stripped of location, capped at 1920 px, re-encoded as JPEG. Small, clean and
              safe to post.
            </li>
            <li>
              <strong>The application bundle</strong> — a CV, references and certificates saved
              as separate PDFs: merged in name order, numbered “3 / 9”, resized to A4 so nothing
              prints cropped.
            </li>
            <li>
              <strong>The handover folder</strong> — photos and PDFs dropped together, one ZIP
              back, ready to attach.
            </li>
          </ul>

          <h2>Honest limits</h2>
          <p>
            The photo lane re-encodes, so it is lossy by definition — that is the trade for
            dropping metadata completely. Keep the originals if you need the untouched files.
            Encrypted PDFs are skipped rather than cracked. And because everything runs in your
            tab, a folder of several hundred large photos depends on your device’s memory, not on
            a queue behind other people’s files.
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
