import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, CopyIcon, LockIcon } from '../components/Icons'
import {
  DEFAULT_ROOT_FONT_SIZE,
  convertBatch,
  pxToRem,
  remTable,
  remToPx,
} from '../lib/rem'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'What is the difference between px and rem?',
    a: 'A pixel (px) is a fixed unit — 1px is always one device pixel (after any scaling). A rem is relative to the root font size of the page, which defaults to 16px in every browser. So 1rem = 16px by default, 2rem = 32px, and so on. The point of rem is that if a user changes their browser font-size setting, everything measured in rem scales with it; px values stay fixed and can become unreadable.',
  },
  {
    q: 'Why does the root font size matter?',
    a: 'Because a rem is defined as the font size of the root element — the <html> tag. If you set html { font-size: 10px } in your stylesheet, then 1rem becomes 10px instead of 16px, and every rem value in your codebase changes proportionally. The converter defaults to 16px (the browser default) but lets you change it so the math matches your actual stylesheet.',
  },
  {
    q: 'Can I convert a whole CSS snippet at once?',
    a: 'Yes. Paste any block of CSS into the batch box and every px value becomes rem and every rem value becomes px, in place. Property names, selectors, comments and numbers without a unit are left exactly as they were. This is the fastest way to convert a component from one unit system to the other without doing each value by hand.',
  },
  {
    q: 'When should I use rem instead of px?',
    a: 'Use rem for font sizes, spacing, padding and margins — anything that should scale when the user changes their browser font size. Use px for things that should stay a fixed size regardless of font settings, like borders, shadows and sometimes icon dimensions. The common modern recommendation is rem for typography and layout, px for thin decorative lines.',
  },
  {
    q: 'Does the converter store the CSS I paste?',
    a: 'No. The snippet you paste lives only in the memory of this browser tab while the page is open. There is no server, no account and no analytics event tied to your input. Close the tab and the CSS is gone — the privacy policy explains in detail.',
  },
]

