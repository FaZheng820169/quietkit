import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, LockIcon } from '../components/Icons'
import { computeTip, formatMoney, TIP_PRESETS, type Rounding } from '../lib/tip'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'Should I tip on the pre-tax or post-tax amount?',
    a: 'Pre-tax. A tip is a thank-you for the service, not a percentage of the tax the government charges. Most American receipts print the subtotal before tax for exactly this reason — tip on that number. If you only have the grand total, it is fine to tip on it; the difference is usually small, and over-tipping by a dollar or two is the kind of mistake that never hurts anyone.',
  },
  {
    q: 'What is a normal tip percentage?',
    a: 'In the United States, 15% is the old baseline for adequate service, 18–20% is the common range for good service, and 25% or more is for excellent service or for staff who depend on tips as their main income. Outside the US, tipping customs vary widely — in many countries it is a small round-up or not expected at all — so check the local norm before you travel.',
  },
  {
    q: 'How does splitting the bill work?',
    a: 'Enter the bill, pick a tip rate and type the number of people. The calculator divides both the tip and the total by the headcount and rounds to the cent. If the per-person total does not divide evenly (it rarely does), the last person pays the extra cent or two so the group total is exact — nobody is short-changed and nobody collects a mysterious surplus.',
  },
  {
    q: 'What does the rounding option do?',
    a: '"No rounding" shows the mathematically exact per-person amount to the cent. "Round up per person" makes each person pay the next whole dollar, so the group always covers the total and the loose change is a small bonus. "Nearest dollar" rounds each share to the nearest dollar for a quick cash split — handy when you do not want to fish for change.',
  },
  {
    q: 'Does the calculator store what I enter?',
    a: 'No. The bill amount, the tip rate and the number of people live only in the memory of this browser tab while the page is open. There is no server, no account and no analytics event tied to your input. Close the tab and the numbers are gone — the privacy policy explains in detail.',
  },
]

type Currency = 'USD' | 'EUR' | 'GBP'

