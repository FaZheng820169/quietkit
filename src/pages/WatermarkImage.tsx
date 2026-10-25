import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdSlot } from '../components/AdSlot'
import { Dropzone } from '../components/Dropzone'
import { CheckIcon, DownloadIcon, ImageIcon, LockIcon, TrashIcon } from '../components/Icons'
import { baseName, downloadBlob, formatBytes } from '../lib/files'
import {
  defaultWatermark,
  loadImage,
  previewDataUrl,
  watermarkBatch,
  type WatermarkOptions,
} from '../lib/watermarkImage'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'Will the watermark survive cropping or screenshots?',
    a: 'A tiled watermark across the whole image is the hardest to remove — cropping cuts off some copies but leaves others. A single centred watermark is easier to crop out. For sensitive documents, use tiled mode with low opacity so the text is visible but does not obscure the content.',
  },
  {
    q: 'What opacity should I use?',
    a: 'For a draft or internal document, 0.12–0.18 is enough to claim ownership without annoying the reader. For a photo you are sending to a client, 0.25–0.35 makes removal harder. Above 0.4 the watermark starts to hide the image itself.',
  },
  {
    q: 'Can I watermark a whole folder at once?',
    a: 'Yes. Drop multiple images and the tool applies the same text, size, angle and opacity to every file, then downloads them all as a ZIP. Each file keeps its original format — JPEG stays JPEG, PNG stays PNG.',
  },
  {
    q: 'Does the watermark change the image quality?',
    a: 'The image is re-encoded once after the watermark is drawn. JPEG output is saved at 92% quality, which is visually identical to the original for photos. PNG and WebP keep their lossless or original compression. The watermark text itself is drawn as sharp vector shapes.',
  },
  {
    q: 'Is my image uploaded to add the watermark?',
    a: 'No. The image is decoded by the browser, the watermark is drawn on a canvas, and the result is encoded back to a file — all in memory. Open the Network panel and drop a photo: nothing is sent anywhere.',
  },
]

