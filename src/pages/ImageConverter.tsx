import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Dropzone } from '../components/Dropzone'
import { AdSlot } from '../components/AdSlot'
import { DownloadIcon, ImageIcon, TrashIcon, LockIcon, CheckIcon } from '../components/Icons'
import { compressImage, outputExtension, type CompressResult } from '../lib/image'
import { baseName, downloadBlob, formatBytes } from '../lib/files'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

type TargetFormat = 'image/jpeg' | 'image/png' | 'image/webp'

type Item = {
  id: string
  file: File
  doneKey?: string
  result?: CompressResult
  url?: string
  error?: string
}

const faqs = [
  {
    q: 'What happens to transparency when I convert PNG to JPEG?',
    a: 'JPEG has no alpha channel, so transparent areas have to be filled with a colour. QuietKit fills them with white — the same choice Photoshop makes by default — which is correct for photos and documents but will look wrong on a logo meant for a dark background. Keep PNG for anything with transparency.',
  },
  {
    q: 'Can I convert iPhone HEIC files to JPEG here?',
    a: 'Yes. Chrome, Edge and Firefox have no HEIC decoder built in, so QuietKit loads a WebAssembly decoder only when a HEIC file appears, converts it to JPEG in this tab, then re-encodes it to whatever format you picked. The first HEIC file adds a one-off download of roughly 1 MB for the decoder; every file after that is fast. Nothing is uploaded at any point.',
  },
  {
    q: 'Why is the converted file sometimes larger?',
    a: 'Format conversion is not compression. A JPEG photo converted to PNG becomes lossless and much bigger; a PNG screenshot converted to JPEG usually shrinks by 70–90%. HEIC to JPEG is the one case where the output is reliably larger, often twice the size, because HEIC is the more efficient format — that is the price of compatibility. The result list always shows the real before and after size, so you can judge each file rather than trusting a promise.',
  },
  {
    q: 'Do the images get uploaded during conversion?',
    a: 'No. The file is decoded and re-encoded by the Canvas API inside this tab. Open the Network panel while converting: no request carries your image, and there is no server that could keep a copy.',
  },
]

