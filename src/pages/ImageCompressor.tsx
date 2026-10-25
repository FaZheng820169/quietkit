import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Dropzone } from '../components/Dropzone'
import { AdSlot } from '../components/AdSlot'
import { DownloadIcon, ImageIcon, TrashIcon, LockIcon, CheckIcon } from '../components/Icons'
import { compressImage, outputExtension, type CompressFormat, type CompressResult } from '../lib/image'
import { baseName, downloadBlob, formatBytes, percentSaved } from '../lib/files'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

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
    q: 'Does compressing an image reduce its quality?',
    a: 'JPEG and WebP are lossy formats, so yes — but at 75% quality most photos are visually identical and 60–80% smaller. Keep the quality above 60% for photos with fine detail, and export PNG when you need transparency instead of a smaller file.',
  },
  {
    q: 'Why did my PNG get bigger?',
    a: 'PNG is lossless. Re-encoding can sometimes increase the file size if the original was already heavily optimised. For photos, choose JPEG or WebP instead; keep PNG only for logos and screenshots with text or transparency.',
  },
  {
    q: 'Is there a file size limit?',
    a: 'There is no imposed limit. The practical limit is your device memory: files up to roughly 200 MB work on a modern laptop. Unlike upload sites, there is no 5 MB cap to push you into a paid plan.',
  },
  {
    q: 'Are my photos uploaded while compressing?',
    a: 'No. The compression happens with the Canvas API inside this tab. You can open the browser Network panel and confirm that no request carries your image.',
  },
]

