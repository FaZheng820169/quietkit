import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Dropzone } from '../components/Dropzone'
import { AdSlot } from '../components/AdSlot'
import { DownloadIcon, ImageIcon, TrashIcon, LockIcon, CheckIcon } from '../components/Icons'
import { compressImage, outputExtension, type CompressResult } from '../lib/image'
import { canDecodeAvif, canEncodeAvif } from '../lib/avif'
import { baseName, downloadBlob, formatBytes } from '../lib/files'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

type Direction = 'from-avif' | 'to-avif'
type FromTarget = 'image/jpeg' | 'image/png' | 'image/webp'

type Item = {
  id: string
  file: File
  doneKey?: string
  result?: CompressResult
  url?: string
  error?: string
}

type Caps = { decode: boolean; encode: boolean }

const faqs = [
  {
    q: 'What is an AVIF file, and why will nothing open it?',
    a: 'AVIF is a modern image format built on the AV1 video codec. Websites and newer phones use it because it is 30–50% smaller than JPEG at the same quality. The catch is support outside browsers: Windows Photos, older editors and many upload forms still reject it, which is why the file you saved or received refuses to open.',
  },
  {
    q: 'Should I convert AVIF to JPG or to PNG?',
    a: 'JPG for photos and for any form or site that only accepts JPEG — the file is small and opens everywhere, but transparent areas are filled with white. PNG when the image has transparency or sharp text you must keep, at the cost of a much larger file. WebP sits between the two and every current browser reads it, but older software may not.',
  },
  {
    q: 'Can I convert JPG to AVIF here as well?',
    a: 'Yes, when your browser has an AVIF encoder — current Chrome and Edge do. QuietKit tests the encoder for real when the page loads: if your browser cannot write AVIF, that direction is disabled with an explanation rather than failing silently or handing you a mislabelled file.',
  },
  {
    q: 'Do converted files keep their transparency?',
    a: 'AVIF and PNG carry an alpha channel, so AVIF to PNG keeps transparency intact. JPEG has no alpha channel at all, so transparent pixels have to become a colour — QuietKit fills them with white, the same default Photoshop uses.',
  },
  {
    q: 'Are the images uploaded during conversion?',
    a: 'No. Decoding and re-encoding happen in this tab with the browser’s own Canvas API. Open the Network panel while converting: no request carries your image, and closing the tab removes every trace of it.',
  },
]