export function ImageConverter() {
  useSeo({
    ...routeMeta('/tools/image-converter'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit Image Converter',
          'Convert JPEG, PNG and WebP images locally in the browser without uploading them.',
          '/tools/image-converter',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [items, setItems] = useState<Item[]>([])
  const [format, setFormat] = useState<TargetFormat>('image/jpeg')
  const [quality, setQuality] = useState(0.9)
  const [busy, setBusy] = useState(false)

  const itemsRef = useRef<Item[]>(items)
  useEffect(() => {
    itemsRef.current = items
  }, [items])

  const lossy = format !== 'image/png'
  const settingsKey = `${format}|${lossy ? quality : 'lossless'}`

  useEffect(() => {
    let cancelled = false
    const pending = itemsRef.current.filter((item) => item.doneKey !== settingsKey)
    if (pending.length === 0) return

    setBusy(true)
    ;(async () => {
      for (const item of pending) {
        if (cancelled) break
        try {
          const result = await compressImage(item.file, {
            maxDimension: null,
            quality: lossy ? quality : 1,
            format,
          })
          const url = URL.createObjectURL(result.blob)
          if (cancelled) {
            URL.revokeObjectURL(url)
            break
          }
          setItems((prev) =>
            prev.map((entry) =>
              entry.id === item.id
                ? { ...entry, result, doneKey: settingsKey, url, error: undefined }
                : entry,
            ),
          )
        } catch (error) {
          if (cancelled) break
          setItems((prev) =>
            prev.map((entry) =>
              entry.id === item.id
                ? {
                    ...entry,
                    doneKey: settingsKey,
                    error:
                      error instanceof Error
                        ? error.message
                        : 'Could not process this file.',
                  }
                : entry,
            ),
          )
        }
      }
      if (!cancelled) setBusy(false)
    })()

    return () => {
      cancelled = true
    }
  }, [items.length, settingsKey, format, lossy, quality])

  const addFiles = (files: File[]) => {
    const images = files.filter(
      (file) => file.type.startsWith('image/') || /\.(heic|heif)$/i.test(file.name),
    )
    setItems((prev) => [
      ...prev,
      ...images.map((file) => ({ id: `${file.name}-${file.size}-${Math.random()}`, file })),
    ])
  }

  const reset = () => {
    items.forEach((item) => item.url && URL.revokeObjectURL(item.url))
    setItems([])
  }

  const remove = (id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id)
      if (target?.url) URL.revokeObjectURL(target.url)
      return prev.filter((item) => item.id !== id)
    })
  }

  const downloadOne = (item: Item) => {
    if (!item.result) return
    const ext = outputExtension(item.result.type)
    downloadBlob(item.result.blob, `${baseName(item.file.name)}.${ext}`)
  }

  const downloadAll = async () => {
    const ready = items.filter((item) => item.result)
    if (ready.length === 0) return
    if (ready.length === 1) {
      downloadOne(ready[0])
      return
    }
    const { default: JSZip } = await import('jszip')
    const zip = new JSZip()
    ready.forEach((item) => {
      const ext = outputExtension(item.result!.type)
      zip.file(`${baseName(item.file.name)}.${ext}`, item.result!.blob)
    })
    const blob = await zip.generateAsync({ type: 'blob' })
    downloadBlob(blob, 'quietkit-converted.zip')
  }

  const ready = items.filter((item) => item.result)

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Images</span>
          <h1>Convert HEIC, JPG, PNG and WebP images</h1>
          <p>
            Turn an iPhone HEIC into a JPEG anyone can open, a screenshot into a WebP, or a PNG
            into a smaller file — one file or fifty, all inside this tab. Nothing is sent
            anywhere.
          </p>
        </div>
      </section>

      <div className="container workspace">
        <div>
          <div className="panel">
            {items.length === 0 ? (
              <Dropzone
                accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif,.heic,.heif"
                multiple
                title="Drop images to convert, or click to choose"
                hint="HEIC · JPEG · PNG · WebP · AVIF — converted locally, in batches"
                icon={<ImageIcon size={30} />}
                onFiles={addFiles}
              />
            ) : (
              <>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="panel-title" style={{ marginBottom: 0 }}>
                    {items.length} image{items.length > 1 ? 's' : ''} ·{' '}
                    {busy ? 'converting locally…' : `as ${outputExtension(format)}`}
                  </span>
                  <div className="row">
                    <button className="btn btn-sm" onClick={reset}>
                      <TrashIcon size={14} /> Clear
                    </button>
                    <button className="btn btn-sm btn-forest" onClick={downloadAll} disabled={ready.length === 0}>
                      <DownloadIcon size={14} /> Download {ready.length > 1 ? 'all' : ''}
                    </button>
                  </div>
                </div>

                <div className="result-list">
                  {items.map((item) => (
                    <div key={item.id} className="result-row">
                      {item.url ? (
                        <img className="thumb" src={item.url} alt="" />
                      ) : (
                        <span className="thumb-file">IMG</span>
                      )}
                      <div style={{ minWidth: 0 }}>
                        <div className="result-name">{item.file.name}</div>
                        <div className="result-sub">
                          {item.error ? (
                            <span style={{ color: 'var(--danger)' }}>{item.error}</span>
                          ) : item.result ? (
                            <>
                              {formatBytes(item.file.size)} → {formatBytes(item.result.blob.size)} ·{' '}
                              <span
                                className={item.result.blob.size < item.file.size ? 'saved' : undefined}
                              >
                                {item.result.blob.size < item.file.size ? '−' : '+'}
                                {Math.abs(
                                  Math.round(
                                    ((item.result.blob.size - item.file.size) / item.file.size) * 100,
                                  ),
                                )}
                                %
                              </span>{' '}
                              · {item.result.width}×{item.result.height}
                            </>
                          ) : (
                            <>converting…</>
                          )}
                        </div>
                      </div>
                      <div className="row" style={{ gap: 6 }}>
                        <button
                          className="btn btn-sm"
                          onClick={() => downloadOne(item)}
                          disabled={!item.result}
                          aria-label={`Download ${item.file.name}`}
                        >
                          <DownloadIcon size={14} />
                        </button>
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
                </div>

                <div style={{ marginTop: 16 }}>
                  <AddMore onFiles={addFiles} />
                </div>
              </>
            )}
          </div>

          <div className="panel" style={{ marginTop: 20 }}>
            <span className="panel-title">Settings</span>
            <div className="controls">
              <div className="field">
                <span className="field-label">Convert to</span>
                <div className="segmented">
                  {[
                    { label: 'JPEG', value: 'image/jpeg' },
                    { label: 'PNG', value: 'image/png' },
                    { label: 'WebP', value: 'image/webp' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      aria-pressed={format === option.value}
                      onClick={() => setFormat(option.value as TargetFormat)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label htmlFor="convert-quality">
                  Quality <span className="field-value">{lossy ? `${Math.round(quality * 100)}%` : 'lossless'}</span>
                </label>
                <input
                  id="convert-quality"
                  type="range"
                  min={0.5}
                  max={1}
                  step={0.05}
                  value={quality}
                  disabled={!lossy}
                  onChange={(event) => setQuality(Number(event.target.value))}
                />
                <p className="small muted" style={{ marginTop: 8 }}>
                  {lossy
                    ? '90% is visually lossless for photos. Lower it only when the file must be small.'
                    : 'PNG is lossless, so quality does not apply. Expect larger files than JPEG.'}
                </p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <AdSlot />
          </div>
        </div>

        <aside className="stack-md">
          <div className="panel">
            <span className="panel-title">Converted here</span>
            <p className="small muted">
              Each file is decoded and re-encoded by your own browser. There is no upload step, no
              queue and no temporary storage to clean up.
            </p>
            <div className="row" style={{ marginTop: 14 }}>
              <LockIcon size={16} /> <span className="small">0 bytes uploaded</span>
            </div>
          </div>

          <div className="panel">
            <span className="panel-title">Related</span>
            <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
              <li>
                <Link to="/tools/image-compressor" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Compress and resize instead
                </Link>
              </li>
              <li>
                <Link to="/tools/metadata-cleaner" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Strip the metadata afterwards
                </Link>
              </li>
              <li>
                <Link to="/guides/compress-image-to-100kb" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Guide: hit a 100 KB limit
                </Link>
              </li>
              <li>
                <Link to="/guides/convert-images-without-upload" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Guide: convert without uploading
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="section">
        <div className="container-narrow prose">
          <h2>Which format should you convert to?</h2>
          <p>
            The format is not a taste question; it decides which kinds of data the file can hold.
            <strong> JPEG</strong> stores a photograph with lossy compression — small files,
            universal support, no transparency. <strong>PNG</strong> is lossless and keeps every
            pixel and alpha channel — correct for logos, screenshots and text. <strong>WebP</strong>{' '}
            does both, usually 25–35% smaller than JPEG at the same visual quality, and every
            current browser can read it.
          </p>
          <p>
            A practical rule: convert <em>to JPEG</em> when the destination only accepts JPEG
            (job portals, visa forms, older CMS uploads) and the image is a photo. Convert{' '}
            <em>to PNG</em> when the image has transparency or sharp text. Convert <em>to WebP</em>{' '}
            for your own website, where size matters and browser support is not a concern.
          </p>

          <h3>What conversion cannot do</h3>
          <ul>
            <li>
              It cannot recover detail that was already thrown away. A JPEG saved at 40% quality
              stays soft when converted to PNG.
            </li>
            <li>
              It cannot turn a screenshot into a high-resolution photo, or a small image into a
              large one without blur.
            </li>
            <li>
              It does not remove EXIF metadata by itself — some encoders copy it. Use the{' '}
              <Link to="/tools/metadata-cleaner">metadata cleaner</Link> when location data must go.
            </li>
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

function AddMore({ onFiles }: { onFiles: (files: File[]) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <>
      <button className="btn btn-sm" onClick={() => ref.current?.click()}>
        <ImageIcon size={14} /> Add more images
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*,.heic,.heif"
        multiple
        className="sr-only"
        onChange={(event) => {
          if (event.target.files) onFiles(Array.from(event.target.files))
          event.currentTarget.value = ''
        }}
      />
    </>
  )
}