export function PxToRem() {
  useSeo({
    ...routeMeta('/tools/px-to-rem'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit px to rem Converter',
          'Convert pixels to rems and back with a configurable root font size. Convert a single value or paste a whole CSS snippet — every px and rem token is converted in place, everything else left untouched. Runs locally — nothing is uploaded.',
          '/tools/px-to-rem',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [root, setRoot] = useState(String(DEFAULT_ROOT_FONT_SIZE))
  const [pxVal, setPxVal] = useState('16')
  const [remVal, setRemVal] = useState('1')
  const [lastEdited, setLastEdited] = useState<'px' | 'rem'>('px')
  const [snippet, setSnippet] = useState('')
  const [copied, setCopied] = useState(false)

  const rootNum = Number(root) || DEFAULT_ROOT_FONT_SIZE

  // Keep the two single-value inputs in sync.
  const pxNum = Number(pxVal)
  const remNum = Number(remVal)

  const displayRem = lastEdited === 'px'
    ? Number.isFinite(pxNum) && pxVal !== ''
      ? pxToRem(pxNum, rootNum)
      : NaN
    : remNum
  const displayPx = lastEdited === 'rem'
    ? Number.isFinite(remNum) && remVal !== ''
      ? remToPx(remNum, rootNum)
      : NaN
    : pxNum

  const batchResult = useMemo(
    () => (snippet ? convertBatch(snippet, rootNum) : null),
    [snippet, rootNum],
  )

  const table = useMemo(() => remTable(rootNum, 40), [rootNum])

  const copyConverted = async () => {
    if (!batchResult) return
    try {
      await navigator.clipboard.writeText(batchResult.converted)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard may be unavailable; ignore
    }
  }

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Developer</span>
          <h1>px ↔ rem, with your root font size.</h1>
          <p>
            Convert a single value or paste a whole CSS snippet. Every px becomes rem and every
            rem becomes px, in place — the rest of your stylesheet is left untouched.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container workspace">
          <div>
            <div className="panel">
              <div className="field">
                <span className="field-label">Root font size (px)</span>
                <input
                  type="number"
                  min={1}
                  value={root}
                  onChange={(e) => setRoot(e.target.value)}
                  style={{ width: 120 }}
                />
                <span className="muted" style={{ marginLeft: 8, fontSize: 13 }}>
                  1rem = {rootNum}px
                </span>
              </div>

              <div className="split" style={{ gap: 12, marginTop: 18 }}>
                <div className="field" style={{ flex: 1 }}>
                  <span className="field-label">Pixels (px)</span>
                  <input
                    type="number"
                    value={lastEdited === 'px' ? pxVal : displayPx}
                    onChange={(e) => {
                      setPxVal(e.target.value)
                      setLastEdited('px')
                    }}
                    style={{ width: '100%' }}
                  />
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    color: 'var(--muted)',
                  }}
                >
                  ⇄
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <span className="field-label">Rems</span>
                  <input
                    type="number"
                    value={lastEdited === 'rem' ? remVal : displayRem}
                    onChange={(e) => {
                      setRemVal(e.target.value)
                      setLastEdited('rem')
                    }}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>

            <div className="panel" style={{ marginTop: 20 }}>
              <span className="panel-title">Convert a CSS snippet</span>
              <textarea
                value={snippet}
                onChange={(e) => setSnippet(e.target.value)}
                rows={6}
                placeholder=".box { padding: 16px; font-size: 1.5rem; margin: -8px; }"
                style={{
                  width: '100%',
                  marginTop: 10,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  fontSize: 14,
                }}
              />
              {batchResult && (
                <div style={{ marginTop: 14 }}>
                  <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                    <span className="muted" style={{ fontSize: 13 }}>
                      {batchResult.count} value{batchResult.count === 1 ? '' : 's'} converted
                    </span>
                    <button
                      className="ghost"
                      onClick={copyConverted}
                      style={{ fontSize: 13 }}
                    >
                      <CopyIcon size={13} /> {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre
                    data-testid="batch-output"
                    style={{
                      margin: 0,
                      padding: 14,
                      background: 'var(--paper-2)',
                      border: '1px solid var(--line)',
                      borderRadius: 8,
                      fontSize: 13,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    }}
                  >
                    {batchResult.converted}
                  </pre>
                </div>
              )}
            </div>

            <div className="panel" style={{ marginTop: 20 }}>
              <span className="panel-title">Quick reference (1px – 40px)</span>
              <div
                style={{
                  marginTop: 10,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                  gap: 6,
                }}
              >
                {table.map((row) => (
                  <div
                    key={row.px}
                    style={{
                      padding: '6px 8px',
                      background: 'var(--paper-2)',
                      border: '1px solid var(--line)',
                      borderRadius: 6,
                      fontSize: 12,
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    }}
                  >
                    <div>{row.px}px</div>
                    <div className="muted">{row.rem}rem</div>
                  </div>
                ))}
              </div>
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
                  'Configurable root font size (default 16px)',
                  'Single-value px ⇄ rem converter',
                  'Paste a whole CSS snippet, convert in place',
                  '1px–40px quick reference table',
                  'Works offline — nothing leaves your device',
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
                <LockIcon size={14} /> The CSS you paste never leaves this tab. There is no
                server to log it, no request to inspect — the Network panel stays empty.{' '}
                <Link to="/privacy">Read the privacy policy</Link>.
              </p>
            </div>

            <div className="panel">
              <span className="panel-title">Related</span>
              <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
                <li>
                  <Link to="/guides/px-to-rem-without-upload">
                    Guide: px to rem without a server
                  </Link>
                </li>
                <li>
                  <Link to="/tools/unit-converter">Unit converter</Link>
                </li>
                <li>
                  <Link to="/tools/color-converter">Color converter</Link>
                </li>
                <li>
                  <Link to="/tools/aspect-ratio">Aspect ratio calculator</Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container-narrow prose">
          <h2>rem is a ratio, not a number</h2>
          <p>
            A rem is the font size of the root element, nothing more. With the browser default
            of 16px, 1rem = 16px, 2rem = 32px and 0.5rem = 8px. Change the root font size to
            10px and the same rem values become 10, 20 and 5px. The conversion is always
            <code> rem = px / root </code>
            in one direction and
            <code> px = rem × root </code>
            in the other. There is no rounding trick, no browser-specific behavior — just a
            ratio with the root font size as the denominator.
          </p>

          <h2>Why rem exists at all</h2>
          <p>
            Pixels are absolute. A 16px font is always 16 device pixels tall, regardless of
            what the user has set their browser font size to. For users who bump their default
            font size up because they need larger text, a px-based layout does not scale — the
            text stays tiny. rem solves this by tying every measurement to the root font size,
            so the whole layout scales proportionally when the user changes their setting.
            Accessibility is the original reason rem exists, and it is still the best one.
          </p>

          <h2>The root font size is a contract</h2>
          <p>
            Once you pick a root font size, every rem value in your codebase depends on it.
            Change it from 16px to 10px and a 1.5rem padding that was 24px becomes 15px. This
            is powerful — it lets you rescale an entire interface by editing one number — but
            it means the root size is a contract between the stylesheet and every component.
            The converter defaults to 16px because that is the browser default and the most
            common choice, but it lets you change it so the math matches your actual
            stylesheet rather than an assumed default.
          </p>

          <h2>Batch conversion and what it leaves alone</h2>
          <p>
            Pasting a CSS snippet into the batch box converts every px token to rem and every
            rem token to px, in place. Property names, selectors, hex colors, percentages,
            comments and numbers without a unit are left exactly as they were — only values
            with a px or rem unit are touched. This makes it safe to convert a whole component
            or stylesheet in one pass rather than editing each value by hand, and it means the
            output is valid CSS you can paste straight back into your editor.
          </p>

          <h2>Why a style value should stay local</h2>
          <p>
            A CSS snippet is not usually secret, but it is still work in progress — a
            component you have not shipped, a spacing scale you are still deciding on, a
            design system that is not public yet. Sending it to a server-side converter means
            it gets logged, stored and possibly analyzed somewhere you cannot see. The local
            alternative needs none of that: a px-to-rem conversion is a single division, and
            the whole stylesheet converts in a few milliseconds inside the tab without a single
            network request.
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
