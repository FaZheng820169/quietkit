import { Link } from 'react-router-dom'
import { ToolCard } from '../components/ToolCard'
import { AdSlot } from '../components/AdSlot'
import { FileIcon, ImageIcon, ShieldIcon, PinIcon, BoltIcon, LockIcon, CheckIcon } from '../components/Icons'
import { faqJsonLd, routeMeta, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'Do my files get uploaded anywhere?',
    a: 'No. Every tool on QuietKit uses browser APIs — Canvas, FileReader and WebAssembly — to read and rewrite your file in memory. There is no upload endpoint to send it to.',
  },
  {
    q: 'How can I verify that?',
    a: 'Open your browser dev tools, switch to the Network tab, then drop a file into any tool. You will see no request carrying your file. You can also load a tool once and switch off your Wi-Fi; it still works.',
  },
  {
    q: 'Is QuietKit really free?',
    a: 'The tools are free with no watermark, no account and no file limits. Future pro features (saved presets, a desktop app) will be paid, but the current tools stay free.',
  },
  {
    q: 'Which browsers are supported?',
    a: 'Current versions of Chrome, Edge, Firefox and Safari on desktop and mobile. Very large files (over 200 MB) depend on how much memory your device has.',
  },
  {
    q: 'What happens to my files after I close the tab?',
    a: 'They are gone. QuietKit keeps the file only in the memory of the open tab and releases it when you close or reload the page.',
  },
]

