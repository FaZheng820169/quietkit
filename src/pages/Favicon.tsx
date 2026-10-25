import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AdSlot } from '../components/AdSlot'
import { Dropzone } from '../components/Dropzone'
import { CheckIcon, DownloadIcon, ImageIcon, LockIcon, TrashIcon } from '../components/Icons'
import { generateFaviconPackage, loadPreviewImage, previewDataUrls } from '../lib/favicon'
import { baseName, downloadBlob, formatBytes } from '../lib/files'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const PREVIEW_SIZES = [16, 32, 48, 180, 192, 512]

const faqs = [
  {
    q: 'Do I still need a .ico file?',
    a: 'Yes, for the widest compatibility. Internet Explorer and some RSS readers only look for /favicon.ico, and Windows uses the multi-resolution .ico when a site is pinned. Modern browsers prefer the PNG files and the web manifest, but the .ico inside this package keeps the old clients happy.',
  },
  {
    q: 'Why does the package include six different sizes?',
    a: 'Each consumer asks for a different square. Browsers use 16×16 and 32×32 in tabs and bookmarks. iOS uses 180×180 for the home screen. Android Chrome uses 192×192 and 512×512 for the app drawer and splash screen. One source image can cover them all — you only upload once.',
  },
  {
    q: 'Can I use an SVG logo as the source?',
    a: 'Yes. Drop an SVG, PNG, JPG or WebP file and the browser rasterises it to each size. SVG is ideal because it stays sharp at every resolution, but a 512×512 PNG also works perfectly.',
  },
  {
    q: 'Where do I put the files after downloading?',
    a: 'Unzip the package into the root of your website — the same folder as index.html. Reference them with a few link tags: <link rel="icon" href="/favicon.ico" sizes="any">, <link rel="icon" href="/favicon-32x32.png" type="image/png">, <link rel="apple-touch-icon" href="/apple-touch-icon.png">, and <link rel="manifest" href="/site.webmanifest">.',
  },
  {
    q: 'Is the image uploaded to generate the icons?',
    a: 'No. The source image is decoded by the browser, resized on a canvas at each target size, and packed into a ZIP entirely in memory. Open the Network panel and drop the file — nothing is sent anywhere.',
  },
]