export function ImageCompressor() {
  useSeo({
    ...routeMeta('/tools/image-compressor'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit Image Compressor',
          'Compress and resize JPEG, PNG and WebP images locally in the browser.',
          '/tools/image-compressor',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [items, setItems] = useState<Item[]>([])
  const [quality, setQuality] = useState(0.75)
  const [maxDimension, setMaxDimension] = useState<number | null>(null)
  const [format, setFormat] = useState<CompressFormat>('original')
  const [busy, setBusy] = useState(false)

  const itemsRef = useRef<Item[]>(items)
  useEffect(() => {
    itemsRef.current = items
  }, [items])

  const settingsKey = `${quality}|${maxDimension}|${format}`

  useEffect(() => {
    let cancelled = false
    const pending = itemsRef.current.filter((item) => item.doneKey !== settingsKey)
    if (pending.length === 0) return

    setBusy(true)
    ;(async () => {
      for (const item of pending) {
        if (cancelled) break
        try {
          const result = await compressImage(item.file, { maxDimension, quality, format })
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
                    error: error instanceof Error ? error.message : 'Could not process this file.',
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
  }, [items.length, settingsKey, format, maxDimension, quality])

  const addFiles = (files: File[]) => {
    const images = files.filter((file) => file.type.startsWith('image/'))
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
    downloadBlob(item.result.blob, `${baseName(item.file.name)}-min.${ext}`)
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
      zip.file(`${baseName(item.file.name)}-min.${ext}`, item.result!.blob)
    })
    const blob = await zip.generateAsync({ type: 'blob' })
    downloadBlob(blob, 'quietkit-images.zip')
  }

  const ready = items.filter((item) => item.result)
  const originalTotal = ready.reduce((sum, item) => sum + item.file.size, 0)
  const compressedTotal = ready.reduce((sum, item) => sum + item.result!.blob.size, 0)
  const saved = percentSaved(originalTotal, compressedTotal)

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Images</span>
          <h1>Compress images without uploading them</h1>
          <p>
            Drop JPEG, PNG or WebP files below. QuietKit re-encodes them with your own
            browser and hands back smaller files — the originals never travel anywhere.
          </p>
        </div>
      </section>

      <div className="container workspace">
        <div>
          <div className="panel">
            {items.length === 0 ? (
              <Dropzone
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                title="Drop images here, or click to choose"
                hint="JPEG · PNG · WebP · up to as many files as your memory allows"
                icon={<ImageIcon size={30} />}
                onFiles={addFiles}
              />
            ) : (
              <>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="panel-title" style={{ marginBottom: 0 }}>
                    {items.length} image{items.length > 1 ? 's' : ''} · {busy ? 'working locally…' : 'ready'}
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
                              <span className="saved">
                                −{percentSaved(item.file.size, item.result.blob.size)}%
                              </span>{' '}
                              · {item.result.width}×{item.result.height}
                            </>
                          ) : (
                            <>processing…</>
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

                {ready.length > 0 && (
                  <dl className="stat-grid">
                    <div className="stat">
                      <dt>Original</dt>
                      <dd>{formatBytes(originalTotal)}</dd>
                    </div>
                    <div className="stat">
                      <dt>Compressed</dt>
                      <dd>{formatBytes(compressedTotal)}</dd>
                    </div>
                    <div className="stat">
                      <dt>Saved</dt>
                      <dd style={{ color: 'var(--forest)' }}>{saved}%</dd>
                    </div>
                  </dl>
                )}

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
                <label htmlFor="quality">
                  Quality <span className="field-value">{Math.round(quality * 100)}%</span>
                </label>
                <input
                  id="quality"
                  type="range"
                  min={0.4}
                  max={0.95}
                  step={0.05}
                  value={quality}
                  onChange={(event) => setQuality(Number(event.target.value))}
                />
              </div>

              <div className="field">
                <span className="field-label">Resize longest side</span>
                <div className="segmented">
                  {[
                    { label: 'Original', value: null },
                    { label: '1920 px', value: 1920 },
                    { label: '1280 px', value: 1280 },
                    { label: '800 px', value: 800 },
                  ].map((option) => (
                    <button
                      key={option.label}
                      aria-pressed={maxDimension === option.value}
                      onClick={() => setMaxDimension(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <span className="field-label">Output format</span>
                <div className="segmented">
                  {[
                    { label: 'Keep', value: 'original' },
                    { label: 'JPEG', value: 'image/jpeg' },
                    { label: 'WebP', value: 'image/webp' },
                    { label: 'PNG', value: 'image/png' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      aria-pressed={format === option.value}
                      onClick={() => setFormat(option.value as CompressFormat)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <AdSlot />
          </div>
        </div>

        <aside className="stack-md">
          <div className="panel">
            <span className="panel-title">Processed here</span>
            <p className="small muted">
              Compression runs in this tab using the Canvas API. No request is made with your
              image, and the file is released from memory when you close the page.
            </p>
            <div className="row" style={{ marginTop: 14 }}>
              <LockIcon size={16} /> <span className="small">0 bytes uploaded</span>
            </div>
          </div>

          <div className="panel">
            <span className="panel-title">Related</span>
            <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
              <li>
                <Link to="/tools/metadata-cleaner" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Remove hidden photo metadata
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-merge" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Merge PDFs locally
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="section">
        <div className="container-narrow prose">
          <h2>How browser image compression works</h2>
          <p>
            A compressed image is not a smaller picture — it is the same picture described with
            fewer bytes. When you drag a photo into this page, the browser decodes it to raw
            pixels, the canvas scales it if you asked for a resize, and then the encoder writes
            it back out at the quality level you chose. That is the entire trick. Upload sites
            do the same thing, except they send your original to a server first and keep a copy.
          </p>
          <p>
            Two settings do most of the work. <strong>Quality</strong> controls how aggressively
            the encoder throws away detail that your eye will not notice; 70–80% is the usual
            sweet spot for photos. <strong>Resize</strong> matters even more: a 4000 px photo
            shown in a 800 px blog column is four times the pixels you need.
          </p>

          <h3>Choosing the right format</h3>
          <ul>
            <li>
              <strong>JPEG</strong> — best for photographs. Universally supported, very small at
              75% quality.
            </li>
            <li>
              <strong>WebP</strong> — 25–35% smaller than JPEG at the same visual quality, and
              supported by every current browser.
            </li>
            <li>
              <strong>PNG</strong> — lossless, keeps transparency, correct for logos, UI
              screenshots and anything with text.
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
        accept="image/*"
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
