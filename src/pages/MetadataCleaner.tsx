import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Dropzone } from '../components/Dropzone'
import { AdSlot } from '../components/AdSlot'
import { DownloadIcon, PinIcon, ShieldIcon, TrashIcon, LockIcon, CheckIcon } from '../components/Icons'
import { inspectFile, stripMetadata, type MetaReport } from '../lib/exif'
import { baseName, downloadBlob, extensionOf, formatBytes } from '../lib/files'
import { faqJsonLd, toolJsonLd, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'What exactly is stored inside a photo?',
    a: 'JPEG files carry an EXIF block: camera make and model, lens, exposure settings, the date and time, the software used, and — if location services were on — the precise GPS coordinates. Many phones also add a thumbnail and an XMP block with editing history.',
  },
  {
    q: 'Does removing metadata change how the photo looks?',
    a: 'No. Metadata is a separate block of bytes attached to the image. QuietKit removes those blocks and leaves the compressed image data untouched, so pixels, colours and quality are identical.',
  },
  {
    q: 'Can I recover the removed metadata?',
    a: 'Not from the cleaned file. Once the EXIF and XMP blocks are gone they cannot be restored — which is exactly why you should keep the original if you may need it later.',
  },
  {
    q: 'Which formats can be cleaned?',
    a: 'JPEG (including photos from iPhones, Android and most cameras) and PNG. Other formats such as HEIC, TIFF and RAW are not supported yet; convert them to JPEG first.',
  },
  {
    q: 'Is it enough to post a screenshot instead?',
    a: 'Screenshots drop most EXIF data, but they also lose resolution and look like screenshots. Stripping metadata keeps the original image intact and removes the identifying data at the same time.',
  },
]

export function MetadataCleaner() {
  useSeo({
    title: 'Remove EXIF & GPS metadata from photos — locally | QuietKit',
    description:
      'See the hidden EXIF data in your photos — including GPS coordinates — and strip it in one click. Nothing is uploaded; the file is rewritten in your browser.',
    path: '/tools/metadata-cleaner',
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit Metadata Cleaner',
          'Inspect and remove EXIF, GPS and XMP metadata from JPEG and PNG files in the browser.',
          '/tools/metadata-cleaner',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [file, setFile] = useState<File | null>(null)
  const [report, setReport] = useState<MetaReport | null>(null)
  const [cleaned, setCleaned] = useState<Blob | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setFile(null)
    setReport(null)
    setCleaned(null)
    setError(null)
  }

  const handleFile = async (files: File[]) => {
    const next = files[0]
    if (!next) return
    setFile(next)
    setCleaned(null)
    setError(null)
    setBusy(true)
    try {
      const result = await inspectFile(next)
      setReport(result)
    } catch {
      setReport(null)
      setError('This file is not a JPEG or PNG image. Convert it first, then try again.')
    } finally {
      setBusy(false)
    }
  }

  const strip = async () => {
    if (!file || !report) return
    setBusy(true)
    setError(null)
    try {
      const blob = await stripMetadata(file, report)
      setCleaned(blob)
    } catch {
      setError('Could not rewrite this file. Try a different copy of the image.')
    } finally {
      setBusy(false)
    }
  }

  const download = () => {
    if (!file || !cleaned) return
    const ext = extensionOf(file.name, report?.kind === 'png' ? 'png' : 'jpg')
    downloadBlob(cleaned, `${baseName(file.name)}-clean.${ext}`)
  }

  const groups = report
    ? Array.from(new Set(report.entries.map((entry) => entry.group))).map((group) => ({
        group,
        entries: report.entries.filter((entry) => entry.group === group),
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
            they were taken. Drop a file to see what is inside, then strip it before you share.
          </p>
        </div>
      </section>

      <div className="container workspace">
        <div>
          <div className="panel">
            {!file ? (
              <Dropzone
                accept="image/jpeg,image/png"
                title="Drop a photo here, or click to choose"
                hint="JPEG or PNG · nothing is uploaded · GPS and EXIF are read on your device"
                icon={<PinIcon size={30} />}
                onFiles={handleFile}
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

                {busy && <div className="notice" style={{ marginTop: 16 }}>Reading the file locally…</div>}
                {error && <div className="notice notice-error" style={{ marginTop: 16 }}>{error}</div>}

                {report && (
                  <>
                    {report.hasGps && report.gps ? (
                      <div className="notice notice-error" style={{ marginTop: 16, display: 'block' }}>
                        <strong>This photo contains GPS coordinates.</strong>
                        <div style={{ marginTop: 6 }}>
                          {report.gps.lat.toFixed(5)}, {report.gps.lng.toFixed(5)} —{' '}
                          <a
                            href={`https://www.openstreetmap.org/?mlat=${report.gps.lat.toFixed(6)}&mlon=${report.gps.lng.toFixed(6)}#map=15/${report.gps.lat.toFixed(5)}/${report.gps.lng.toFixed(5)}`}
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

                    {report.entries.length > 0 ? (
                      <div style={{ marginTop: 18 }}>
                        <span className="panel-title">Found {report.entries.length} metadata fields</span>
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

                    <div className="row" style={{ marginTop: 20, justifyContent: 'space-between' }}>
                      <div className="row">
                        <button className="btn btn-forest" onClick={strip} disabled={busy}>
                          <ShieldIcon size={16} /> {busy ? 'Stripping…' : 'Strip all metadata'}
                        </button>
                        {cleaned && (
                          <button className="btn" onClick={download}>
                            <DownloadIcon size={16} /> Download clean image
                          </button>
                        )}
                        {cleaned && (
                          <button className="btn" onClick={() => setCleaned(null)}>
                            compare
                          </button>
                        )}
                      </div>
                    </div>

                    {cleaned && (
                      <div className="stat-grid" style={{ marginTop: 18 }}>
                        <div className="stat">
                          <dt>Before</dt>
                          <dd>{formatBytes(file.size)}</dd>
                        </div>
                        <div className="stat">
                          <dt>After</dt>
                          <dd>{formatBytes(cleaned.size)}</dd>
                        </div>
                        <div className="stat">
                          <dt>Metadata</dt>
                          <dd style={{ color: 'var(--forest)' }}>removed</dd>
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
                <Link to="/tools/image-compressor" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Compress the cleaned photo
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
              JPEG (including iPhone and Android photos) and PNG. HEIC support is on the roadmap.
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
