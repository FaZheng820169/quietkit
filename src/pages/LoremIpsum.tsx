import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, CopyIcon, LockIcon } from '../components/Icons'
import { CLASSIC_OPENING, generate, type LoremMode } from '../lib/lorem'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'What does lorem ipsum actually say?',
    a: 'Nothing coherent — that is the point. The passage is a scrambled excerpt from Cicero\u2019s de Finibus Bonorum et Malorum (45 BC), a treatise on ethics. A 15th-century typesetter jumbled the word order to make filler text for a type specimen, and the scrambled version stuck. It looks like Latin, carries the rhythm of real prose, and means nothing, so nobody mistakes it for content.',
  },
  {
    q: 'Why not just paste real text as a placeholder?',
    a: 'Because real text distracts. Give a client a mockup filled with readable English and the review meeting becomes about the copy instead of the layout. Lorem ipsum has the word lengths and sentence cadence of real prose without the meaning, so the conversation stays on typography, spacing and hierarchy. It also never accidentally ships: nobody lets "Consectetur adipiscing elit" go live unnoticed.',
  },
  {
    q: 'When should I use words, sentences or paragraphs?',
    a: 'Match the unit to the slot you are filling. Words are for labels, button copy and headings — "generate 3 words" fills a nav item. Sentences are for subtitles, card descriptions and tooltips. Paragraphs are for article bodies, product descriptions and comment threads, where you need to judge line length, leading and how the page scrolls. The count limits differ on purpose: up to 5,000 words, 500 sentences or paragraphs per click.',
  },
  {
    q: 'Does the generator send my settings anywhere?',
    a: 'No. Generation is arithmetic on a fixed word pool — the 69 words of the classic passage — seeded locally and produced in this tab. There is no request to inspect in the Network panel because there is nothing to send. You can load the page, disconnect from the network, and generate a thousand paragraphs.',
  },
  {
    q: 'Can I get the output wrapped in HTML tags?',
    a: 'Yes — in paragraphs mode, tick the HTML option and each paragraph comes wrapped in its own <p> tags, ready to drop into a template. The plain-text output separates paragraphs with a blank line, which is what most design tools and CMS preview fields expect when you paste.',
  },
]

const MODES: { kind: LoremMode; label: string }[] = [
  { kind: 'words', label: 'Words' },
  { kind: 'sentences', label: 'Sentences' },
  { kind: 'paragraphs', label: 'Paragraphs' },
]

function maxCount(mode: LoremMode): number {
  return mode === 'words' ? 5000 : 500
}

// Prepend the traditional opening without changing the requested count.
function withClassicOpening(mode: LoremMode, text: string): string {
  if (mode === 'words') {
    const classic = CLASSIC_OPENING.replace(/,/g, '').split(' ')
    const words = text.split(' ')
    const head = classic.slice(0, words.length)
    return head.concat(words.slice(head.length)).join(' ')
  }
  return text.replace(/^[^.]+\./, `${CLASSIC_OPENING}.`)
}

