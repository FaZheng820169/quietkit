import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, LockIcon } from '../components/Icons'
import {
  formatNumber,
  formatPercent,
  ofWhat,
  percentChange,
  percentOf,
  whatPercent,
} from '../lib/percentage'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'What are the four percentage modes?',
    a: 'Most percentage questions are one of four shapes. "Of" asks what X percent of a number is — 15% of 200 is 30. "Is" asks what percentage one number is of another — 30 is 15% of 200. "Change" asks how much a value grew or shrank — from 200 to 230 is a 15% increase. "Reverse" asks what number a percentage refers back to — 15% of what is 30, and the answer is 200. Pick the mode that matches the question you are actually asking and the rest fills in.',
  },
  {
    q: 'How is percentage change calculated?',
    a: 'Percentage change is (new − old) divided by the absolute value of the old number, times 100. From 200 to 230 that is 30 divided by 200, or 15%. The absolute value in the denominator matters when the starting point is negative — a loss narrowing from −100 to −50 is a 50% improvement, not −50%. A positive result means an increase, a negative one a decrease, and zero means no change.',
  },
  {
    q: 'Why does the result say "—" sometimes?',
    a: 'Because some percentage questions have no answer. You cannot say what percentage something is of zero, and you cannot calculate a change from zero — both involve dividing by zero, which is undefined. The calculator shows "—" instead of a wrong number or a crash. If you meant a different question, switch modes; otherwise the input really has no percentage answer.',
  },
  {
    q: 'Can I use decimal percentages?',
    a: 'Yes. 7.5%, 0.1%, 33.333% and any other decimal work in every mode. The display rounds to a sensible number of places and trims trailing zeros, so 15.500% shows as 15.5% and 12.000% as 12%. The calculation itself keeps full precision internally.',
  },
  {
    q: 'Does the calculator store what I enter?',
    a: 'No. The numbers you type live only in the memory of this browser tab while the page is open. There is no server, no account and no analytics event tied to your input. Close the tab and the numbers are gone — the privacy policy explains in detail.',
  },
]

type Mode = 'of' | 'is' | 'change' | 'reverse'

const MODES: { id: Mode; label: string }[] = [
  { id: 'of', label: 'What is X% of Y?' },
  { id: 'is', label: 'X is what % of Y?' },
  { id: 'change', label: '% change from X to Y' },
  { id: 'reverse', label: 'X% of what is Y?' },
]

