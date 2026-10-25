import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Dropzone } from '../components/Dropzone'
import { AdSlot } from '../components/AdSlot'
import { DownloadIcon, PinIcon, PlusIcon, ShieldIcon, TrashIcon, LockIcon, CheckIcon } from '../components/Icons'
import { inspectFile, stripMetadata, type MetaReport } from '../lib/exif'
import { baseName, downloadBlob, extensionOf, formatBytes } from '../lib/files'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

type Item = {
  id: string
  file: File
  report?: MetaReport
  error?: string
  cleaned?: Blob
  url?: string
}

const faqs = [
  {
    q: 'What exactly is stored inside a photo?',
    a: 'JPEG files carry an EXIF block: camera make and model, lens, exposure settings, the date and time, the software used, and — if location services were on — the precise GPS coordinates. Many phones also add a thumbnail and an XMP block with editing history.',
  },
  {
    q: 'Can I clean a whole folder at once?',
    a: 'Yes. Drop several photos, or use “Choose a whole folder” to pick a directory — subfolders included. QuietKit inspects every JPEG and PNG, strips them one after another on your device, and hands back a single ZIP with the cleaned copies. Nothing is uploaded at any point.',
  },
  {
    q: 'Does removing metadata change how the photo looks?',
    a: 'No. Metadata is a separate block of bytes attached to the image. QuietKit removes those blocks and leaves the compressed image data untouched, so pixels, colours and quality are identical. The orientation tag is kept on purpose so portrait photos still display upright.',
  },
  {
    q: 'Can I recover the removed metadata?',
    a: 'Not from the cleaned file. Once the EXIF and XMP blocks are gone they cannot be restored — which is exactly why you should keep the original if you may need it later.',
  },
  {
    q: 'Which formats can be cleaned?',
    a: 'JPEG (including photos from iPhones, Android and most cameras) and PNG. HEIC files have to be converted to JPEG first — the converter on this site does that locally — and RAW or TIFF are not supported.',
  },
  {
    q: 'Is it enough to post a screenshot instead?',
    a: 'Screenshots drop most EXIF data, but they also lose resolution and look like screenshots. Stripping metadata keeps the original image intact and removes the identifying data at the same time.',
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

export function MetadataCleaner() {
  useSeo({
    ...routeMeta('/tools/metadata-cleaner'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit Metadata Cleaner',
          'Inspect and remove EXIF, GPS and XMP metadata from JPEG and PNG files — one photo or a whole folder — in the browser.',
          '/tools/metadata-cleaner',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [items, setItems] = useState<Item[]>([])
  const [stripping, setStripping] = useState(false)
  const urls = useRef<string[]>([])

  useEffect(() => {
    const created = urls
    return () => created.current.forEach((url) => URL.revokeObjectURL(url))
  }, [])

  const remove = (id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id)
      if (target?.url) URL.revokeObjectURL(target.url)
      return prev.filter((item) => item.id !== id)
    })
  }

  const inspect = async (additions: Item[]) => {
    for (const item of additions) {
      if (item.error) continue
      try {
        const report = await inspectFile(item.file)
        setItems((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, report } : entry)))
      } catch {
        setItems((prev) =>
          prev.map((entry) =>
            entry.id === item.id ? { ...entry, error: 'Damaged or not readable as JPEG/PNG' } : entry,
          ),
        )
      }
    }
  }

  const addFiles = (files: File[]) => {
    const additions: Item[] = files.map((file) => {
      const id = `${file.name}-${file.size}-${Math.random()}`
      const jpeg = file.type === 'image/jpeg' || /\.jpe?g$/i.test(file.name)
      const png = file.type === 'image/png' || /\.png$/i.test(file.name)
      if (jpeg || png) {
        const url = URL.createObjectURL(file)
        urls.current.push(url)
        return { id, file, url }
      }
      const heic = /\.(heic|heif)$/i.test(file.name)
      return {
        id,
        file,
        error: heic ? 'HEIC — convert it to JPG first' : 'Only JPEG and PNG files can be cleaned',
      }
    })
    setItems((prev) => [...prev, ...additions])
    void inspect(additions.filter((item) => !item.error))
  }

  const reset = () => {
    urls.current.forEach((url) => URL.revokeObjectURL(url))
    urls.current = []
    setItems([])
  }

  const strip = async () => {
    const targets = items.filter((item) => item.report && !item.cleaned)
    if (targets.length === 0) return
    setStripping(true)
    try {
      for (const item of targets) {
        try {
          const blob = await stripMetadata(item.file, item.report as MetaReport)
          setItems((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, cleaned: blob } : entry)))
        } catch {
          setItems((prev) =>
            prev.map((entry) =>
              entry.id === item.id ? { ...entry, error: 'Could not rewrite this file' } : entry,
            ),
          )
        }
      }
    } finally {
      setStripping(false)
    }
  }

  const cleanedName = (item: Item): string => {
    const ext = extensionOf(item.file.name, item.report?.kind === 'png' ? 'png' : 'jpg')
    return `${baseName(item.file.name)}-clean.${ext}`
  }

  const downloadOne = (item: Item) => {
    if (item.cleaned) downloadBlob(item.cleaned, cleanedName(item))
  }

  const downloadAll = async () => {
    const ready = items.filter((item) => item.cleaned)
    if (ready.length === 0) return
    if (ready.length === 1) {
      downloadOne(ready[0])
      return
    }
    const { default: JSZip } = await import('jszip')
    const zip = new JSZip()
    const used = new Set<string>()
    ready.forEach((item) => {
      const name = cleanedName(item)
      if (!used.has(name)) {
        used.add(name)
        zip.file(name, item.cleaned as Blob)
        return
      }
      const ext = extensionOf(item.file.name, item.report?.kind === 'png' ? 'png' : 'jpg')
      let counter = 2
      let candidate = `${baseName(item.file.name)}-clean-${counter}.${ext}`
      while (used.has(candidate)) {
        counter += 1
        candidate = `${baseName(item.file.name)}-clean-${counter}.${ext}`
      }
      used.add(candidate)
      zip.file(candidate, item.cleaned as Blob)
    })
    const blob = await zip.generateAsync({ type: 'blob' })
    downloadBlob(blob, 'quietkit-clean-photos.zip')
  }

  const reading = items.some((item) => !item.report && !item.error)
  const inspected = items.filter((item) => item.report)
  const withGps = inspected.filter((item) => item.report?.hasGps).length
  const cleanedItems = items.filter((item) => item.cleaned)
  const strippable = inspected.filter((item) => !item.cleaned)
  const single = items.length === 1 ? items[0] : null

  const beforeBytes = cleanedItems.reduce((sum, item) => sum + item.file.size, 0)
  const afterBytes = cleanedItems.reduce((sum, item) => sum + (item.cleaned as Blob).size, 0)
  const removedBytes = Math.max(0, beforeBytes - afterBytes)

  const groups = single?.report
    ? Array.from(new Set(single.report.entries.map((entry) => entry.group))).map((group) => ({
        group,
        entries: (single.report as MetaReport).entries.filter((entry) => entry.group === group),
      }))
    : []

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Privacy</span>
          <h1>Remove the metadata hiding in your photos</h1>
          <p>
            Photos carry the camera model, the exact time, and often the GPS coordinates where
            they were taken. Inspect one file field by field, or drop a whole folder and strip
            every JPEG and PNG in a single pass.
          </p>
        </div>
      </section>

      <div className="container workspace">
        <div>
          <div className="panel">
            {items.length === 0 ? (
              <>
                <Dropzone
                  accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                  multiple
                  title="Drop photos here, or click to choose"
                  hint="JPEG or PNG · one file or a whole folder · nothing is uploaded"
                  icon={<PinIcon size={30} />}
                  onFiles={addFiles}
                />
                <div className="row" style={{ marginTop: 14, justifyContent: 'center' }}>
                  <FolderPicker onFiles={addFiles} label="Choose a whole folder" />
                </div>
                <p className="small muted" style={{ marginTop: 10, textAlign: 'center' }}>
                  Subfolders are included. Files stay on your device.
                </p>
              </>
            ) : (
              <>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="panel-title" style={{ marginBottom: 0 }}>
                    {items.length} file{items.length === 1 ? '' : 's'} ·{' '}
                    {reading ? 'reading locally…' : `${inspected.length} JPEG/PNG`}
                  </span>
                  <div className="row">
                    <button className="btn btn-sm" onClick={reset}>
                      <TrashIcon size={14} /> Clear
                    </button>
                    {cleanedItems.length > 0 && (
                      <button className="btn btn-sm btn-forest" onClick={downloadAll}>
                        <DownloadIcon size={14} />{' '}
                        {cleanedItems.length === 1 ? 'Download' : `Download ${cleanedItems.length} as ZIP`}
                      </button>
                    )}
                  </div>
                </div>

                {items.length > 1 && withGps > 0 && (
                  <div className="notice notice-error" style={{ marginTop: 16, display: 'block' }}>
                    <strong>
                      GPS coordinates found in {withGps} of {inspected.length} photo
                      {inspected.length === 1 ? '' : 's'}.
                    </strong>{' '}
                    Stripping removes the coordinates, the camera model and the timestamps.
                  </div>
                )}

                {items.length > 1 && withGps === 0 && inspected.length > 0 && (
                  <div className="notice notice-ok" style={{ marginTop: 16 }}>
                    No GPS coordinates found in any file. Camera, timestamp and editing data may
                    still be present.
                  </div>
                )}

                {single ? (
                  <>
                    {single.error && (
                      <div className="notice notice-error" style={{ marginTop: 16 }}>{single.error}</div>
                    )}

                    {single.report && (
                      <>
                        {single.report.hasGps && single.report.gps ? (
                          <div className="notice notice-error" style={{ marginTop: 16, display: 'block' }}>
                            <strong>This photo contains GPS coordinates.</strong>
                            <div style={{ marginTop: 6 }}>
                              {single.report.gps.lat.toFixed(5)}, {single.report.gps.lng.toFixed(5)} —{' '}
                              <a
                                href={`https://www.openstreetmap.org/?mlat=${single.report.gps.lat.toFixed(6)}&mlon=${single.report.gps.lng.toFixed(6)}#map=15/${single.report.gps.lat.toFixed(5)}/${single.report.gps.lng.toFixed(5)}`}
                                target="_blank"
                                rel="noreferrer noopener"
                                style={{ textDecoration: 'underline' }}
                              >
                                view on the map
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="notice notice-ok" style={{ marginTop: 16 }}>
                            No GPS coordinates found. Camera and timestamp data may still be present.
                          </div>
                        )}

                        {single.report.entries.length > 0 ? (
                          <div style={{ marginTop: 18 }}>
                            <span className="panel-title">
                              Found {single.report.entries.length} metadata fields
                            </span>
                            {groups.map((group) => (
                              <div key={group.group} style={{ marginBottom: 18 }}>
                                <h3
                                  style={{
                                    fontSize: 13,
                                    fontFamily: 'var(--mono)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    color: 'var(--ink-3)',
                                    marginBottom: 6,
                                  }}
                                >
                                  {group.group}
                                </h3>
                                <table className="kv">
                                  <tbody>
                                    {group.entries.map((entry) => (
                                      <tr key={`${entry.label}-${entry.value}`}>
                                        <th>{entry.label}</th>
                                        <td>{entry.value}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="notice notice-ok" style={{ marginTop: 16 }}>
                            This file has no readable EXIF or XMP metadata. You can still re-save it
                            to be certain.
                          </div>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <div className="result-list">
                    {items.map((item) => (
                      <div key={item.id} className="result-row">
                        {item.url ? (
                          <img className="thumb" src={item.url} alt="" loading="lazy" />
                        ) : (
                          <span className="thumb-file">{/\.png$/i.test(item.file.name) ? 'PNG' : 'JPG'}</span>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div className="result-name">{item.file.name}</div>
                          <div className="result-sub">
                            {item.error ? (
                              <span style={{ color: 'var(--danger)' }}>{item.error}</span>
                            ) : item.report ? (
                              <>
                                {formatBytes(item.file.size)} · {item.report.entries.length} field
                                {item.report.entries.length === 1 ? '' : 's'}
                                {item.report.hasGps && (
                                  <>
                                    {' · '}
                                    <span style={{ color: 'var(--danger)' }}>GPS</span>
                                  </>
                                )}
                                {item.cleaned && <span className="saved"> · cleaned</span>}
                              </>
                            ) : (
                              'reading locally…'
                            )}
                          </div>
                        </div>
                        <div className="row" style={{ gap: 6 }}>
                          {item.cleaned && (
                            <button
                              className="btn btn-sm"
                              onClick={() => downloadOne(item)}
                              aria-label={`Download cleaned ${item.file.name}`}
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
                  </div>
                )}

                <div className="row" style={{ marginTop: 20, justifyContent: 'space-between' }}>
                  <div className="row">
                    <button className="btn btn-forest" onClick={strip} disabled={stripping || strippable.length === 0}>
                      <ShieldIcon size={16} />{' '}
                      {stripping
                        ? 'Stripping locally…'
                        : strippable.length > 0
                          ? `Strip ${strippable.length} file${strippable.length === 1 ? '' : 's'}`
                          : inspected.length > 0 && cleanedItems.length === inspected.length
                            ? 'All files stripped'
                            : 'Nothing to strip'}
                    </button>
                  </div>
                  <div className="row">
                    <label className="btn btn-sm" style={{ cursor: 'pointer' }}>
                      <PlusIcon size={14} /> Add photos
                      <input
                        type="file"
                        accept="image/jpeg,image/png,.jpg,.jpeg,.png"
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

                {cleanedItems.length > 0 && (
                  <div className="stat-grid" style={{ marginTop: 18 }}>
                    <div className="stat">
                      <dt>Cleaned</dt>
                      <dd>
                        {cleanedItems.length} file{cleanedItems.length === 1 ? '' : 's'}
                      </dd>
                    </div>
                    <div className="stat">
                      <dt>Before</dt>
                      <dd>{formatBytes(beforeBytes)}</dd>
                    </div>
                    <div className="stat">
                      <dt>After</dt>
                      <dd>
                        {formatBytes(afterBytes)}
                        {removedBytes > 0 && (
                          <span className="result-sub" style={{ display: 'block' }}>
                            {formatBytes(removedBytes)} removed
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
            <span className="panel-title">Why this matters</span>
            <p className="small muted">
              Posting a photo of your flat with GPS coordinates attached publishes your address.
              Resale listings, dating profiles and marketplace photos are the usual culprits.
            </p>
            <div className="row" style={{ marginTop: 14 }}>
              <LockIcon size={16} /> <span className="small">Local rewrite · 0 bytes uploaded</span>
            </div>
          </div>

          <div className="panel">
            <span className="panel-title">Next step</span>
            <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
              <li>
                <Link to="/tools/image-converter" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Convert HEIC photos to JPG first
                </Link>
              </li>
              <li>
                <Link to="/tools/image-compressor" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Compress the cleaned photos
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-merge" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Merge PDFs locally
                </Link>
              </li>
            </ul>
          </div>

          <div className="panel">
            <span className="panel-title">Supported</span>
            <p className="small muted">
              JPEG (including iPhone and Android photos) and PNG, one file or a whole folder.
              The orientation tag is kept so photos still display upright.
            </p>
          </div>
        </aside>
      </div>

      <section className="section">
        <div className="container-narrow prose">
          <h2>What EXIF metadata actually contains</h2>
          <p>
            Every time a camera or phone saves a JPEG it writes a small block of tags next to the
            image. Those tags exist to help software display the photo correctly, but they also
            record far more than most people expect:
          </p>
          <ul>
            <li>
              <strong>GPS latitude and longitude</strong>, sometimes accurate to a few metres,
              plus altitude and the direction the lens was facing.
            </li>
            <li>
              <strong>Camera or phone model</strong> and serial number, which can link photos
              from the same device across different posts.
            </li>
            <li>
              <strong>Timestamps</strong> — the second-level time a photo was taken, useful for
              anyone building a profile of your routine.
            </li>
            <li>
              <strong>Software and edit history</strong>, including XMP packets from Lightroom and
              Photoshop.
            </li>
            <li>
              <strong>An embedded thumbnail</strong> that can survive a crop you applied elsewhere.
            </li>
          </ul>

          <h2>Cleaning a whole folder at once</h2>
          <p>
            Selling a phone, listing a flat or clearing out an old photo library means hundreds
            of files, not one. Drop them together, or pick the folder itself — QuietKit walks the
            subfolders, skips anything that is not a JPEG or PNG, and reports which files carried
            GPS coordinates before you strip anything.
          </p>
          <p>
            The cleaned copies keep their original names with a <code>-clean</code> suffix and
            arrive as a single ZIP, so they cannot overwrite the originals by accident. Because
            the work happens in this tab, there is no upload queue, no 20-file limit and no
            account to create.
          </p>

          <h2>How QuietKit removes it</h2>
          <p>
            JPEG files are a sequence of labelled segments. The image data lives in one set of
            segments; metadata lives in others. QuietKit walks the file structure, finds the
            EXIF, XMP and IPTC segments, and rewrites the file without them — keeping the ICC
            colour profile so colours stay correct. PNG files are handled the same way by
            dropping <code>tEXt</code>, <code>iTXt</code>, <code>zTXt</code> and <code>eXIf</code>{' '}
            chunks.
          </p>
          <p>
            One tag is deliberately kept: <strong>orientation</strong>. Without it, portrait
            photos from many phones would suddenly appear sideways in every viewer. It reveals
            nothing about where or when the photo was taken.
          </p>
          <p>
            Because the stream is rebuilt in memory and saved straight to your disk, there is no
            copy on a server that could be logged, scanned or leaked. That is the point.
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
