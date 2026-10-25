import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, LockIcon } from '../components/Icons'
import {
  analogous,
  complement,
  contrastRatio,
  formatHsl,
  formatRgb,
  hexToRgb,
  hslToRgb,
  rgbToHex,
  rgbToHsl,
  triadic,
  type Rgb,
} from '../lib/color'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'What is the difference between HEX, RGB and HSL?',
    a: 'HEX and RGB describe the same thing — red, green and blue channels from 0 to 255 — just written differently. HSL (hue, saturation, lightness) is a more human way to think about colour: hue is the position on the colour wheel, saturation is intensity, and lightness is how close to white or black it sits. Designers often pick in HSL and export in HEX for CSS.',
  },
  {
    q: 'Why does the same colour look different on my phone and laptop?',
    a: 'Different screens have different colour gamuts (sRGB, Display P3, etc.) and calibration. A colour converter gives you the same numbers everywhere, but the display hardware decides how those numbers actually look. For critical work, test on the target device.',
  },
  {
    q: 'What is a contrast ratio and why does 4.5:1 matter?',
    a: 'Contrast ratio measures the luminance difference between text and its background. WCAG AA requires 4.5:1 for normal text and 3:1 for large text; AAA requires 7:1. A ratio below 4.5:1 fails accessibility guidelines and can be unreadable for users with low vision.',
  },
  {
    q: 'What are complementary, analogous and triadic colours?',
    a: 'Complementary sits directly opposite on the colour wheel (180°) — high contrast, energetic. Analogous sits ±30° — harmonious, calm. Triadic splits the wheel into three (120° apart) — balanced but vibrant. These are starting points for building a palette, not strict rules.',
  },
  {
    q: 'Is my colour data uploaded when I use this tool?',
    a: 'No. All conversion maths runs in JavaScript inside this tab. The colour you type never leaves your device, which matters when you are working with unreleased brand colours.',
  },
]

function toHexInput(rgb: Rgb): string {
  return rgbToHex(rgb)
}