export function PercentageCalculator() {
  useSeo({
    ...routeMeta('/tools/percentage-calculator'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit Percentage Calculator',
          'Work out what a percentage of a number is, what percentage one number is of another, the percentage change between two values, or what number a percentage refers back to. Four modes, instant results, runs locally — nothing is uploaded.',
          '/tools/percentage-calculator',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [mode, setMode] = useState<Mode>('of')
  const [a, setA] = useState('15')
  const [b, setB] = useState('200')

  const result = useMemo(() => {
    const na = Number(a)
    const nb = Number(b)
    if (!Number.isFinite(na) || !Number.isFinite(nb)) return null
    if (a === '' || b === '') return null
    switch (mode) {
      case 'of':
        return { label: `${a}% of ${b}`, value: formatNumber(percentOf(na, nb)) }
      case 'is':
        return { label: `${a} is what % of ${b}`, value: formatPercent(whatPercent(na, nb)) }
      case 'change':
        return { label: `Change from ${a} to ${b}`, value: formatPercent(percentChange(na, nb)) }
      case 'reverse':
        return { label: `${a}% of what is ${b}`, value: formatNumber(ofWhat(na, nb)) }
    }
  }, [mode, a, b])

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Everyday</span>
          <h1>Percentages, without the mental arithmetic.</h1>
          <p>
            Four ways to ask a percentage question — of, is, change and reverse. Type two
            numbers and the answer updates instantly, with division-by-zero handled honestly
            instead of silently.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container workspace">
          <div>
            <div className="panel">
              <div className="field">
                <span className="field-label">Question type</span>
                <div className="segmented" style={{ marginTop: 8, flexWrap: 'wrap' }}>
                  {MODES.map((m) => (
                    <button
                      key={m.id}
                      aria-pressed={mode === m.id}
                      onClick={() => setMode(m.id)}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="split" style={{ gap: 12, marginTop: 18 }}>
                <div className="field" style={{ flex: 1 }}>
                  <span className="field-label">
                    {mode === 'of' && 'Percentage (%)'}
                    {mode === 'is' && 'Value'}
                    {mode === 'change' && 'From'}
                    {mode === 'reverse' && 'Percentage (%)'}
                  </span>
                  <input
                    type="number"
                    value={a}
                    onChange={(e) => setA(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <span className="field-label">
                    {mode === 'of' && 'Of (number)'}
                    {mode === 'is' && 'Of (base)'}
                    {mode === 'change' && 'To'}
                    {mode === 'reverse' && 'Result'}
                  </span>
                  <input
                    type="number"
                    value={b}
                    onChange={(e) => setB(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {result && (
                <div
                  data-testid="pct-output"
                  style={{
                    marginTop: 22,
                    padding: '18px 20px',
                    background: 'var(--paper-2)',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                  }}
                >
                  <div className="muted" style={{ fontSize: 13 }}>{result.label}</div>
                  <div
                    className="mono"
                    style={{ fontSize: 28, fontWeight: 600, marginTop: 6 }}
                  >
                    {result.value}
                  </div>
                </div>
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
                  'Four modes: of, is, change and reverse',
                  'Decimal percentages like 7.5% and 0.1%',
                  'Honest "—" for divide-by-zero cases',
                  'Thousands separators on large numbers',
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
                <LockIcon size={14} /> The numbers you type never leave this tab. There is no
                server to log a calculation, no request to inspect — the Network panel stays
                empty. <Link to="/privacy">Read the privacy policy</Link>.
              </p>
            </div>

            <div className="panel">
              <span className="panel-title">Related</span>
              <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
                <li>
                  <Link to="/guides/percentage-calculator-without-upload">
                    Guide: percentages without a server
                  </Link>
                </li>
                <li>
                  <Link to="/tools/tip-calculator">Tip calculator</Link>
                </li>
                <li>
                  <Link to="/tools/unit-converter">Unit converter</Link>
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
          <h2>One formula, four questions</h2>
          <p>
            Every percentage question is the same equation rearranged. The core is
            <code> part = whole × rate / 100 </code> — three quantities, and whichever one you
            do not know is the answer. "What is 15% of 200?" gives you the rate and the whole
            and asks for the part. "30 is what percent of 200?" gives you the part and the whole
            and asks for the rate. "15% of what is 30?" gives you the rate and the part and asks
            for the whole. The fourth mode, percentage change, is the same idea applied to a
            before-and-after pair: the difference divided by the original, times a hundred.
          </p>

          <h2>Change, with the sign doing the work</h2>
          <p>
            A percentage change needs a direction as well as a size. Going from 200 to 230 is
            a 15% increase; going from 200 to 170 is a 15% decrease. The sign tells you which
            way you went — positive is up, negative is down — so you do not need a separate
            "increase or decrease" toggle. The denominator is the absolute value of the
            starting number, which matters when the starting point is negative: a loss
            narrowing from −100 to −50 is a 50% improvement, not −50%.
          </p>

          <h2>When the answer is no answer</h2>
          <p>
            Some percentage questions have no answer. You cannot say what percentage something
            is of zero, and you cannot measure a change from zero — both involve dividing by
            zero, which is undefined rather than zero or infinity. A calculator that returns 0
            or an error screen in those cases is hiding the fact that the question itself is
            malformed. This one shows "—" so you know there is genuinely no percentage to
            compute, and you can switch modes or fix the input.
          </p>

          <h2>Why this never needs a server</h2>
          <p>
            A percentage is a multiplication and a division. There is nothing to look up,
            nothing to verify against a database, nothing that benefits from running on someone
            else's machine. A server-side percentage calculator would add a network round-trip
            and a log of every calculation to a process that finishes before your finger lifts
            off the key. This one runs entirely in the tab: load it, switch off the Wi-Fi, and
            it still works out 15% of 200 without noticing anything changed.
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
