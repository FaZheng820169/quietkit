import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, LockIcon } from '../components/Icons'
import {
  diagonal,
  fillBox,
  fitBox,
  heightForWidth,
  isLandscape,
  isSquare,
  PRESET_RATIOS,
  scaleBy,
  simplifyRatio,
  widthForHeight,
  type Size,
} from '../lib/aspect'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'What is an aspect ratio?',
    a: 'It is the relationship between an image or screen\'s width and its height, written as width:height. A 16:9 ratio means the width is 16 units for every 9 units of height — the shape of a modern TV. The actual pixels do not matter to the ratio; 1920x1080, 1280x720 and 3840x2160 are all 16:9 because they divide down to the same pair.',
  },
  {
    q: 'Why is 16:9 the default for everything?',
    a: 'Because it was the compromise that won. Early televisions were 4:3; early cinema was wider. When HDTV was standardised in the 1980s, engineers picked 16:9 as the geometric mean of 4:3 and the common cinema ratios — wide enough to show films without huge black bars, narrow enough that 4:3 content did not look tiny. Every screen since then inherited it, and the web followed the screens.',
  },
  {
    q: 'What is the difference between fit and fill?',
    a: 'Fit (also called contain) makes the whole content visible inside the box, leaving empty space if the ratios differ. Fill (also called cover) makes the content cover the whole box, cropping whatever spills outside. A 16:9 photo into a 1:1 social post: fit shows the whole photo with bars top and bottom; fill fills the square and crops the sides. Which one you want depends on whether cropping or empty space is the smaller evil.',
  },
  {
    q: 'Does the calculator handle portrait ratios?',
    a: 'Yes. A ratio is just width:height, so 9:16 is portrait and 16:9 is landscape — the same numbers, swapped. This calculator does not care which way round they are; it solves for the missing dimension either way and reports whether the result is landscape, portrait or square.',
  },
  {
    q: 'How do I resize without stretching?',
    a: 'Never change width and height independently — that distorts the image. Always lock the ratio and change one dimension, letting the calculator give you the other. Scaling by a factor (half, double) does the same thing: both dimensions move together, so the shape stays the same and nothing stretches.',
  },
]