export function WatermarkImage() {
  useSeo({
    ...routeMeta('/tools/image-watermark'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit Image Watermark',
          'Add a tiled or centred text watermark to photos and screenshots entirely in your browser. Batch a whole folder, download as ZIP — nothing uploaded.',
          '/tools/image-watermark',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [files, setFiles] = useState<File[]>([])
  const [previewImg, setPreviewImg] = useState<HTMLImageElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [working, setWorking] = useState(false)
  const [opts, setOpts] = useState<WatermarkOptions>(defaultWatermark)

  const preview = useMemo(() => {
    if (!previewImg) return null
    return previewDataUrl(previewImg, opts)
  }, [previewImg, opts])

  const pick = async (picked: File[]) => {
    setError(null)
    setFiles(picked)
    setPreviewImg(null)
    if (picked.length > 0) {
      try {
        const img = await loadImage(picked[0])
        setPreviewImg(img)
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'Could not read the first image.')
      }
    }
  }

  const reset = () => {
    setFiles([])
    setPreviewImg(null)
    setError(null)
  }

  const download = async () => {
    if (files.length === 0) return
    setWorking(true)
    setError(null)
    try {
      const results = await watermarkBatch(files, opts)
      if (results.length === 1) {
        downloadBlob(results[0].blob, results[0].name)
      } else {
        const JSZip = (await import('jszip')).default
        const zip = new JSZip()
        results.forEach((r) => zip.file(r.name, r.blob))
        const zipBlob = await zip.generateAsync({ type: 'blob' })
        downloadBlob(zipBlob, `${baseName(files[0].name)}-watermarked.zip`)
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not watermark the images.')
    } finally {
      setWorking(false)
    }
  }

  const totalSize = files.reduce((sum, f) => sum + f.size, 0)

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Images</span>
          <h1>Watermark photos without sending them anywhere</h1>
          <p>
            Add a tiled or centred text watermark to one image or a whole folder. Preview the
            result before you download — everything runs in this tab.
          </p>
        </div>
      </section>

      <div className="container workspace">
        <div>
          {files.length === 0 ? (
            <Dropzone
              accept="image/*"
              multiple
              title="Drop photos here"
              hint="JPEG, PNG or WebP — one file or a whole folder"
              icon={<ImageIcon size={30} />}
              onFiles={pick}
            />
          ) : (
            <div className="panel">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div>
                  <span className="panel-title">
                    {files.length === 1 ? 'One image' : `${files.length} images`}
                  </span>
                  <p className="small muted" style={{ marginTop: 6 }}>
                    {formatBytes(totalSize)} total
                  </p>
                </div>
                <button className="btn" onClick={reset}>
                  <TrashIcon size={15} /> Change images
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="notice notice-error" style={{ marginTop: 16 }}>
              {error}
            </div>
          )}

          {files.length > 0 && (
            <div className="panel" style={{ marginTop: 20 }}>
              <span className="panel-title">Watermark settings</span>

              <div className="field" style={{ marginTop: 14 }}>
                <span className="field-label">Text</span>
                <input
                  type="text"
                  value={opts.text}
                  onChange={(e) => setOpts({ ...opts, text: e.target.value })}
                  placeholder="CONFIDENTIAL"
                />
              </div>

              <div className="field" style={{ marginTop: 14 }}>
                <span className="field-label">
                  Opacity — {Math.round(opts.opacity * 100)}%
                </span>
                <input
                  type="range"
                  min={0.05}
                  max={0.5}
                  step={0.01}
                  value={opts.opacity}
                  onChange={(e) => setOpts({ ...opts, opacity: Number(e.target.value) })}
                />
              </div>

              <div className="field" style={{ marginTop: 14 }}>
                <span className="field-label">Angle — {opts.angle}°</span>
                <input
                  type="range"
                  min={-90}
                  max={90}
                  step={5}
                  value={opts.angle}
                  onChange={(e) => setOpts({ ...opts, angle: Number(e.target.value) })}
                />
              </div>

              <div className="field" style={{ marginTop: 14 }}>
                <span className="field-label">Size — {Math.round(opts.fontSize * 100)}% of width</span>
                <input
                  type="range"
                  min={0.03}
                  max={0.12}
                  step={0.01}
                  value={opts.fontSize}
                  onChange={(e) => setOpts({ ...opts, fontSize: Number(e.target.value) })}
                />
              </div>

              <div className="field" style={{ marginTop: 14 }}>
                <span className="field-label">Colour</span>
                <div className="row" style={{ gap: 10 }}>
                  <input
                    type="color"
                    value={opts.color}
                    onChange={(e) => setOpts({ ...opts, color: e.target.value })}
                    style={{ width: 44, height: 36, padding: 2, border: '1px solid var(--line)' }}
                  />
                  <div className="segmented">
                    <button
                      aria-pressed={opts.tiled}
                      onClick={() => setOpts({ ...opts, tiled: true })}
                    >
                      Tiled
                    </button>
                    <button
                      aria-pressed={!opts.tiled}
                      onClick={() => setOpts({ ...opts, tiled: false })}
                    >
                      Centred
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {preview && (
            <div className="panel" style={{ marginTop: 20 }}>
              <span className="panel-title">Preview</span>
              <div style={{ marginTop: 12, textAlign: 'center' }}>
                <img
                  src={preview}
                  alt="Watermarked preview"
                  style={{ maxWidth: '100%', borderRadius: 8, border: '1px solid var(--line)' }}
                />
              </div>
            </div>
          )}

          {files.length > 0 && (
            <div className="row" style={{ marginTop: 20, justifyContent: 'space-between' }}>
              <button className="btn btn-forest" onClick={download} disabled={working || !opts.text.trim()}>
                <DownloadIcon size={16} /> {working ? 'Working…' : files.length === 1 ? 'Download image' : 'Download ZIP'}
              </button>
              <span className="small muted">
                {files.length === 1 ? 'Same format as original' : `${files.length} files in one ZIP`}
              </span>
            </div>
          )}

          <div style={{ marginTop: 20 }}>
            <AdSlot />
          </div>
        </div>

        <aside className="stack-md">
          <div className="panel">
            <span className="panel-title">What you get</span>
            <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
              {[
                'Tiled watermark for maximum protection',
                'Centred watermark for a subtle mark',
                'Live preview before download',
                'Batch a whole folder to ZIP',
                'Original format preserved',
              ].map((item) => (
                <li key={item} className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="panel">
            <span className="panel-title">Related</span>
            <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
              <li>
                <Link to="/guides/watermark-image-without-upload" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Guide: watermark photos without the upload
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-watermark" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Watermark a PDF instead
                </Link>
              </li>
              <li>
                <Link to="/tools/image-compressor" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Compress the watermarked images
                </Link>
              </li>
              <li>
                <Link to="/tools/metadata-cleaner" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Remove EXIF before watermarking
                </Link>
              </li>
            </ul>
          </div>

          <div className="panel">
            <span className="panel-title">Local by design</span>
            <p className="small muted">
              The photo is decoded, stamped and re-encoded on a canvas inside this tab. Nothing is
              uploaded, so an unreleased product shot stays unreleased.
            </p>
            <div className="row" style={{ marginTop: 14 }}>
              <LockIcon size={16} /> <span className="small">0 bytes uploaded</span>
            </div>
          </div>
        </aside>
      </div>

      <section className="section">
        <div className="container-narrow prose">
          <h2>Why watermark locally</h2>
          <p>
            A watermark is often applied to images you do not want to share yet — client proofs,
            product photos, internal documents. Sending those files to a server defeats the point.
            This tool draws the watermark on a canvas in your browser, so the only copy of the
            image is the one on your device.
          </p>

          <h2>Tiled versus centred</h2>
          <p>
            A tiled watermark repeats the text across the whole image at a shallow angle. It is
            the standard for proofs and confidential documents because cropping cannot remove it.
            A centred watermark sits once in the middle — better for a subtle copyright notice on
            a portfolio photo where the image itself is the point.
          </p>

          <h2>Choosing the right opacity</h2>
          <p>
            Too light and the watermark is invisible; too heavy and it obscures the image. Start
            at 18% for tiled text on documents, 25% for photos. If the watermark will be viewed at
            thumbnail size, go heavier — small text disappears when the image is scaled down.
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
