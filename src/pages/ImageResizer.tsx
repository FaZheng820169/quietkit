import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Dropzone } from '../components/Dropzone'
import { AdSlot } from '../components/AdSlot'
import { DownloadIcon, ImageIcon, LockIcon, PlusIcon, TrashIcon, CheckIcon } from '../components/Icons'
import { resizeImage, outputExtension, type ResizeResult } from '../lib/image'
import { toDecodableImage } from '../lib/heic'
import { baseName, downloadBlob, formatBytes } from '../lib/files'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const PRESETS = [
  { label: 'Instagram post', width: 1080, height: 1080, ratio: '1:1' },
  { label: 'Instagram portrait', width: 1080, height: 1350, ratio: '4:5' },
  { label: 'Story / Reel', width: 1080, height: 1920, ratio: '9:16' },
  { label: 'X post', width: 1600, height: 900, ratio: '16:9' },
  { label: 'YouTube thumbnail', width: 1280, height: 720, ratio: '16:9' },
  { label: 'LinkedIn banner', width: 1584, height: 396, ratio: '4:1' },
  { label: 'Link preview', width: 1200, height: 630, ratio: '1.91:1' },
  { label: 'Passport 2×2 in', width: 600, height: 600, ratio: '2×2 in' },
]

type BatchItem = {
  id: string
  file: File
  sourceUrl: string
  result?: ResizeResult
  resultUrl?: string
  error?: string
  key?: string
}

const faqs = [
  {
    q: 'What is the difference between crop and fit?',
    a: 'Crop (cover) fills the whole frame and discards the edges that fall outside it — right for photos where a centred subject matters. Fit (contain) keeps every pixel and adds white bars where the aspect ratio differs — right for documents, screenshots and anything where nothing may be lost.',
  },
  {
    q: 'Can I resize a whole folder at once?',
    a: 'Yes. Drop several images or a folder — subfolders included — and the current size, sizing mode and format apply to every file. Outputs arrive as one ZIP, named with the target size, and the originals are never modified.',
  },
  {
    q: 'Will resizing to a larger size improve quality?',
    a: 'No. Upscaling adds interpolated pixels, never detail. A 600 px photo exported at 1080 px is softer than the original. The tool still does it, because some platforms reject anything smaller, but the honest expectation is “bigger file, same detail”.',
  },
  {
    q: 'Why do the presets not mention DPI?',
    a: 'Pixels are what social platforms and websites use. DPI only matters for print, where 300 DPI at 2×2 inches means 600×600 pixels — which is the passport preset here. A JPEG tagged 72 DPI and the same pixels tagged 300 DPI look identical on screen.',
  },
  {
    q: 'Is the image uploaded while resizing?',
    a: 'No. The browser decodes the file, draws it on a canvas at the target size and encodes the result in memory. Nothing is transmitted, so you can resize an ID photo or a medical scan without it leaving your device.',
  },
]

const isImageLike = (file: File) =>
  file.type.startsWith('image/') || /\.(heic|heif|avif)$/i.test(file.name)