function fmt(n: number): string {
  if (!Number.isFinite(n)) return '—'
  const rounded = Math.round(n * 100) / 100
  return rounded.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

type Mode = 'pixels' | 'ratio'

export function AspectRatio() {
  useSeo({
    ...routeMeta('/tools/aspect-ratio'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit Aspect Ratio Calculator',
          'Enter any width and height to get the reduced ratio, or pick a ratio and a dimension to solve the other. Fit (contain) and fill (cover) a box, scale uniformly, see the diagonal. Runs locally — nothing is uploaded.',
          '/tools/aspect-ratio',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [mode, setMode] = useState<Mode>('pixels')
  const [width, setWidth] = useState('1920')
  const [height, setHeight] = useState('1080')
  const [rw, setRw] = useState('16')
  const [rh, setRh] = useState('9')
  const [solve, setSolve] = useState<'width' | 'height'>('height')
  const [solveValue, setSolveValue] = useState('1920')
  const [boxW, setBoxW] = useState('1000')
  const [boxH, setBoxH] = useState('1000')
  const [scale, setScale] = useState('0.5')

  const num = (s: string) => (s.trim() === '' ? NaN : Number(s))

  const pixels = useMemo<Size | null>(() => {
    const w = num(width)
    const h = num(height)
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null
    return { width: w, height: h }
  }, [width, height])

  const ratioResult = useMemo(() => {
    const a = num(rw)
    const b = num(rh)
    const v = num(solveValue)
    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(v) || a <= 0 || b <= 0 || v <= 0) {
      return null
    }
    try {
      return solve === 'height'
        ? { width: v, height: heightForWidth(a, b, v) }
        : { width: widthForHeight(a, b, v), height: v }
    } catch {
      return null
    }
  }, [rw, rh, solve, solveValue])

  const active = mode === 'pixels' ? pixels : ratioResult

  const reduced = useMemo(() => {
    if (!active) return null
    // In ratio mode the user supplied the ratio directly, so show it rather
    // than reducing the (possibly fractional) solved pixels.
    if (mode === 'ratio') {
      const a = num(rw)
      const b = num(rh)
      if (Number.isFinite(a) && Number.isFinite(b)) return { width: Math.round(a), height: Math.round(b) }
    }
    return simplifyRatio(active.width, active.height)
  }, [active, mode, rw, rh])
  const diag = useMemo(() => (active ? diagonal(active.width, active.height) : NaN), [active])

  const box = useMemo(() => {
    if (!active) return null
    const bw = num(boxW)
    const bh = num(boxH)
    if (!Number.isFinite(bw) || !Number.isFinite(bh) || bw <= 0 || bh <= 0) return null
    return {
      fit: fitBox(active.width, active.height, bw, bh),
      fill: fillBox(active.width, active.height, bw, bh),
    }
  }, [active, boxW, boxH])

  const scaled = useMemo(() => {
    if (!active) return null
    const f = num(scale)
    if (!Number.isFinite(f) || f <= 0) return null
    try {
      return scaleBy(active.width, active.height, f)
    } catch {
      return null
    }
  }, [active, scale])

  const orientation = useMemo(() => {
    if (!active) return ''
    if (isSquare(active.width, active.height)) return 'Square'
    return isLandscape(active.width, active.height) ? 'Landscape' : 'Portrait'
  }, [active])

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Design</span>
          <h1>Aspect ratios solved without a single upload</h1>
          <p>
            Drop in any width and height, or pick a ratio and solve the missing dimension. Fit,
            fill, scale and check the diagonal — all ratio arithmetic, done in this tab.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container workspace">
          <div>
            <div className="panel">
              <div className="field">
                <span className="field-label">Input mode</span>
                <div className="segmented">
                  <button aria-pressed={mode === 'pixels'} onClick={() => setMode('pixels')}>
                    Pixels → ratio
                  </button>
                  <button aria-pressed={mode === 'ratio'} onClick={() => setMode('ratio')}>
                    Ratio → pixels
                  </button>
                </div>
              </div>

              {mode === 'pixels' ? (
                <div className="split" style={{ gap: 12, marginTop: 16 }}>
                  <div className="field" style={{ flex: 1 }}>
                    <span className="field-label">Width (px)</span>
                    <input type="number" value={width} onChange={(e) => setWidth(e.target.value)} style={{ width: '100%' }} />
                  </div>
                  <div className="field" style={{ flex: 1 }}>
                    <span className="field-label">Height (px)</span>
                    <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} style={{ width: '100%' }} />
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: 16 }}>
                  <div className="split" style={{ gap: 12 }}>
                    <div className="field" style={{ flex: 1 }}>
                      <span className="field-label">Ratio width</span>
                      <input type="number" value={rw} onChange={(e) => setRw(e.target.value)} style={{ width: '100%' }} />
                    </div>
                    <div className="field" style={{ flex: 1 }}>
                      <span className="field-label">Ratio height</span>
                      <input type="number" value={rh} onChange={(e) => setRh(e.target.value)} style={{ width: '100%' }} />
                    </div>
                  </div>
                  <div className="row" style={{ gap: 8, marginTop: 8 }}>
                    {PRESET_RATIOS.map((p) => (
                      <button
                        key={p.label}
                        className="btn"
                        style={{ padding: '4px 10px', fontSize: 12 }}
                        onClick={() => {
                          setRw(String(p.width))
                          setRh(String(p.height))
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <div className="split" style={{ gap: 12, marginTop: 16 }}>
                    <div className="field" style={{ flex: 1 }}>
                      <span className="field-label">Solve for</span>
                      <div className="segmented">
                        <button aria-pressed={solve === 'height'} onClick={() => setSolve('height')}>Height</button>
                        <button aria-pressed={solve === 'width'} onClick={() => setSolve('width')}>Width</button>
                      </div>
                    </div>
                    <div className="field" style={{ flex: 1 }}>
                      <span className="field-label">{solve === 'height' ? 'Width (px)' : 'Height (px)'}</span>
                      <input type="number" value={solveValue} onChange={(e) => setSolveValue(e.target.value)} style={{ width: '100%' }} />
                    </div>
                  </div>
                </div>
              )}

              {!active ? (
                <div className="notice notice-error" style={{ marginTop: 16 }}>
                  Enter positive numbers for both dimensions.
                </div>
              ) : (
                <>
                  <div className="stat-grid" style={{ marginTop: 18 }}>
                    <div className="stat">
                      <div className="stat-label">Reduced ratio</div>
                      <div className="stat-value" data-testid="ratio-value">{reduced?.width}:{reduced?.height}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-label">Decimal</div>
                      <div className="stat-value" data-testid="decimal-value">{fmt(active.width / active.height)}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-label">Orientation</div>
                      <div className="stat-value" data-testid="orientation-value">{orientation}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-label">Diagonal</div>
                      <div className="stat-value" data-testid="diagonal-value">{fmt(diag)} px</div>
                    </div>
                  </div>

                  <div className="panel" style={{ marginTop: 18 }}>
                    <span className="panel-title">Fit &amp; fill in a box</span>
                    <div className="split" style={{ gap: 12, marginTop: 10 }}>
                      <div className="field" style={{ flex: 1 }}>
                        <span className="field-label">Box width</span>
                        <input type="number" value={boxW} onChange={(e) => setBoxW(e.target.value)} style={{ width: '100%' }} />
                      </div>
                      <div className="field" style={{ flex: 1 }}>
                        <span className="field-label">Box height</span>
                        <input type="number" value={boxH} onChange={(e) => setBoxH(e.target.value)} style={{ width: '100%' }} />
                      </div>
                    </div>
                    {box && (
                      <div className="split" style={{ gap: 16, marginTop: 12 }}>
                        <div>
                          <div className="small muted">Fit (contain)</div>
                          <div className="mono" data-testid="fit-value" style={{ fontSize: 14 }}>
                            {fmt(box.fit.width)} × {fmt(box.fit.height)}
                          </div>
                        </div>
                        <div>
                          <div className="small muted">Fill (cover)</div>
                          <div className="mono" data-testid="fill-value" style={{ fontSize: 14 }}>
                            {fmt(box.fill.width)} × {fmt(box.fill.height)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="panel" style={{ marginTop: 18 }}>
                    <span className="panel-title">Uniform scale</span>
                    <div className="split" style={{ gap: 12, marginTop: 10 }}>
                      <div className="field" style={{ flex: 1 }}>
                        <span className="field-label">Scale factor</span>
                        <input type="number" step="0.1" value={scale} onChange={(e) => setScale(e.target.value)} style={{ width: '100%' }} />
                      </div>
                      {scaled && (
                        <div style={{ flex: 1 }}>
                          <div className="small muted">Result</div>
                          <div className="mono" data-testid="scaled-value" style={{ fontSize: 14 }}>
                            {fmt(scaled.width)} × {fmt(scaled.height)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div style={{ marginTop: 20 }}>
              <AdSlot />
            </div>
          </div>

          <aside className="stack-md">
            <div className="panel">
              <span className="panel-title">What you get</span>
              <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
                {[
                  'Pixels → reduced ratio in one step',
                  'Ratio + one dimension → the other',
                  'Fit (contain) and fill (cover) any box',
                  'Uniform scaling without distortion',
                  'Decimal ratio and diagonal in pixels',
                ].map((item) => (
                  <li key={item} className="row" style={{ gap: 8 }}>
                    <CheckIcon size={15} /> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel">
              <span className="panel-title">Private by design</span>
              <p style={{ fontSize: 14, margin: 0 }}>
                <LockIcon size={14} /> An aspect ratio is two numbers divided. There is no image to
                upload, no lookup to make, nothing to send — just multiplication and division in
                this tab.{' '}
                <Link to="/privacy">Read the privacy policy</Link>.
              </p>
            </div>

            <div className="panel">
              <span className="panel-title">Related</span>
              <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
                <li>
                  <Link to="/guides/aspect-ratio-without-upload">
                    Guide: aspect ratios without a server
                  </Link>
                </li>
                <li>
                  <Link to="/tools/image-resizer">Image resizer</Link>
                </li>
                <li>
                  <Link to="/tools/image-compressor">Image compressor</Link>
                </li>
                <li>
                  <Link to="/tools/lorem-ipsum">Lorem ipsum generator</Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container-narrow prose">
          <h2>A ratio is just a fraction</h2>
          <p>
            An aspect ratio is width divided by height. That is the whole idea. 1920 ÷ 1080 = 1.777…,
            and 16 ÷ 9 = 1.777…, so 1920x1080 and 16:9 are the same shape. Reducing a pixel size to
            its ratio is just dividing both numbers by their greatest common divisor — 1920 and 1080
            share a factor of 120, so divide both by 120 and you get 16:9. The actual pixel count is
            irrelevant to the shape, which is why a phone photo at 1080x1920 and a cinema frame at
            4096x2160 can both be 16:9.
          </p>

          <h2>Why 16:9 conquered the screen</h2>
          <p>
            16:9 was not the most beautiful ratio; it was the most diplomatic. When HDTV was being
            standardised, broadcasts were 4:3 and films were wider. The committee picked 16:9 as the
            geometric mean of 4:3 and the common cinema ratios — wide enough that films lost little
            to letterboxing, narrow enough that old 4:3 content did not look absurdly small. Every
            screen, monitor and phone since then has inherited the decision, and the web inherited
            the screens. You still see 4:3 in square-ish social posts and 9:16 in vertical video,
            but the default rectangle of the internet is 16:9.
          </p>

          <h2>Fit versus fill</h2>
          <p>
            The two ways to put a rectangle inside another rectangle. Fit (or contain) scales the
            content until the whole thing fits, leaving empty space wherever the ratios do not match.
            Fill (or cover) scales until the box is completely covered, cropping whatever spills
            outside. A 16:9 photo into a 1:1 Instagram post: fit shows the whole photo with white
            bars top and bottom; fill fills the square and crops the left and right edges. Neither
            is correct in the abstract — you choose based on whether cropping or empty space is the
            smaller evil for that image in that place.
          </p>

          <h2>Never resize two dimensions independently</h2>
          <p>
            The one mistake that always shows. Change a 16:9 image's width without touching the
            height and the result stretches — circles become ovals, faces look wrong. To resize
            without distortion, change one dimension and solve the other from the ratio, or scale
            both by the same factor. Both operations keep the fraction width/height constant, so the
            shape stays the same and nothing stretches. This calculator does the solving for you;
            all you have to do is not override the answer it gives.
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