export function Favicon() {
  useSeo({
    ...routeMeta('/tools/favicon'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit Favicon Generator',
          'Turn one logo into a complete favicon set — multi-resolution ICO, Apple touch icon, Android Chrome icons and a web manifest — entirely in the browser.',
          '/tools/favicon',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<HTMLImageElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [working, setWorking] = useState(false)

  const pick = (files: File[]) => {
    const image = files[0]
    if (!image) return
    setError(null)
    setFile(image)
    setPreview(null)

    loadPreviewImage(image)
      .then((img) => setPreview(img))
      .catch((caught) =>
        setError(caught instanceof Error ? caught.message : 'Could not read that image.'),
      )
  }

  const reset = () => {
    setFile(null)
    setPreview(null)
    setError(null)
  }

  const download = async () => {
    if (!file) return
    setWorking(true)
    try {
      const { zipBlob } = await generateFaviconPackage(file)
      downloadBlob(zipBlob, `${baseName(file.name)}-favicons.zip`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not build the favicon package.')
    } finally {
      setWorking(false)
    }
  }

  const previews = preview ? previewDataUrls(preview, PREVIEW_SIZES) : []

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Images</span>
          <h1>Favicon generator that works in this tab</h1>
          <p>
            Drop one logo and get a complete favicon package — ICO, Apple touch icon, Android
            Chrome icons and a web manifest — without uploading anything.
          </p>
        </div>
      </section>

      <div className="container workspace">
        <div>
          {!file ? (
            <Dropzone
              accept="image/*,.svg"
              title="Drop a logo here"
              hint="PNG, JPG, WebP or SVG — one file is enough"
              icon={<ImageIcon size={30} />}
              onFiles={pick}
            />
          ) : (
            <div className="panel">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div>
                  <span className="panel-title">Source</span>
                  <p className="small muted" style={{ marginTop: 6 }}>
                    {file.name} · {formatBytes(file.size)}
                  </p>
                </div>
                <button className="btn" onClick={reset}>
                  <TrashIcon size={15} /> Change image
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="notice notice-error" style={{ marginTop: 16 }}>
              {error}
            </div>
          )}

          {preview && (
            <div className="panel" style={{ marginTop: 20 }}>
              <span className="panel-title">Preview at each size</span>
              <div
                className="row"
                style={{ gap: 18, flexWrap: 'wrap', padding: '18px 0', alignItems: 'flex-end' }}
              >
                {PREVIEW_SIZES.map((size, i) => (
                  <div key={size} style={{ textAlign: 'center' }}>
                    <img
                      src={previews[i]}
                      width={size}
                      height={size}
                      alt={`${size}×${size}`}
                      style={{
                        imageRendering: size <= 48 ? 'pixelated' : 'auto',
                        border: '1px solid var(--line)',
                        borderRadius: 4,
                        background: '#fff',
                      }}
                    />
                    <div className="small muted" style={{ marginTop: 6 }}>
                      {size}×{size}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {file && (
            <div className="row" style={{ marginTop: 20, justifyContent: 'space-between' }}>
              <button className="btn btn-forest" onClick={download} disabled={working}>
                <DownloadIcon size={16} /> {working ? 'Building…' : 'Download ZIP'}
              </button>
              <span className="small muted">7 files · one ZIP</span>
            </div>
          )}

          <div style={{ marginTop: 20 }}>
            <AdSlot />
          </div>
        </div>

        <aside className="stack-md">
          <div className="panel">
            <span className="panel-title">What is inside</span>
            <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
              {[
                'favicon.ico — 16, 32 and 48 px in one file',
                'favicon-16x16.png and 32x32.png',
                'apple-touch-icon.png — 180×180 for iOS',
                'android-chrome-192x192.png and 512x512.png',
                'site.webmanifest — ready to edit',
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
                <Link to="/guides/favicon-without-upload" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Guide: favicons without the upload
                </Link>
              </li>
              <li>
                <Link to="/tools/image-resizer" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Resize a screenshot for social
                </Link>
              </li>
              <li>
                <Link to="/tools/image-converter" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Convert the logo to WebP
                </Link>
              </li>
              <li>
                <Link to="/tools/image-compressor" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Compress the exported PNGs
                </Link>
              </li>
            </ul>
          </div>

          <div className="panel">
            <span className="panel-title">Local by design</span>
            <p className="small muted">
              Your logo is resized on a canvas inside this tab and zipped in memory. Nothing is
              uploaded, so an unreleased brand mark stays unreleased.
            </p>
            <div className="row" style={{ marginTop: 14 }}>
              <LockIcon size={16} /> <span className="small">0 bytes uploaded</span>
            </div>
          </div>
        </aside>
      </div>

      <section className="section">
        <div className="container-narrow prose">
          <h2>One logo, seven files</h2>
          <p>
            A modern favicon is not a single file. Browsers, iOS and Android each expect their
            own size and format. The package this tool builds covers every common case: a
            multi-resolution .ico for legacy browsers and Windows, PNGs for modern browsers,
            an Apple touch icon for the iOS home screen, and Android Chrome icons for the app
            drawer and splash screen. A starter site.webmanifest is included so you can fill in
            your site name and theme colour without looking up the syntax.
          </p>

          <h2>Why SVG is the best source</h2>
          <p>
            SVG is resolution-independent — the same file renders sharply at 16 px and 512 px.
            If your logo is already vector, drop it here and the browser rasterises it to each
            size with no quality loss. A 512×512 PNG works almost as well; anything smaller will
            look soft on high-density screens.
          </p>

          <h2>Installing the package</h2>
          <p>
            Unzip the download into the root of your website, next to index.html. Then add four
            lines to the &lt;head&gt; of your pages. The .ico is declared with sizes="any" so
            browsers that support PNG icons skip it, while older clients still find it. The
            manifest link enables Android’s “add to home screen” prompt.
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