export function AvifConverter() {
  useSeo({
    ...routeMeta('/tools/avif-converter'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit AVIF Converter',
          'Convert AVIF images to JPG, PNG or WebP — or JPG and PNG to AVIF — locally in the browser without uploading them.',
          '/tools/avif-converter',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [items, setItems] = useState<Item[]>([])
  const [direction, setDirection] = useState<Direction>('from-avif')
  const [format, setFormat] = useState<FromTarget>('image/jpeg')
  const [quality, setQuality] = useState(0.9)
  const [busy, setBusy] = useState(false)
  const [caps, setCaps] = useState<Caps | null>(null)

  useEffect(() => {
    let live = true
    Promise.all([canDecodeAvif(), canEncodeAvif()]).then(([decode, encode]) => {
      if (live) setCaps({ decode, encode })
    })
    return () => {
      live = false
    }
  }, [])

  const itemsRef = useRef<Item[]>(items)
  useEffect(() => {
    itemsRef.current = items
  }, [items])

  const lossy = direction === 'to-avif' || format !== 'image/png'
  const targetType = direction === 'from-avif' ? format : 'image/avif'
  const blocked =
    caps === null ||
    (direction === 'from-avif' ? !caps.decode : !caps.encode)
  const settingsKey = `${direction}|${targetType}|${quality}|${blocked ? 'blocked' : 'go'}`

  useEffect(() => {
    if (blocked) return
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
            quality,
            format: targetType,
          })
          // A browser without an AVIF encoder answers toBlob with a PNG blob;
          // that file named .avif would be a lie, so it is an error instead.
          if (targetType === 'image/avif' && result.blob.type !== 'image/avif') {
            throw new Error('This browser cannot encode AVIF — try current Chrome or Edge.')
          }
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
                      direction === 'from-avif'
                        ? 'This browser cannot decode AVIF — try a current browser.'
                        : error instanceof Error
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
  }, [items.length, settingsKey, blocked, quality, targetType, direction])

  const addFiles = (files: File[]) => {
    const images = files.filter((file) =>
      direction === 'from-avif'
        ? file.type === 'image/avif' || /\.avif$/i.test(file.name)
        : ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
    )
    setItems((prev) => [
      ...prev,
      ...images.map((file) => ({ id: `${file.name}-${file.size}-${Math.random()}`, file })),
    ])
  }

  const switchDirection = (next: Direction) => {
    if (next === direction) return
    items.forEach((item) => item.url && URL.revokeObjectURL(item.url))
    setItems([])
    setDirection(next)
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
    downloadBlob(blob, 'quietkit-avif.zip')
  }

  const ready = items.filter((item) => item.result)
  const accept =
    direction === 'from-avif' ? 'image/avif,.avif' : 'image/jpeg,image/png,image/webp'

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Images</span>
          <h1>Convert AVIF to JPG — or back</h1>
          <p>
            AVIF files are small and modern, and half the software on your computer refuses to
            open them. Turn them into JPEG, PNG or WebP anyone can open — one file or fifty, all
            inside this tab. Nothing is sent anywhere.
          </p>
        </div>
      </section>

      <div className="container workspace">
        <div>
          {caps && !caps.decode && (
            <div className="panel" style={{ marginBottom: 20, borderColor: 'var(--danger)' }}>
              <span className="panel-title">This browser cannot read AVIF</span>
              <p className="small muted">
                AVIF decoding ships in current Chrome, Edge, Firefox and Safari. This browser
                failed a real decode test, so AVIF files cannot be converted here — updating the
                browser fixes it. Converting <em>to</em> AVIF is unaffected by this.
              </p>
            </div>
          )}

          <div className="panel">
            {items.length === 0 ? (
              <Dropzone
                accept={accept}
                multiple
                title={
                  direction === 'from-avif'
                    ? 'Drop AVIF images to convert, or click to choose'
                    : 'Drop JPG, PNG or WebP images, or click to choose'
                }
                hint={
                  direction === 'from-avif'
                    ? 'AVIF — converted to your chosen format locally, in batches'
                    : 'JPEG · PNG · WebP — re-encoded as AVIF locally, in batches'
                }
                icon={<ImageIcon size={30} />}
                onFiles={addFiles}
              />
            ) : (
              <>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="panel-title" style={{ marginBottom: 0 }}>
                    {items.length} image{items.length > 1 ? 's' : ''} ·{' '}
                    {busy ? 'converting locally…' : `as ${outputExtension(targetType)}`}
                  </span>
                  <div className="row">
                    <button className="btn btn-sm" onClick={reset}>
                      <TrashIcon size={14} /> Clear
                    </button>
                    <button
                      className="btn btn-sm btn-forest"
                      onClick={downloadAll}
                      disabled={ready.length === 0}
                    >
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
                              {formatBytes(item.file.size)} → {formatBytes(item.result.blob.size)}{' '}
                              ·{' '}
                              <span
                                className={
                                  item.result.blob.size < item.file.size ? 'saved' : undefined
                                }
                              >
                                {item.result.blob.size < item.file.size ? '−' : '+'}
                                {Math.abs(
                                  Math.round(
                                    ((item.result.blob.size - item.file.size) / item.file.size) *
                                      100,
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
                  <AddMore accept={accept} onFiles={addFiles} />
                </div>
              </>
            )}
          </div>

          <div className="panel" style={{ marginTop: 20 }}>
            <span className="panel-title">Settings</span>
            <div className="controls">
              <div className="field">
                <span className="field-label">Direction</span>
                <div className="segmented">
                  <button
                    aria-pressed={direction === 'from-avif'}
                    onClick={() => switchDirection('from-avif')}
                  >
                    AVIF → JPG/PNG
                  </button>
                  <button
                    aria-pressed={direction === 'to-avif'}
                    onClick={() => switchDirection('to-avif')}
                  >
                    JPG/PNG → AVIF
                  </button>
                </div>
                {caps && !caps.encode && direction === 'to-avif' && (
                  <p className="small" style={{ marginTop: 8, color: 'var(--danger)' }}>
                    This browser has no AVIF encoder (it failed a real encode test). Current
                    Chrome or Edge can write AVIF; Firefox and Safari cannot yet.
                  </p>
                )}
              </div>

              {direction === 'from-avif' && (
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
                        onClick={() => setFormat(option.value as FromTarget)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="field">
                <label htmlFor="avif-quality">
                  Quality <span className="field-value">{Math.round(quality * 100)}%</span>
                </label>
                <input
                  id="avif-quality"
                  type="range"
                  min={0.5}
                  max={1}
                  step={0.05}
                  value={quality}
                  disabled={!lossy}
                  onChange={(event) => setQuality(Number(event.target.value))}
                />
                <p className="small muted" style={{ marginTop: 8 }}>
                  {direction === 'to-avif'
                    ? 'AVIF at 90% is visually indistinguishable for photos and still much smaller than JPEG. Lower it only when size matters more than fidelity.'
                    : format === 'image/png'
                      ? 'PNG ignores this setting — it is lossless, so expect larger files.'
                      : '90% is visually lossless for photos. Lower it only when the file must be small.'}
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
              AVIF is decoded and re-encoded by your own browser. There is no upload step, no
              queue and no temporary storage to clean up.
            </p>
            <div className="row" style={{ marginTop: 14 }}>
              <LockIcon size={16} /> <span className="small">0 bytes uploaded</span>
            </div>
          </div>

          <div className="panel">
            <span className="panel-title">Related</span>
            <ul
              className="stack-sm"
              style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}
            >
              <li>
                <Link to="/tools/image-converter" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Convert HEIC, PNG, WebP too
                </Link>
              </li>
              <li>
                <Link to="/tools/image-compressor" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Compress the result further
                </Link>
              </li>
              <li>
                <Link to="/guides/avif-to-jpg" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Guide: AVIF to JPG, properly
                </Link>
              </li>
              <li>
                <Link to="/guides/what-is-webp" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Guide: what is a WebP file
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="section">
        <div className="container-narrow prose">
          <h2>Why AVIF exists — and why it gets stuck</h2>
          <p>
            AVIF compresses photos with the AV1 video codec: the same picture in roughly half the
            bytes of JPEG, with support for transparency and HDR. That is why websites serve it and
            why newer Android phones and iPhones can shoot it. The problem is everything that is
            not a browser — Windows Photos on older builds, many editors, most upload forms and
            nearly every email workflow still expect JPEG or PNG. An AVIF you saved from a website
            or received from a phone is a file you can see but cannot use.
          </p>
          <p>
            Converting it is a decode-and-re-encode job, which is exactly what a browser tab does
            well. The AVIF is decoded to pixels by the same engine that displays it on the web,
            then written out as JPEG, PNG or WebP — locally, so the photo never becomes someone
            else's copy.
          </p>

          <h3>What conversion cannot do</h3>
          <ul>
            <li>
              It cannot add detail. AVIF at heavy compression already threw data away; converting
              to PNG preserves the pixels exactly as they are, softness included.
            </li>
            <li>
              It cannot keep transparency in JPEG — that format has no alpha channel, so
              transparent areas are filled with white.
            </li>
            <li>
              It cannot run in a browser without an AVIF decoder. Current Chrome, Edge, Firefox and
              Safari have one; this page tests for it and says so plainly when it is missing.
            </li>
            <li>
              It does not carry EXIF metadata across — a converted copy is pixels only. Strip or
              keep metadata deliberately with the{' '}
              <Link to="/tools/metadata-cleaner">metadata cleaner</Link>.
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

function AddMore({
  accept,
  onFiles,
}: {
  accept: string
  onFiles: (files: File[]) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <>
      <button className="btn btn-sm" onClick={() => ref.current?.click()}>
        <ImageIcon size={14} /> Add more images
      </button>
      <input
        ref={ref}
        type="file"
        accept={accept}
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
