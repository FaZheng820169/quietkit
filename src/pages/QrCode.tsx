import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, DownloadIcon, LockIcon } from '../components/Icons'
import { downloadBlob } from '../lib/files'
import { encodeQr, qrToPngBlob, qrToSvg, ECC_LEVELS, type EccLevel } from '../lib/qr'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const BORDER = 4

const SIZES = [
  { value: 512, label: '512 px', hint: 'screens and messaging apps' },
  { value: 1024, label: '1024 px', hint: 'presentations and small print' },
  { value: 2048, label: '2048 px', hint: 'posters and shop signage' },
]

const faqs = [
  {
    q: 'Can a QR code expire or stop working?',
    a: 'A static QR code — the kind this page makes — never expires. The text is stored in the pattern itself, so it works as long as whatever it points to exists. Codes that “expire” are dynamic codes sold as a service: they point to the vendor’s redirect server, and they die when the subscription does. Printing a static code keeps you independent of any middleman.',
  },
  {
    q: 'How much text fits in one QR code?',
    a: 'At most 7,089 digits, 4,296 letters-and-numbers, or 2,953 arbitrary bytes — roughly a page and a half of plain text. In practice, phones struggle to scan dense codes at arm’s length, so keep the payload short: a URL under 80 characters scans instantly even on a small printed label. If the code here turns dense, shorten the text rather than lowering the error correction.',
  },
  {
    q: 'Which error correction level should I choose?',
    a: 'Medium (15%) is the everyday default. Choose High (30%) when the code will be scratched, dirty, partly covered or have a logo placed over its centre — that redundancy is what makes a printed code survive real life. The trade-off is density: higher correction packs the same data into more modules, which means a busier pattern that must be printed slightly larger.',
  },
  {
    q: 'Will custom colours still scan?',
    a: 'Usually, if you keep the contrast. Scanners look for dark modules on a light background, so a dark navy on white works and so does black on cream. Light-on-dark inverted codes fail on many older scanners, and pale pastels on white fail almost everywhere. When in doubt, stay near black on white and test with the cheapest phone in the room.',
  },
  {
    q: 'Is the text uploaded anywhere to create the code?',
    a: 'No. The pattern is computed by an encoder running inside this tab — your Wi-Fi password, private URL or contact card never touches a server. Open the Network panel, type, and watch: nothing is sent. That also means the page keeps working offline once loaded, on a plane or in a basement venue.',
  },
]