export function ColorConverter() {
  useSeo({
    ...routeMeta('/tools/color-converter'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit Color Converter',
          'Convert between HEX, RGB and HSL instantly. See contrast ratios, complementary and analogous colours, and copy CSS-ready values — all locally in your browser.',
          '/tools/color-converter',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [hexInput, setHexInput] = useState('#4f7cff')
  const [copied, setCopied] = useState<string | null>(null)

  const rgb = useMemo(() => hexToRgb(hexInput), [hexInput])
  const hsl = useMemo(() => (rgb ? rgbToHsl(rgb) : null), [rgb])
  const comp = useMemo(() => (rgb ? complement(rgb) : null), [rgb])
  const ana = useMemo(() => (rgb ? analogous(rgb) : null), [rgb])
  const tri = useMemo(() => (rgb ? triadic(rgb) : null), [rgb])

  const whiteContrast = useMemo(() => (rgb ? contrastRatio(rgb, { r: 255, g: 255, b: 255 }) : 0), [rgb])
  const blackContrast = useMemo(() => (rgb ? contrastRatio(rgb, { r: 0, g: 0, b: 0 }) : 0), [rgb])

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(null), 1500)
  }

  const setFromHex = (value: string) => {
    setHexInput(value)
  }

  const setFromHsl = (h: number, s: number, l: number) => {
    setHexInput(rgbToHex(hslToRgb({ h, s, l })))
  }

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Design</span>
          <h1>Color converter that stays in the tab</h1>
          <p>
            Convert between HEX, RGB and HSL, check contrast ratios, and grab complementary
            palettes — without sending your brand colours to a server.
          </p>
        </div>
      </section>

      <div className="container workspace">
        <div>
          <div className="panel">
            <span className="panel-title">Pick or type a colour</span>

            <div className="row" style={{ gap: 14, marginTop: 14, alignItems: 'center' }}>
              <input
                type="color"
                value={rgb ? toHexInput(rgb) : '#000000'}
                onChange={(e) => setHexInput(e.target.value)}
                style={{ width: 64, height: 48, padding: 2, border: '1px solid var(--line)', cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  value={hexInput}
                  onChange={(e) => setFromHex(e.target.value)}
                  placeholder="#4f7cff"
                  style={{ fontSize: 18, fontFamily: 'monospace' }}
                />
              </div>
            </div>

            {!rgb && (
              <div className="notice notice-error" style={{ marginTop: 12 }}>
                Enter a valid HEX colour: #abc, #aabbcc or #aabbccdd.
              </div>
            )}
          </div>

          {rgb && hsl && (
            <>
              <div className="panel" style={{ marginTop: 20 }}>
                <span className="panel-title">Values</span>
                <div className="stack-sm" style={{ marginTop: 12 }}>
                  {[
                    { label: 'HEX', value: toHexInput(rgb) },
                    { label: 'RGB', value: formatRgb(rgb) },
                    { label: 'HSL', value: formatHsl(hsl) },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="row"
                      style={{
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        border: '1px solid var(--line)',
                        borderRadius: 8,
                        background: 'var(--paper-2)',
                      }}
                    >
                      <div className="row" style={{ gap: 10 }}>
                        <span className="small muted" style={{ width: 36 }}>{row.label}</span>
                        <code style={{ fontSize: 15 }}>{row.value}</code>
                      </div>
                      <button
                        className="btn"
                        style={{ padding: '6px 12px', fontSize: 13 }}
                        onClick={() => copy(row.value)}
                      >
                        {copied === row.value ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel" style={{ marginTop: 20 }}>
                <span className="panel-title">Contrast</span>
                <div className="stack-sm" style={{ marginTop: 12 }}>
                  {[
                    { label: 'On white', ratio: whiteContrast, bg: '#fff', fg: toHexInput(rgb) },
                    { label: 'On black', ratio: blackContrast, bg: '#000', fg: toHexInput(rgb) },
                  ].map((row) => (
                    <div key={row.label} className="row" style={{ justifyContent: 'space-between' }}>
                      <div className="row" style={{ gap: 10 }}>
                        <div
                          style={{
                            width: 44,
                            height: 32,
                            borderRadius: 6,
                            background: row.bg,
                            border: '1px solid var(--line)',
                            display: 'grid',
                            placeItems: 'center',
                          }}
                        >
                          <span style={{ color: row.fg, fontSize: 13, fontWeight: 600 }}>Aa</span>
                        </div>
                        <span className="small">{row.label}</span>
                      </div>
                      <span className={`strength ${row.ratio >= 7 ? 'strength-strong' : row.ratio >= 4.5 ? 'strength-good' : row.ratio >= 3 ? 'strength-fair' : 'strength-weak'}`}>
                        {row.ratio.toFixed(2)}:1
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel" style={{ marginTop: 20 }}>
                <span className="panel-title">Palette</span>
                <div className="stack-sm" style={{ marginTop: 12 }}>
                  {[
                    { label: 'Original', colors: [rgb] },
                    { label: 'Complementary', colors: comp ? [comp] : [] },
                    { label: 'Analogous', colors: ana || [] },
                    { label: 'Triadic', colors: tri || [] },
                  ].map((group) => (
                    <div key={group.label}>
                      <span className="small muted">{group.label}</span>
                      <div className="row" style={{ gap: 8, marginTop: 6 }}>
                        {group.colors.map((c, i) => (
                          <button
                            key={i}
                            onClick={() => setFromHex(rgbToHex(c))}
                            title={rgbToHex(c)}
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 8,
                              border: '1px solid var(--line)',
                              background: rgbToHex(c),
                              cursor: 'pointer',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div style={{ marginTop: 20 }}>
            <AdSlot />
          </div>
        </div>

        <aside className="stack-md">
          <div className="panel">
            <span className="panel-title">Quick adjust</span>
            <div className="stack-sm" style={{ marginTop: 12 }}>
              {rgb && hsl && (
                <>
                  <div className="field">
                    <span className="field-label">Hue — {hsl.h}°</span>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      value={hsl.h}
                      onChange={(e) => setFromHsl(Number(e.target.value), hsl.s, hsl.l)}
                    />
                  </div>
                  <div className="field">
                    <span className="field-label">Saturation — {hsl.s}%</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={hsl.s}
                      onChange={(e) => setFromHsl(hsl.h, Number(e.target.value), hsl.l)}
                    />
                  </div>
                  <div className="field">
                    <span className="field-label">Lightness — {hsl.l}%</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={hsl.l}
                      onChange={(e) => setFromHsl(hsl.h, hsl.s, Number(e.target.value))}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="panel">
            <span className="panel-title">Related</span>
            <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
              <li>
                <Link to="/guides/color-converter-without-upload" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Guide: convert colours without the upload
                </Link>
              </li>
              <li>
                <Link to="/tools/favicon" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Turn the colour into a favicon
                </Link>
              </li>
              <li>
                <Link to="/tools/image-resizer" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Resize a colour palette image
                </Link>
              </li>
              <li>
                <Link to="/tools/image-compressor" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Compress the exported palette
                </Link>
              </li>
            </ul>
          </div>

          <div className="panel">
            <span className="panel-title">Local by design</span>
            <p className="small muted">
              All conversion runs in JavaScript inside this tab. The colour you type never leaves
              your device — useful when the brand guide is not public yet.
            </p>
            <div className="row" style={{ marginTop: 14 }}>
              <LockIcon size={16} /> <span className="small">0 bytes uploaded</span>
            </div>
          </div>
        </aside>
      </div>

      <section className="section">
        <div className="container-narrow prose">
          <h2>Why three formats exist</h2>
          <p>
            HEX and RGB are two ways to write the same thing: how much red, green and blue light to
            emit. HEX is compact and fits in a tweet; RGB is explicit and easier to manipulate in
            code. HSL is a design tool — instead of mixing light channels, you pick a hue, decide
            how saturated it should be, and set how light or dark it feels. Most designers pick in
            HSL, then convert to HEX for CSS.
          </p>

          <h2>When to use each</h2>
          <ul>
            <li><strong>HEX</strong> — CSS, design handoff, brand guidelines. Compact and universally understood.</li>
            <li><strong>RGB</strong> — Canvas, WebGL, image processing. Each channel is a number you can math with.</li>
            <li><strong>HSL</strong> — Picking colours, building palettes, adjusting lightness systematically.</li>
          </ul>

          <h2>Contrast is not optional</h2>
          <p>
            A colour that looks good on your screen may be unreadable to someone with low vision or
            a cheap display. WCAG AA requires 4.5:1 contrast for body text and 3:1 for large text.
            This tool shows the ratio against pure white and pure black so you can check before
            shipping. For text on coloured backgrounds, test the exact pair — the ratio changes
            with every combination.
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