export function LoremIpsum() {
  useSeo({
    ...routeMeta('/tools/lorem-ipsum'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit Lorem Ipsum Generator',
          'Generate placeholder text from the classic Cicero word pool: exact word counts, sentences or paragraphs, with an optional traditional opening and HTML wrapping. Runs locally — nothing is uploaded.',
          '/tools/lorem-ipsum',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [mode, setMode] = useState<LoremMode>('paragraphs')
  const [count, setCount] = useState(3)
  const [startClassic, setStartClassic] = useState(true)
  const [asHtml, setAsHtml] = useState(false)
  const [nonce, setNonce] = useState(0)
  const [copied, setCopied] = useState(false)

  const raw = useMemo(() => {
    const text = generate(mode, count, 1 + nonce * 7919)
    return startClassic ? withClassicOpening(mode, text) : text
  }, [mode, count, startClassic, nonce])

  const output = useMemo(() => {
    if (!asHtml || mode !== 'paragraphs') return raw
    return raw
      .split('\n\n')
      .map((p) => `<p>${p}</p>`)
      .join('\n')
  }, [raw, asHtml, mode])

  const stats = useMemo(() => {
    const words = raw.split(/\s+/).filter((w) => w !== '').length
    return { words, chars: raw.length }
  }, [raw])

  const switchMode = (m: LoremMode) => {
    setMode(m)
    setCount((c) => Math.min(c, maxCount(m)))
  }

  const copy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const download = () => {
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'lorem-ipsum.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Design</span>
          <h1>Lorem ipsum that is born in this tab</h1>
          <p>
            The classic Cicero word pool, drawn by exact word, sentence or paragraph — with the
            traditional opening if you want it and HTML wrapping if you need it. No request ever
            leaves the page.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container workspace">
          <div>
            <div className="panel">
              <div className="split" style={{ gap: 18 }}>
                <div className="field">
                  <span className="field-label">Generate</span>
                  <div className="segmented">
                    {MODES.map((m) => (
                      <button
                        key={m.kind}
                        aria-pressed={mode === m.kind}
                        onClick={() => switchMode(m.kind)}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <span className="field-label">How many (1–{maxCount(mode).toLocaleString()})</span>
                  <input
                    type="number"
                    min={1}
                    max={maxCount(mode)}
                    value={count}
                    onChange={(e) =>
                      setCount(Math.max(1, Math.min(maxCount(mode), Number(e.target.value) || 1)))
                    }
                    style={{ width: 90 }}
                    aria-label={`Number of ${mode}`}
                  />
                </div>
              </div>

              <div className="row" style={{ gap: 18, marginTop: 14, flexWrap: 'wrap' }}>
                <label className="row" style={{ gap: 8, fontSize: 14 }}>
                  <input
                    type="checkbox"
                    checked={startClassic}
                    onChange={(e) => setStartClassic(e.target.checked)}
                  />
                  Start with “Lorem ipsum dolor sit amet…”
                </label>
                {mode === 'paragraphs' && (
                  <label className="row" style={{ gap: 8, fontSize: 14 }}>
                    <input
                      type="checkbox"
                      checked={asHtml}
                      onChange={(e) => setAsHtml(e.target.checked)}
                    />
                    Wrap each paragraph in &lt;p&gt; tags
                  </label>
                )}
                <button
                  className="btn btn-primary"
                  style={{ padding: '6px 14px', fontSize: 13.5 }}
                  onClick={() => setNonce((n) => n + 1)}
                >
                  Regenerate
                </button>
                <button
                  className="btn"
                  style={{ padding: '6px 12px', fontSize: 13 }}
                  onClick={() => void copy()}
                >
                  <CopyIcon size={14} /> {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  className="btn"
                  style={{ padding: '6px 12px', fontSize: 13 }}
                  onClick={download}
                >
                  Download .txt
                </button>
              </div>

              <div
                data-testid="lorem-output"
                style={{
                  marginTop: 16,
                  padding: '14px 16px',
                  maxHeight: 420,
                  overflowY: 'auto',
                  fontSize: 14.5,
                  lineHeight: 1.8,
                  whiteSpace: 'pre-wrap',
                  background: 'var(--paper-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                }}
              >
                {output}
              </div>

              <p className="muted" style={{ margin: '10px 2px 0', fontSize: 13 }}>
                {stats.words.toLocaleString()} {stats.words === 1 ? 'word' : 'words'} ·{' '}
                {stats.chars.toLocaleString()} characters · from the 69-word classic pool
              </p>
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
                  'Words, sentences or paragraphs — exact counts',
                  'Up to 5,000 words or 500 paragraphs per click',
                  'Optional traditional “Lorem ipsum…” opening',
                  'Optional <p> wrapping for templates',
                  'Copy or download as .txt',
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
                <LockIcon size={14} /> Placeholder text is not sensitive, but your workflow is none
                of a server’s business either. Generation here is arithmetic on a 69-word pool,
                done locally — the Network panel stays empty.{' '}
                <Link to="/privacy">Read the privacy policy</Link>.
              </p>
            </div>

            <div className="panel">
              <span className="panel-title">Related</span>
              <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
                <li>
                  <Link to="/guides/lorem-ipsum-without-upload">
                    Guide: lorem ipsum without a server
                  </Link>
                </li>
                <li>
                  <Link to="/tools/word-counter">Word counter</Link>
                </li>
                <li>
                  <Link to="/tools/case-converter">Case converter</Link>
                </li>
                <li>
                  <Link to="/tools/markdown-preview">Markdown preview</Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container-narrow prose">
          <h2>Five centuries of the same 69 words</h2>
          <p>
            Every lorem ipsum generator draws from the same pool: the scrambled remains of a
            passage in Cicero’s <em>de Finibus Bonorum et Malorum</em>, written in 45 BC. A
            typesetter in the 1500s chopped the sentence into words and rearranged them to fill a
            type specimen book, and the industry never looked back. The result is text with the
            average word length and syllable rhythm of real Latin prose — close enough to English
            that a layout filled with it reads naturally, but meaningless enough that nobody
            confuses it with copy.
          </p>

          <h2>Placeholder text should not look like real content</h2>
          <p>
            The failure mode of filler text is distraction. Paste a real blog post into a mockup
            and the design review turns into an editing session; use “text goes here” repeated
            fifty times and the line lengths lie to you. Lorem ipsum sits in the useful middle: it
            has honest word shapes — short function words, long Latin stems, the occasional
            double-letter — so rags, widows and line breaks show up exactly as they will with real
            content, while its obvious meaninglessness keeps the conversation on the design.
          </p>

          <h2>Words, sentences or paragraphs</h2>
          <p>
            Pick the unit that matches the slot. Words fill labels and headings where you need an
            exact count. Sentences fill subtitles and card descriptions, and this generator builds
            them the way prose actually behaves — eight to seventeen words each, capitalised,
            ending with a period. Paragraphs of three to five sentences fill article bodies and
            product pages, where what you are really judging is rhythm: how the column reads, how
            far the page scrolls, where the fold lands.
          </p>

          <h2>Why this is a local job</h2>
          <p>
            Generating placeholder text is arithmetic, not a service: pick words from a 69-word
            pool with a seeded random source and join them with spaces. There is nothing a server
            could add except latency and a log of your clicks. This page does the arithmetic in
            the tab you are looking at — load it, pull the network cable, and it still generates
            five thousand words without noticing.
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