export function QrCode() {
  useSeo({
    ...routeMeta('/tools/qr-code'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit QR Code Generator',
          'Generate a static QR code for a URL, Wi-Fi password or any text, entirely in the browser. Nothing is uploaded.',
          '/tools/qr-code',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [text, setText] = useState('')
  const [ecc, setEcc] = useState<EccLevel>('M')
  const [size, setSize] = useState(1024)
  const [format, setFormat] = useState<'png' | 'svg'>('png')
  const [dark, setDark] = useState('#15151f')
  const [light, setLight] = useState('#ffffff')

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const bytes = useMemo(() => new TextEncoder().encode(text).length, [text])

  const { qr, error } = useMemo(() => {
    if (!text) return { qr: null, error: null }
    try {
      return { qr: encodeQr(text, ecc), error: null }
    } catch {
      return {
        qr: null,
        error:
          'That is too much text for one QR code — the hard limit is about 2,900 characters. Shorten the payload, or link to a page instead.',
      }
    }
  }, [text, ecc])

  // Live preview: redraw the symbol at an integer module scale on every change.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    if (!qr) {
      canvas.width = 0
      canvas.height = 0
      return
    }
    const full = qr.size + BORDER * 2
    const scale = Math.max(1, Math.floor(280 / full))
    canvas.width = full * scale
    canvas.height = full * scale
    ctx.fillStyle = light
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = dark
    for (let y = 0; y < qr.size; y++) {
      for (let x = 0; x < qr.size; x++) {
        if (qr.getModule(x, y)) {
          ctx.fillRect((x + BORDER) * scale, (y + BORDER) * scale, scale, scale)
        }
      }
    }
  }, [qr, dark, light])

  const download = async () => {
    if (!qr) return
    if (format === 'svg') {
      downloadBlob(new Blob([qrToSvg(qr, BORDER, dark, light)], { type: 'image/svg+xml' }), 'qr-code.svg')
    } else {
      downloadBlob(await qrToPngBlob(qr, size, BORDER, dark, light), 'qr-code.png')
    }
  }

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Everyday</span>
          <h1>QR code generator that never phones home</h1>
          <p>
            Turn a link, a Wi-Fi password or a few lines of text into a QR code that works forever.
            The pattern is computed in this tab — nothing you type is uploaded, ever.
          </p>
        </div>
      </section>

      <div className="container workspace">
        <div>
          <div className="panel">
            <div className="field">
              <label htmlFor="qr-text">Text or link</label>
              <textarea
                id="qr-text"
                rows={4}
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="https://your-site.com — or a Wi-Fi string, a phone number, plain text"
                autoComplete="off"
              />
              <p className="small muted" style={{ marginTop: 8 }}>
                {text.length === 0
                  ? 'The code updates live as you type.'
                  : `${text.length} characters · ${bytes} bytes`}
              </p>
            </div>

            <div className="controls" style={{ marginTop: 6 }}>
              <div className="field">
                <span className="field-label">Error correction</span>
                <div className="segmented">
                  {ECC_LEVELS.map((option) => (
                    <button
                      key={option.value}
                      aria-pressed={ecc === option.value}
                      onClick={() => setEcc(option.value)}
                      title={option.hint}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <span className="field-label">Colours</span>
                <div className="row" style={{ gap: 18 }}>
                  <label className="small row" style={{ gap: 8 }}>
                    <input type="color" value={dark} onChange={(e) => setDark(e.target.value)} />
                    Modules
                  </label>
                  <label className="small row" style={{ gap: 8 }}>
                    <input type="color" value={light} onChange={(e) => setLight(e.target.value)} />
                    Background
                  </label>
                </div>
              </div>

              <div className="field">
                <span className="field-label">Download as</span>
                <div className="segmented">
                  <button aria-pressed={format === 'png'} onClick={() => setFormat('png')}>
                    PNG image
                  </button>
                  <button aria-pressed={format === 'svg'} onClick={() => setFormat('svg')}>
                    SVG vector
                  </button>
                </div>
              </div>

              {format === 'png' && (
                <div className="field">
                  <span className="field-label">PNG size</span>
                  <div className="segmented">
                    {SIZES.map((option) => (
                      <button
                        key={option.value}
                        aria-pressed={size === option.value}
                        onClick={() => setSize(option.value)}
                        title={option.hint}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="notice notice-error" style={{ marginTop: 16 }}>
                {error}
              </div>
            )}

            <div className="row" style={{ marginTop: 20, justifyContent: 'space-between' }}>
              <button className="btn btn-forest" onClick={download} disabled={!qr}>
                <DownloadIcon size={16} /> Download {format.toUpperCase()}
              </button>
              {qr && (
                <span className="small muted">
                  Version {(qr.size - 17) / 4} · {qr.size}×{qr.size} modules
                </span>
              )}
            </div>
          </div>

          <div className="panel" style={{ marginTop: 20 }}>
            <span className="panel-title">Preview</span>
            <div
              className="row"
              style={{ justifyContent: 'center', padding: '18px 0', minHeight: 120 }}
            >
              {qr ? (
                <canvas ref={canvasRef} style={{ imageRendering: 'pixelated', maxWidth: '100%' }} />
              ) : (
                <span className="small muted">
                  {text ? '—' : 'Type above and the code appears here'}
                </span>
              )}
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <AdSlot />
          </div>
        </div>

        <aside className="stack-md">
          <div className="panel">
            <span className="panel-title">Static, and yours</span>
            <p className="small muted">
              The text lives inside the pattern — there is no redirect service in the middle and no
              account behind it. The code you print today still scans in twenty years, and QuietKit
              can never take it down.
            </p>
            <div className="row" style={{ marginTop: 14 }}>
              <LockIcon size={16} /> <span className="small">0 bytes uploaded</span>
            </div>
          </div>

          <div className="panel">
            <span className="panel-title">Related</span>
            <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
              <li>
                <Link to="/guides/qr-code-without-upload" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Guide: QR codes that don't track people
                </Link>
              </li>
              <li>
                <Link to="/tools/image-resizer" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Resize the PNG for a badge or card
                </Link>
              </li>
              <li>
                <Link to="/tools/jpg-to-pdf" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Turn codes and labels into one PDF
                </Link>
              </li>
              <li>
                <Link to="/tools/image-converter" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Convert the PNG to WebP for the web
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-sign" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Sign the document the code points to
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="section">
        <div className="container-narrow prose">
          <h2>Most QR generators are mailing lists in disguise</h2>
          <p>
            The popular free generators follow a pattern: the code they hand you does not contain
            your link — it contains <em>their</em> link, which redirects to yours. Every scan tells
            the vendor who scanned, when, and from where. When the free trial ends, the code on your
            thousand printed flyers quietly stops working unless you pay. A static code sidesteps the
            whole business model: the destination is baked into the squares, and no company sits
            between the scanner and your page.
          </p>

          <h2>What the error correction percentage means</h2>
          <p>
            QR codes carry Reed–Solomon redundancy — the same mathematics that lets a scratched CD
            keep playing. Level H rebuilds the data even when 30% of the codewords are destroyed,
            which is why café codes with a logo pasted in the middle still scan. More redundancy
            means more modules for the same payload, so a high-correction code must be printed a
            little larger to stay readable.
          </p>

          <h2>Print rules that actually matter</h2>
          <ul>
            <li>Keep the quiet zone — the plain margin around the code. Four modules is the standard; this tool includes it automatically.</li>
            <li>Print at least 2 × 2 cm for arm’s-length scanning; add a centimetre for every metre of scanning distance.</li>
            <li>Test the printed code with a real phone before ordering five hundred copies — screens are forgiving, paper is not.</li>
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