export function Home() {
  useSeo({ ...routeMeta('/'), jsonLd: faqJsonLd(faqs) })

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">Browser-local file tools</span>
            <h1>
              Your files never leave <em>this tab</em>.
            </h1>
            <p className="hero-lede">
              Compress photos, remove the location data hiding inside them, and merge or read
              PDFs — without uploading a single byte to anyone.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary btn-lg" to="/tools/image-compressor">
                Compress an image
              </Link>
              <Link className="btn btn-lg" to="/tools">
                Browse all tools
              </Link>
            </div>
            <div className="hero-meta">
              <span>
                <i className="dot" /> No uploads
              </span>
              <span>
                <i className="dot" /> No account
              </span>
              <span>
                <i className="dot" /> Works offline
              </span>
            </div>
          </div>

          <div className="hero-panel" aria-hidden="true">
            <div className="hero-panel-bar">
              <i />
              <i />
              <i />
              <span className="hero-panel-title">network monitor</span>
            </div>
            <div className="hero-panel-body">
              <div>
                <strong>POST /upload</strong> … <span className="warn">never called</span>
              </div>
              <div>
                <strong>holiday-photo.jpg</strong> 4.8 MB · processed <span className="ok">in memory</span>
              </div>
              <div>
                <strong>metadata</strong> 38 fields stripped <span className="ok">✓</span>
              </div>
              <div>
                bytes sent to a server <span className="ok">0 B</span>
              </div>
              <div>
                download <span className="ok">ready — 812 KB</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="split" style={{ alignItems: 'end', marginBottom: 34 }}>
            <div>
              <span className="eyebrow">Seventeen tools, no filler</span>
              <h2 style={{ fontSize: 34, marginTop: 14 }}>Fix a file in under a minute.</h2>
            </div>
            <p className="muted" style={{ maxWidth: '46ch' }}>
              We build one small tool at a time, only when it can be done properly in the
              browser. Nothing is “uploaded to our Cloudflare bucket” — there is no bucket.
            </p>
          </div>

          <div className="card-grid">
            <ToolCard
              to="/tools/image-compressor"
              icon={<ImageIcon size={22} />}
              title="Compress images"
              description="Shrink JPEG, PNG and WebP photos by 60–90% with a live before/after preview and a size target."
              meta="JPEG · PNG · WebP"
            />
            <ToolCard
              to="/tools/image-converter"
              icon={<ImageIcon size={22} />}
              title="Convert images"
              description="Turn an iPhone HEIC into JPEG, PNG into JPEG, or a whole folder into WebP — in a single pass, without uploading."
              meta="HEIC · JPG · PNG · WebP"
            />
            <ToolCard
              to="/tools/image-resizer"
              icon={<ImageIcon size={22} />}
              title="Resize images"
              description="Exact pixels for a post, banner or passport photo — one file or a whole folder, crop to fill or fit."
              meta="1080×1080 · folder"
            />
            <ToolCard
              to="/tools/metadata-cleaner"
              icon={<PinIcon size={22} />}
              title="Remove photo metadata"
              description="See the GPS coordinates, camera model and timestamps hidden in your photos, then strip one file or an entire folder."
              meta="EXIF · GPS · XMP"
            />
            <ToolCard
              to="/tools/pdf-metadata"
              icon={<PinIcon size={22} />}
              title="Inspect PDF metadata"
              description="See who a PDF says wrote it, which program produced it and when — then download a copy with the property block emptied."
              meta="Author · XMP · Dates"
            />
            <ToolCard
              to="/tools/pdf-compress"
              icon={<FileIcon size={22} />}
              title="Compress a PDF"
              description="Rebuild a 20 MB scan at a lower resolution and compare the real sizes before keeping the copy — locally, page by page."
              meta="110 · 150 · 200 DPI"
            />
            <ToolCard
              to="/tools/pdf-merge"
              icon={<FileIcon size={22} />}
              title="Merge PDFs"
              description="Combine contracts, scans and exports into a single PDF in the order you choose. No page limits."
              meta="Any number of pages"
            />
            <ToolCard
              to="/tools/pdf-remove-pages"
              icon={<FileIcon size={22} />}
              title="Remove PDF pages"
              description="Cut a blank page, or extract a signed page into its own file — using ranges like 1-3, 7, 10-."
              meta="Pages · Ranges"
            />
            <ToolCard
              to="/tools/pdf-rotate"
              icon={<FileIcon size={22} />}
              title="Rotate PDF pages"
              description="A scanner fed the wrong way leaves every page sideways. Turn them 90° or 180°, all or just the wrong ones."
              meta="90° · 180° · ranges"
            />
            <ToolCard
              to="/tools/pdf-reorder"
              icon={<FileIcon size={22} />}
              title="Reorder PDF pages"
              description="Signature page at the end? Type “4, 1-3, 5” and the order is fixed without dragging thumbnails."
              meta="Order · Ranges"
            />
            <ToolCard
              to="/tools/jpg-to-pdf"
              icon={<ImageIcon size={22} />}
              title="JPG to PDF"
              description="Receipts, scans and phone photos into one PDF — ordered, A4 or Letter, GPS removed."
              meta="Photos · One PDF"
            />
            <ToolCard
              to="/tools/pdf-text"
              icon={<FileIcon size={22} />}
              title="Extract PDF text"
              description="Copy the words out of a PDF page by page, or download the whole document as plain text."
              meta="Copy · .txt"
            />
            <ToolCard
              to="/tools/pdf-page-numbers"
              icon={<FileIcon size={22} />}
              title="Add PDF page numbers"
              description="Stamp a number in any corner, start at any number, and see the first page before you download."
              meta="Preview · Any format"
            />
            <ToolCard
              to="/tools/pdf-watermark"
              icon={<FileIcon size={22} />}
              title="Watermark a PDF"
              description="Put a draft or confidential mark across every page, or just the pages you pick — centred or tiled, and faint enough to read through."
              meta="Diagonal · Tiled"
            />
            <ToolCard
              to="/tools/pdf-resize"
              icon={<FileIcon size={22} />}
              title="Resize PDF pages"
              description="Make every page one sheet — A4, Letter or A3 — fitted to show the whole page or filled to cover it."
              meta="Print · One sheet"
            />
            <ToolCard
              to="/tools/pdf-split"
              icon={<FileIcon size={22} />}
              title="Split a PDF"
              description="Cut one document into a file per page, equal chunks or your own ranges, and take the parts away as a ZIP."
              meta="Any pages · ZIP"
            />
            <ToolCard
              to="/tools/pdf-to-jpg"
              icon={<ImageIcon size={22} />}
              title="PDF to JPG"
              description="Turn pages into JPEGs at 150, 200 or 300 DPI — one per page, white background, ZIP for a whole document."
              meta="150–300 DPI · ZIP"
            />
          </div>

          <div style={{ marginTop: 26 }}>
            <AdSlot />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="split" style={{ alignItems: 'end', marginBottom: 30 }}>
            <div>
              <span className="eyebrow">Guides</span>
              <h2 style={{ fontSize: 32, marginTop: 14 }}>If you want to understand it first.</h2>
            </div>
            <Link className="btn" to="/guides">
              All guides
            </Link>
          </div>
          <div className="card-grid">
            {[
              {
                to: '/guides/heic-to-jpg',
                title: 'Convert HEIC to JPG',
                body: 'Why iPhones save HEIC, where it breaks, and how to convert it without uploading photos.',
              },
              {
                to: '/guides/remove-location-from-photo',
                title: 'Remove location data from a photo',
                body: 'What GPS in a JPEG actually is, and the exact steps on iPhone, Android and Windows.',
              },
              {
                to: '/guides/compress-image-to-100kb',
                title: 'Compress an image to 100 KB',
                body: 'Resize first, then lower quality, then change format — with real size numbers.',
              },
              {
                to: '/guides/merge-pdf-without-upload',
                title: 'Merge PDFs without uploading',
                body: 'Why contracts and IDs should stay on your machine, and how to verify a tool is local.',
              },
              {
                to: '/guides/split-pdf-without-upload',
                title: 'Split a PDF, properly',
                body: 'Three ways to cut a document, what each part keeps, and what a split silently drops.',
              },
              {
                to: '/guides/pdf-to-jpg-without-upload',
                title: 'PDF pages as JPGs',
                body: 'What a page loses when it becomes pixels, the DPI that fits each job, and why margins turn black.',
              },
              {
                to: '/guides/watermark-pdf-without-upload',
                title: 'Watermark a PDF, properly',
                body: 'Status, ownership and protection marks want different settings — and why a text layer beats flattening.',
              },
              {
                to: '/guides/compress-pdf-without-upload',
                title: 'Compress a PDF, honestly',
                body: 'Which files shrink and which refuse to, what a rebuilt copy drops — with real before-and-after numbers.',
              },
              {
                to: '/guides/remove-pdf-metadata',
                title: 'Strip PDF metadata',
                body: 'The author, company and dates a PDF carries invisibly — and how to take the luggage tag off.',
              },
              {
                to: '/guides/jpg-to-pdf-without-upload',
                title: 'Photos into one PDF',
                body: 'Receipts and signed forms photographed on a phone — page size, order and HEIC, handled locally.',
              },
              {
                to: '/guides/exif-viewer',
                title: 'What an EXIF viewer shows',
                body: 'The metadata families, the risky fields, and what f-stop, ISO and focal length mean.',
              },
              {
                to: '/guides/convert-png-to-jpg',
                title: 'Convert PNG to JPG, properly',
                body: 'What transparency costs you, which quality to pick, and how to batch it.',
              },
              {
                to: '/guides/what-is-webp',
                title: 'What is a WebP file?',
                body: 'Where WebP wins, and the email and print workflows where it still fails.',
              },
              {
                to: '/guides/social-media-image-sizes',
                title: 'Social media image sizes',
                body: 'One table for every platform, and why your subject keeps getting cropped.',
              },
            ].map((article) => (
              <Link key={article.to} to={article.to} className="tool-card">
                <h3 style={{ fontSize: 19 }}>{article.title}</h3>
                <p>{article.body}</p>
                <span className="tool-card-foot">Read the guide</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-tight" style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', background: 'var(--paper-2)' }}>
        <div className="container">
          <div className="split">
            <div>
              <span className="eyebrow">How it works</span>
              <h2 style={{ fontSize: 30, margin: '14px 0 10px' }}>Drop. Process. Download.</h2>
              <p className="muted">
                The loop is deliberately short. There is no queue, no waiting for an upload
                progress bar, and nothing to clean up afterwards.
              </p>
            </div>
            <div className="stack-md">
              {[
                {
                  icon: <BoltIcon size={18} />,
                  title: '1 · Drop a file',
                  body: 'The browser hands the bytes straight to the page. Nothing is transmitted.',
                },
                {
                  icon: <ShieldIcon size={18} />,
                  title: '2 · It is processed locally',
                  body: 'Canvas and WebAssembly re-encode the file in your tab, using your device.',
                },
                {
                  icon: <CheckIcon size={18} />,
                  title: '3 · Download and close',
                  body: 'The result is written straight to your disk. Reload the page and the file is gone.',
                },
              ].map((step) => (
                <div key={step.title} className="row" style={{ alignItems: 'flex-start' }}>
                  <span className="tool-card-icon" style={{ width: 34, height: 34, borderRadius: 9 }}>
                    {step.icon}
                  </span>
                  <div>
                    <h3 style={{ fontSize: 18 }}>{step.title}</h3>
                    <p className="muted small" style={{ marginTop: 4 }}>
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <span className="eyebrow">The honest comparison</span>
          <h2 style={{ fontSize: 32, margin: '14px 0 22px' }}>What “free online converter” usually means.</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="compare">
              <thead>
                <tr>
                  <th>&nbsp;</th>
                  <th>QuietKit</th>
                  <th>Typical upload site</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Your file leaves your device</td>
                  <td className="yes">Never</td>
                  <td className="no">Always</td>
                </tr>
                <tr>
                  <td>Account or email required</td>
                  <td className="yes">No</td>
                  <td className="no">Usually</td>
                </tr>
                <tr>
                  <td>Daily conversion limits</td>
                  <td className="yes">None</td>
                  <td className="no">2–5 files</td>
                </tr>
                <tr>
                  <td>Watermark on the result</td>
                  <td className="yes">Never</td>
                  <td className="no">On the free tier</td>
                </tr>
                <tr>
                  <td>Works with the network switched off</td>
                  <td className="yes">Yes, once loaded</td>
                  <td className="no">No</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container">
          <div className="split">
            <div>
              <span className="eyebrow">Questions</span>
              <h2 style={{ fontSize: 30, margin: '14px 0 8px' }}>Straight answers.</h2>
              <p className="muted">
                Still unsure? Read the <Link to="/privacy" style={{ color: 'var(--forest)' }}>privacy policy</Link>,
                which is short because there is very little to disclose.
              </p>
            </div>
            <div className="faq">
              {faqs.map((item) => (
                <details key={item.q}>
                  <summary>{item.q}</summary>
                  <div className="faq-body">{item.a}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div
            className="panel"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 20,
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 30,
              background: 'var(--forest)',
              borderColor: 'var(--forest)',
              color: '#f4faf7',
            }}
          >
            <div>
              <h2 style={{ fontSize: 28, color: '#fff' }}>Start with the photo on your desktop.</h2>
              <p style={{ marginTop: 8, color: '#cfe6dd', maxWidth: '52ch' }}>
                Most photos carry the exact coordinates where they were taken. It takes about
                four seconds to remove them.
              </p>
            </div>
            <div className="row">
              <Link className="btn btn-lg" to="/tools/metadata-cleaner" style={{ background: '#fff6e8', borderColor: '#fff6e8', color: '#14140f' }}>
                <LockIcon size={17} /> Clean a photo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