export function TipCalculator() {
  useSeo({
    ...routeMeta('/tools/tip-calculator'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit Tip Calculator',
          'Work out the tip and each person\'s share from the bill, a tip percentage and the number of people. Preset rates, custom percentage, and honest rounding that does not silently pocket the cents. Runs locally — nothing is uploaded.',
          '/tools/tip-calculator',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [bill, setBill] = useState('50.00')
  const [rate, setRate] = useState('18')
  const [people, setPeople] = useState('2')
  const [rounding, setRounding] = useState<Rounding>('none')
  const [currency, setCurrency] = useState<Currency>('USD')

  const result = useMemo(() => {
    const b = Number(bill)
    const r = Number(rate)
    const p = Number(people)
    if (!Number.isFinite(b) || !Number.isFinite(r) || !Number.isFinite(p)) {
      return null
    }
    if (bill === '' || rate === '' || people === '') return null
    return computeTip({ bill: b, rate: r / 100, people: p, rounding })
  }, [bill, rate, people, rounding])

  const fmt = (n: number) => formatMoney(n, currency)

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Everyday</span>
          <h1>Split the bill without the argument.</h1>
          <p>
            Enter the bill, pick a tip percentage and the number of people. The tip, the total
            and each person's share update instantly — with honest rounding that never leaves a
            stray cent on the table.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container workspace">
          <div>
            <div className="panel">
              <div className="split" style={{ gap: 12 }}>
                <div className="field" style={{ flex: 2 }}>
                  <span className="field-label">Bill amount</span>
                  <div className="row" style={{ gap: 8 }}>
                    <span className="mono muted" style={{ fontSize: 18 }}>
                      {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}
                    </span>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={bill}
                      onChange={(e) => setBill(e.target.value)}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <span className="field-label">People</span>
                  <input
                    type="number"
                    min={1}
                    value={people}
                    onChange={(e) => setPeople(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <span className="field-label">Currency</span>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    style={{ width: '100%' }}
                  >
                    <option value="USD">USD $</option>
                    <option value="EUR">EUR €</option>
                    <option value="GBP">GBP £</option>
                  </select>
                </div>
              </div>

              <div className="field" style={{ marginTop: 16 }}>
                <span className="field-label">Tip percentage</span>
                <div className="segmented" style={{ marginTop: 8 }}>
                  {TIP_PRESETS.map((pct) => (
                    <button
                      key={pct}
                      aria-pressed={rate === String(pct)}
                      onClick={() => setRate(String(pct))}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
                <div className="row" style={{ marginTop: 12, gap: 8, alignItems: 'center' }}>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.5"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    style={{ width: 90 }}
                  />
                  <span className="muted">% custom</span>
                </div>
              </div>

              <div className="field" style={{ marginTop: 16 }}>
                <span className="field-label">Rounding</span>
                <div className="segmented" style={{ marginTop: 8 }}>
                  <button aria-pressed={rounding === 'none'} onClick={() => setRounding('none')}>
                    None
                  </button>
                  <button aria-pressed={rounding === 'up'} onClick={() => setRounding('up')}>
                    Round up
                  </button>
                  <button aria-pressed={rounding === 'nearest'} onClick={() => setRounding('nearest')}>
                    Nearest dollar
                  </button>
                </div>
              </div>

              {result && (
                <div
                  data-testid="tip-output"
                  className="stat-grid"
                  style={{ marginTop: 22, gridTemplateColumns: 'repeat(2, 1fr)' }}
                >
                  <div className="stat">
                    <span className="stat-label">Tip</span>
                    <span className="stat-value mono">{fmt(result.tip)}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Total</span>
                    <span className="stat-value mono">{fmt(result.total)}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Tip / person</span>
                    <span className="stat-value mono">{fmt(result.tipPerPerson)}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Each pays</span>
                    <span className="stat-value mono">{fmt(result.totalPerPerson)}</span>
                  </div>
                </div>
              )}

              {result && result.roundingAdjustment !== 0 && (
                <p className="muted" style={{ margin: '12px 2px 0', fontSize: 13 }}>
                  {result.roundingAdjustment > 0
                    ? `Rounding up adds ${fmt(result.roundingAdjustment)} to the group total so nobody is short.`
                    : `Rounding to the nearest dollar removes ${fmt(Math.abs(result.roundingAdjustment))} from the group total.`}
                </p>
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
                  'Preset rates (10–25%) plus custom percentage',
                  'Tip, total and per-person share, live',
                  'Round up, nearest dollar or exact cents',
                  'USD, EUR and GBP formatting',
                  'Works offline — no receipt leaves your device',
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
                <LockIcon size={14} /> The bill amount, tip rate and headcount never leave this
                tab. There is no server to log a receipt, no request to inspect — the Network
                panel stays empty. <Link to="/privacy">Read the privacy policy</Link>.
              </p>
            </div>

            <div className="panel">
              <span className="panel-title">Related</span>
              <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
                <li>
                  <Link to="/guides/tip-calculator-without-upload">
                    Guide: tips and splitting the bill
                  </Link>
                </li>
                <li>
                  <Link to="/tools/unit-converter">Unit converter</Link>
                </li>
                <li>
                  <Link to="/tools/random-number">Random number generator</Link>
                </li>
                <li>
                  <Link to="/tools/word-counter">Word counter</Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container-narrow prose">
          <h2>Tip on the subtotal, not the tax</h2>
          <p>
            A tip is a percentage of the meal and the service, not of the sales tax. Most
            American receipts print a subtotal before tax for exactly this reason — that is the
            number to multiply. If the receipt only shows a grand total, tipping on it is fine;
            the over-tip is small, and a dollar or two extra is the kind of error that never
            hurts the person receiving it.
          </p>

          <h2>What 18% really buys you</h2>
          <p>
            Fifteen percent was the baseline a generation ago; eighteen to twenty is the common
            range now for good sit-down service in the United States. Below fifteen usually means
            the service was poor, above twenty-five usually means it was exceptional or that the
            staff depend on tips as their main income. Outside the US the norms are very
            different — in much of Europe a small round-up is expected and in Japan tipping can
            be considered rude — so look up the local custom before you travel.
          </p>

          <h2>Splitting without the stray cent</h2>
          <p>
            Dividing a bill among three or more people almost never comes out to whole cents.
            The calculator rounds each share to the nearest penny, and when the rounded shares
            add up to slightly more or less than the exact total, the last person absorbs the
            difference so the group pays exactly the right amount. "Round up" makes each person
            pay the next whole dollar, which guarantees the total is covered and usually leaves
            a small over-payment as a bonus. "Nearest dollar" rounds each share to the nearest
            dollar for a quick cash split — honest rounding that does not silently pocket the
            loose change.
          </p>

          <h2>Why this never needs a server</h2>
          <p>
            Tip arithmetic is a few multiplications and a division. There is nothing to look up,
            nothing to verify against a database, nothing that benefits from running on someone
            else's machine. A server-side tip calculator would add a network round-trip and a
            log of every receipt to a calculation that finishes before your finger lifts off the
            key. This one runs entirely in the tab: load it, switch off the Wi-Fi, and it still
            splits the bill correctly without noticing anything changed.
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
