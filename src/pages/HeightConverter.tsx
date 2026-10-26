import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, LockIcon } from '../components/Icons'
import {
  cmToFeetInches,
  feetInchesToCm,
  roundTo,
  type FeetInches,
} from '../lib/height'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'How do you convert centimetres to feet and inches?',
    a: 'One inch is exactly 2.54 centimetres, so divide the centimetre value by 2.54 to get total inches, then split that into feet and inches. For example, 175 cm divided by 2.54 is 68.9 inches, which is 5 feet and 8.9 inches. The calculator does this for you and rounds inches to one decimal place.',
  },
  {
    q: 'How do you convert feet and inches to centimetres?',
    a: 'Multiply the number of feet by 12 and add the remaining inches to get total inches, then multiply by 2.54 to get centimetres. For example, 5 feet 9 inches is 69 inches, and 69 × 2.54 = 175.26 centimetres. The calculator rounds the result to one decimal place.',
  },
  {
    q: 'Why is the conversion factor exactly 2.54?',
    a: 'In 1959 the international yard and pound agreement fixed one inch as exactly 2.54 centimetres, ending a long history of slightly different definitions in different countries. Before that, the inch varied by a tiny amount between the United States and the United Kingdom, which could cause errors in precision work. The 2.54 value is now universal, so conversions are exact rather than approximate.',
  },
  {
    q: 'Can I convert very tall or very short heights?',
    a: 'Yes. The converter handles any positive height, from well below 1 foot to far above 7 feet, because the formula is just multiplication and division. There is no built-in range restriction, and the result is rounded to a sensible number of decimal places. Even extreme values convert correctly.',
  },
  {
    q: 'Does the converter store the height I enter?',
    a: 'No. The height you type lives only in the memory of this browser tab while the page is open. There is no server, no account and no analytics event tied to your input. Close the tab and the number is gone — the privacy policy explains in detail.',
  },
]

export function HeightConverter() {
  useSeo({
    ...routeMeta('/tools/height-converter'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit Height Converter',
          'Convert your height between centimetres and feet and inches instantly. Enter a value in one unit and see the other update as you type. Runs locally — nothing is uploaded.',
          '/tools/height-converter',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [cm, setCm] = useState('175')
  const [fi, setFi] = useState<FeetInches>({ feet: 5, inches: 8.9 })

  function onCmChange(value: string) {
    setCm(value)
    const cmNum = Number(value)
    if (Number.isFinite(cmNum) && cmNum > 0) {
      setFi(cmToFeetInches(cmNum, 1))
    }
  }

  function onFeetChange(value: string) {
    const next = { ...fi, feet: value === '' ? 0 : Number(value) }
    setFi(next)
    const cmVal = feetInchesToCm(next.feet, next.inches)
    if (Number.isFinite(cmVal) && cmVal > 0) {
      setCm(String(roundTo(cmVal, 1)))
    }
  }

  function onInchesChange(value: string) {
    const next = { ...fi, inches: value === '' ? 0 : Number(value) }
    setFi(next)
    const cmVal = feetInchesToCm(next.feet, next.inches)
    if (Number.isFinite(cmVal) && cmVal > 0) {
      setCm(String(roundTo(cmVal, 1)))
    }
  }

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Everyday</span>
          <h1>Height, in the unit you actually use.</h1>
          <p>
            Convert between centimetres and feet and inches instantly — type in one and the
            other updates as you go. No account, no upload — your height stays in this tab.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container workspace">
          <div>
            <div className="panel">
              <div className="split" style={{ gap: 12 }}>
                <div className="field" style={{ flex: 1 }}>
                  <span className="field-label">Centimetres (cm)</span>
                  <input
                    type="number"
                    value={cm}
                    onChange={(e) => onCmChange(e.target.value)}
                    style={{ width: '100%' }}
                    data-testid="cm-input"
                  />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <span className="field-label">Feet</span>
                  <input
                    type="number"
                    value={fi.feet}
                    onChange={(e) => onFeetChange(e.target.value)}
                    style={{ width: '100%' }}
                    data-testid="feet-input"
                  />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <span className="field-label">Inches</span>
                  <input
                    type="number"
                    value={fi.inches}
                    onChange={(e) => onInchesChange(e.target.value)}
                    step="0.1"
                    style={{ width: '100%' }}
                    data-testid="inches-input"
                  />
                </div>
              </div>

              <div
                data-testid="height-output"
                style={{
                  marginTop: 22,
                  padding: '20px',
                  background: 'var(--paper-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                }}
              >
                <div className="muted" style={{ fontSize: 13 }}>
                  {cm} cm equals
                </div>
                <div className="mono" style={{ fontSize: 32, fontWeight: 600, marginTop: 4 }}>
                  {fi.feet} ft {fi.inches} in
                </div>
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
                  'Centimetres to feet and inches, and back',
                  'Both directions update as you type',
                  'Inches rounded to one decimal place',
                  'Exact 2.54 cm per inch conversion',
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
                <LockIcon size={14} /> Your height never leaves this tab. There is no server to
                log it, no request to inspect — the Network panel stays empty.{' '}
                <Link to="/privacy">Read the privacy policy</Link>.
              </p>
            </div>

            <div className="panel">
              <span className="panel-title">Related</span>
              <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
                <li>
                  <Link to="/guides/height-converter-without-upload">
                    Guide: height without a server
                  </Link>
                </li>
                <li>
                  <Link to="/tools/unit-converter">Unit converter</Link>
                </li>
                <li>
                  <Link to="/tools/bmi-calculator">BMI calculator</Link>
                </li>
                <li>
                  <Link to="/tools/date-calculator">Date calculator</Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container-narrow prose">
          <h2>One inch is exactly 2.54 centimetres</h2>
          <p>
            Converting height between metric and imperial is a single multiplication or
            division, because one inch is defined as exactly 2.54 centimetres. To go from
            centimetres to feet and inches, divide the centimetre value by 2.54 to get total
            inches, then split those inches into groups of 12 for the feet and the remainder
            for the inches. For example, 175 cm divided by 2.54 is 68.9 inches, which is 5 feet
            and 8.9 inches.
          </p>

          <h2>Going the other way</h2>
          <p>
            To convert feet and inches back to centimetres, do the reverse. Multiply the feet
            by 12 and add the remaining inches to get the total number of inches, then multiply
            by 2.54. For 5 feet 9 inches that is 69 inches × 2.54 = 175.26 centimetres. The
            relationship is exact because it is defined that way — there is no approximation in
            the conversion factor itself, only in how many decimal places you choose to round
            the answer to.
          </p>

          <h2>Why 2.54 and not some other number</h2>
          <p>
            The inch was not always exactly 2.54 cm. For centuries it had slightly different
            definitions in different countries — the United States used one value, the United
            Kingdom another, and surveyors used a third. In 1959 the international yard and
            pound agreement fixed the inch at exactly 2.54 centimetres everywhere, ending the
            confusion. The only remaining exception is the US survey foot, which uses a
            slightly different value for legacy land surveying, but for everyday height
            conversion the 2.54 factor is universal.
          </p>

          <h2>Why your height should stay local</h2>
          <p>
            Height is not a secret, but it is still a piece of identifying information.
            Combined with a rough location and a time of day it can help narrow down a specific
            person, and health data of any kind is valuable to insurers, employers and
            advertisers. Server-side height converters log every value that passes through
            them. The local alternative needs none of that: the conversion is a single
            multiplication, and the whole calculation finishes inside the tab without a single
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