export function ImageResizer() {
  useSeo({
    ...routeMeta('/tools/image-resizer'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit Image Resizer',
          'Resize one image or a whole folder to exact pixel dimensions with crop or fit presets, locally in the browser.',
          '/tools/image-resizer',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [file, setFile] = useState<File | null>(null)
  const [width, setWidth] = useState(1080)
  const [height, setHeight] = useState(1080)
  const [fit, setFit] = useState<'cover' | 'contain'>('cover')
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg')
  const [output, setOutput] = useState<{ data: ResizeResult; key: string; url: string } | null>(null)
  const [failure, setFailure] = useState<{ message: string; key: string } | null>(null)
  const [source, setSource] = useState<{ width: number; height: number } | null>(null)
  const [batch, setBatch] = useState<BatchItem[]>([])
  const [running, setRunning] = useState(false)

  const resultUrlRef = useRef('')
  const batchUrls = useRef<string[]>([])
  const settingsKey = `${width}x${height}-${fit}-${format}`
  const result = output?.key === settingsKey ? output.data : null
  const error = failure?.key === settingsKey ? failure.message : null
  const busy = !!file && output?.key !== settingsKey && failure?.key !== settingsKey
  const previewUrl = output?.url ?? ''

  useEffect(() => {
    return () => {
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current)
      batchUrls.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const pick = (files: File[]) => {
    const supported = files.filter(isImageLike)
    if (supported.length === 0) return

    if (supported.length === 1 && batch.length === 0) {
      const image = supported[0]
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current)
      resultUrlRef.current = ''
      setFile(image)
      setSource(null)
      setOutput(null)
      setFailure(null)

      toDecodableImage(image)
        .then((decodable) => createImageBitmap(decodable))
        .then((bitmap) => {
          setSource({ width: bitmap.width, height: bitmap.height })
          bitmap.close()
        })
        .catch(() => setSource(null))
      return
    }

    const additions: BatchItem[] = supported.map((image) => {
      const sourceUrl = URL.createObjectURL(image)
      batchUrls.current.push(sourceUrl)
      return { id: `${image.name}-${image.size}-${Math.random()}`, file: image, sourceUrl }
    })

    setBatch((prev) => {
      const seeded: BatchItem[] =
        prev.length > 0 || !file
          ? prev
          : (() => {
              const sourceUrl = URL.createObjectURL(file)
              batchUrls.current.push(sourceUrl)
              return [{ id: `${file.name}-${file.size}-seed`, file, sourceUrl }]
            })()
      return [...seeded, ...additions]
    })

    if (file) {
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current)
      resultUrlRef.current = ''
      setFile(null)
      setSource(null)
      setOutput(null)
      setFailure(null)
    }
  }

  useEffect(() => {
    if (!file) return
    let cancelled = false

    ;(async () => {
      try {
        const next = await resizeImage(file, { width, height, fit, format })
        if (cancelled) return
        if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current)
        const url = URL.createObjectURL(next.blob)
        resultUrlRef.current = url
        setOutput({ data: next, key: settingsKey, url })
        setFailure(null)
      } catch (caught) {
        if (cancelled) return
        setFailure({
          message: caught instanceof Error ? caught.message : 'Could not resize this image.',
          key: settingsKey,
        })
      }
    })()

    return () => {
      cancelled = true
    }
  }, [file, width, height, fit, format, settingsKey])

  const reset = () => {
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current)
    resultUrlRef.current = ''
    batchUrls.current.forEach((url) => URL.revokeObjectURL(url))
    batchUrls.current = []
    setFile(null)
    setOutput(null)
    setFailure(null)
    setSource(null)
    setBatch([])
  }

  const removeItem = (id: string) => {
    setBatch((prev) => {
      const target = prev.find((item) => item.id === id)
      if (target) {
        URL.revokeObjectURL(target.sourceUrl)
        if (target.resultUrl) URL.revokeObjectURL(target.resultUrl)
      }
      return prev.filter((item) => item.id !== id)
    })
  }

  const download = () => {
    if (!result || !file) return
    downloadBlob(result.blob, `${baseName(file.name)}-${width}x${height}.${outputExtension(result.type)}`)
  }

  const runBatch = async () => {
    if (running || batch.length === 0) return
    setRunning(true)
    try {
      for (const item of batch) {
        if (item.result && item.key === settingsKey) continue
        try {
          const next = await resizeImage(item.file, { width, height, fit, format })
          const url = URL.createObjectURL(next.blob)
          batchUrls.current.push(url)
          setBatch((prev) =>
            prev.map((entry) =>
              entry.id === item.id
                ? { ...entry, result: next, resultUrl: url, key: settingsKey, error: undefined }
                : entry,
            ),
          )
        } catch {
          setBatch((prev) =>
            prev.map((entry) =>
              entry.id === item.id
                ? { ...entry, error: 'Could not resize this file', key: settingsKey }
                : entry,
            ),
          )
        }
      }
    } finally {
      setRunning(false)
    }
  }

  const downloadBatch = async () => {
    const ready = batch.filter((item) => item.result && item.key === settingsKey)
    if (ready.length === 0) return
    const fileName = (item: BatchItem) =>
      `${baseName(item.file.name)}-${width}x${height}.${outputExtension((item.result as ResizeResult).type)}`

    if (ready.length === 1) {
      downloadBlob((ready[0].result as ResizeResult).blob, fileName(ready[0]))
      return
    }

    const { default: JSZip } = await import('jszip')
    const zip = new JSZip()
    const used = new Set<string>()
    ready.forEach((item) => {
      let name = fileName(item)
      if (used.has(name)) {
        const ext = outputExtension((item.result as ResizeResult).type)
        let counter = 2
        let candidate = `${baseName(item.file.name)}-${width}x${height}-${counter}.${ext}`
        while (used.has(candidate)) {
          counter += 1
          candidate = `${baseName(item.file.name)}-${width}x${height}-${counter}.${ext}`
        }
        name = candidate
      }
      used.add(name)
      zip.file(name, (item.result as ResizeResult).blob)
    })
    const blob = await zip.generateAsync({ type: 'blob' })
    downloadBlob(blob, `quietkit-resized-${width}x${height}.zip`)
  }

  const activePreset = PRESETS.find(
    (preset) => preset.width === width && preset.height === height,
  )
  const stale = batch.some((item) => item.key !== settingsKey)
  const readyCount = batch.filter((item) => item.result && item.key === settingsKey).length
  const beforeBytes = batch.reduce((sum, item) => sum + item.file.size, 0)
  const afterBytes = batch.reduce(
    (sum, item) => sum + (item.result && item.key === settingsKey ? item.result.blob.size : 0),
    0,
  )

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Images</span>
          <h1>Resize an image to the exact size a platform asks for</h1>
          <p>
            Pick 1080×1080 for a post, 1584×396 for a banner, or type your own numbers. Crop to
            fill or fit the whole picture — one image, or a whole folder at the same size.
            Processed in this tab, with nothing uploaded.
          </p>
        </div>
      </section>

      <div className="container workspace">
        <div>
          <div className="panel">
            {!file && batch.length === 0 ? (
              <Dropzone
                accept="image/*,.heic,.heif"
                multiple
                title="Drop images here, or click to choose"
                hint="HEIC · JPEG · PNG · WebP · AVIF — one file or a whole folder"
                icon={<ImageIcon size={30} />}
                onFiles={pick}
              />
            ) : batch.length > 0 ? (
              <>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="panel-title" style={{ marginBottom: 0 }}>
                    {batch.length} image{batch.length === 1 ? '' : 's'} · target {width}×{height}
                  </span>
                  <button className="btn btn-sm" onClick={reset}>
                    <TrashIcon size={14} /> Clear
                  </button>
                </div>

                <div className="result-list">
                  {batch.map((item) => {
                    const fresh = item.result && item.key === settingsKey
                    return (
                      <div key={item.id} className="result-row">
                        <img className="thumb" src={item.sourceUrl} alt="" loading="lazy" />
                        <div style={{ minWidth: 0 }}>
                          <div className="result-name">{item.file.name}</div>
                          <div className="result-sub">
                            {item.error ? (
                              <span style={{ color: 'var(--danger)' }}>{item.error}</span>
                            ) : fresh ? (
                              <>
                                {item.result?.width}×{item.result?.height} ·{' '}
                                {formatBytes(item.result?.blob.size ?? 0)} ·{' '}
                                {formatBytes(item.file.size)} in
                              </>
                            ) : item.result ? (
                              'settings changed — resize again'
                            ) : (
                              `${formatBytes(item.file.size)} · waiting`
                            )}
                          </div>
                        </div>
                        <div className="row" style={{ gap: 6 }}>
                          {fresh && item.resultUrl && (
                            <button
                              className="btn btn-sm"
                              onClick={() => {
                                if (item.resultUrl && item.result) {
                                  downloadBlob(item.result.blob, `${baseName(item.file.name)}-${width}x${height}.${outputExtension(item.result.type)}`)
                                }
                              }}
                              aria-label={`Download resized ${item.file.name}`}
                            >
                              <DownloadIcon size={14} />
                            </button>
                          )}
                          <button
                            className="btn btn-sm"
                            onClick={() => removeItem(item.id)}
                            aria-label={`Remove ${item.file.name}`}
                          >
                            <TrashIcon size={14} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="row" style={{ marginTop: 20, justifyContent: 'space-between' }}>
                  <button className="btn btn-forest" onClick={runBatch} disabled={running}>
                    {running
                      ? 'Resizing locally…'
                      : stale || readyCount === 0
                        ? `Resize ${batch.length} image${batch.length === 1 ? '' : 's'}`
                        : 'Resize again'}
                  </button>
                  {readyCount > 0 && (
                    <button className="btn" onClick={downloadBatch}>
                      <DownloadIcon size={16} />{' '}
                      {readyCount === 1 ? 'Download' : `Download ${readyCount} as ZIP`}
                    </button>
                  )}
                </div>

                {readyCount > 0 && (
                  <div className="stat-grid" style={{ marginTop: 18 }}>
                    <div className="stat">
                      <dt>Resized</dt>
                      <dd>
                        {readyCount} of {batch.length}
                      </dd>
                    </div>
                    <div className="stat">
                      <dt>Before</dt>
                      <dd>{formatBytes(beforeBytes)}</dd>
                    </div>
                    <div className="stat">
                      <dt>After</dt>
                      <dd>{formatBytes(afterBytes)}</dd>
                    </div>
                  </div>
                )}

                <div className="row" style={{ marginTop: 16 }}>
                  <label className="btn btn-sm" style={{ cursor: 'pointer' }}>
                    <PlusIcon size={14} /> Add images
                    <input
                      type="file"
                      accept="image/*,.heic,.heif"
                      multiple
                      className="sr-only"
                      onChange={(event) => {
                        if (event.target.files) pick(Array.from(event.target.files))
                        event.currentTarget.value = ''
                      }}
                    />
                  </label>
                </div>
              </>
            ) : (
              <>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="panel-title" style={{ marginBottom: 0 }}>
                    {file?.name}
                    {source ? ` · ${source.width}×${source.height}` : ''} ·{' '}
                    {formatBytes(file?.size ?? 0)}
                  </span>
                  <button className="btn btn-sm" onClick={reset}>
                    <TrashIcon size={14} /> Start over
                  </button>
                </div>

                <div className="row" style={{ marginTop: 18, gap: 18, alignItems: 'flex-start' }}>
                  <div
                    style={{
                      border: '1px solid var(--line)',
                      borderRadius: 'var(--radius-sm)',
                      padding: 8,
                      background: 'var(--paper-2)',
                      flexShrink: 0,
                    }}
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Resized preview"
                        style={{ maxWidth: 240, maxHeight: 240, display: 'block' }}
                      />
                    ) : (
                      <span className="thumb-file" style={{ width: 120, height: 120 }}>
                        IMG
                      </span>
                    )}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="result-sub" style={{ fontSize: 14 }}>
                      {error ? (
                        <span style={{ color: 'var(--danger)' }}>{error}</span>
                      ) : result ? (
                        <>
                          {result.width}×{result.height} · {formatBytes(result.blob.size)} ·{' '}
                          {outputExtension(result.type).toUpperCase()}
                          {source && result.width > source.width
                            ? ' · upscaled, detail unchanged'
                            : ''}
                        </>
                      ) : (
                        'resizing…'
                      )}
                    </div>
                    {result && (
                      <div className="row" style={{ marginTop: 14 }}>
                        <button className="btn btn-forest btn-sm" onClick={download}>
                          <DownloadIcon size={14} /> Download ({formatBytes(result.blob.size)})
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="panel" style={{ marginTop: 20 }}>
            <span className="panel-title">Presets</span>
            <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  className={`btn btn-sm${activePreset?.label === preset.label ? ' btn-forest' : ''}`}
                  onClick={() => {
                    setWidth(preset.width)
                    setHeight(preset.height)
                  }}
                >
                  {preset.label} · {preset.width}×{preset.height}
                </button>
              ))}
            </div>

            <div className="controls" style={{ marginTop: 22 }}>
              <div className="field">
                <label htmlFor="resize-width">Width (px)</label>
                <input
                  id="resize-width"
                  type="number"
                  min={16}
                  max={8000}
                  value={width}
                  onChange={(event) => setWidth(clamp(Number(event.target.value)))}
                />
              </div>
              <div className="field">
                <label htmlFor="resize-height">Height (px)</label>
                <input
                  id="resize-height"
                  type="number"
                  min={16}
                  max={8000}
                  value={height}
                  onChange={(event) => setHeight(clamp(Number(event.target.value)))}
                />
              </div>
              <div className="field">
                <span className="field-label">Sizing</span>
                <div className="segmented">
                  <button aria-pressed={fit === 'cover'} onClick={() => setFit('cover')}>
                    Crop to fill
                  </button>
                  <button aria-pressed={fit === 'contain'} onClick={() => setFit('contain')}>
                    Fit whole image
                  </button>
                </div>
              </div>
              <div className="field">
                <span className="field-label">Output</span>
                <div className="segmented">
                  {[
                    { label: 'JPEG', value: 'image/jpeg' as const },
                    { label: 'PNG', value: 'image/png' as const },
                    { label: 'WebP', value: 'image/webp' as const },
                  ].map((option) => (
                    <button
                      key={option.value}
                      aria-pressed={format === option.value}
                      onClick={() => setFormat(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {busy && <p className="small muted" style={{ marginTop: 10 }}>Resizing locally…</p>}
            {batch.length > 0 && (
              <p className="small muted" style={{ marginTop: 10 }}>
                These settings apply to all {batch.length} images when you press Resize.
              </p>
            )}
          </div>

          <div style={{ marginTop: 20 }}>
            <AdSlot />
          </div>
        </div>

        <aside className="stack-md">
          <div className="panel">
            <span className="panel-title">Exact pixels</span>
            <p className="small muted">
              The output is exactly the size you asked for — no rounding, no “roughly square”. Crop
              mode centres the image; fit mode pads the shorter side with white.
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
                  <CheckIcon size={15} /> Compress it to a size limit
                </Link>
              </li>
              <li>
                <Link to="/tools/image-converter" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Convert the format instead
                </Link>
              </li>
              <li>
                <Link to="/guides/social-media-image-sizes" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Guide: sizes per platform
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="section">
        <div className="container-narrow prose">
          <h2>Why the exact number matters</h2>
          <p>
            Platforms crop and re-compress whatever you upload. If your 4032×3024 phone photo is
            uploaded to a square feed, the platform crops it for you — usually centred, which is
            rarely where your subject is. Resizing first means you decide what gets cut and what
            stays sharp.
          </p>
          <p>
            Exact dimensions also avoid the quiet quality loss from double compression: many
            platforms re-encode anything they have to resize, and every re-encode loses a little.
          </p>

          <h3>Crop or fit, in one sentence each</h3>
          <ul>
            <li>
              <strong>Crop to fill</strong> — the frame is filled edge to edge; anything outside the
              new aspect ratio is discarded. Best for photos, worst for text near the edges.
            </li>
            <li>
              <strong>Fit whole image</strong> — nothing is lost; white bars appear where the
              proportions differ. Best for documents, slides and screenshots.
            </li>
          </ul>

          <h3>A whole folder at one size</h3>
          <p>
            Listing photos, a seller's catalogue or a set of screenshots usually needs the same
            dimensions everywhere. Drop the folder — subfolders included — choose the size once,
            and every JPEG, PNG, WebP, AVIF or HEIC file is resized with the same rule. Results
            are named <code>name-1080x1080.jpg</code> and packaged into one ZIP, so the originals
            stay untouched.
          </p>

          <h3>A note on upscaling</h3>
          <p>
            If the source is smaller than the target, the browser interpolates. The file becomes
            larger and softer, without gaining detail. The tool says so in the result line rather
            than pretending the output is better.
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

function clamp(value: number): number {
  if (!Number.isFinite(value)) return 16
  return Math.min(8000, Math.max(16, Math.round(value)))
}
