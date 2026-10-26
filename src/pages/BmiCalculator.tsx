import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, LockIcon } from '../components/Icons'
import { computeBmi, feetInchesToInches, type UnitSystem } from '../lib/bmi'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'What is BMI and how is it calculated?',
    a: 'BMI (Body Mass Index) is weight divided by height squared. In metric units the formula is weight in kilograms divided by height in metres squared — for example, 70 kg divided by 1.75 m squared gives a BMI of 22.9. In imperial units the formula is 703 times weight in pounds divided by height in inches squared — for example, 150 lb divided by 67 in squared, times 703, gives a BMI of 23.5. Both formulas produce the same number for the same person.',
  },
  {
    q: 'What do the BMI categories mean?',
    a: 'The World Health Organisation defines four standard ranges. A BMI below 18.5 is underweight. From 18.5 up to 25 is normal weight. From 25 up to 30 is overweight. A BMI of 30 or above is obese. These boundaries are the same for both metric and imperial units because they apply to the BMI number itself, not to the inputs.',
  },
  {
    q: 'Can I use feet and inches instead of just inches?',
    a: 'Yes. In imperial mode you enter your height as feet and inches separately — for example, 5 feet and 7 inches. The calculator converts that to 67 inches internally before applying the imperial formula. If you already know your total height in inches you can enter it as 0 feet and the number of inches, but the feet-plus-inches input is usually easier.',
  },
  {
    q: 'Is BMI an accurate measure of health?',
    a: 'BMI is a simple screening tool, not a diagnosis. It does not distinguish between muscle and fat, so athletes with a lot of muscle can have a high BMI without being overweight, and older adults who have lost muscle can have a normal BMI while carrying excess fat. Waist measurement, body fat percentage and overall fitness give a fuller picture, and any concern about weight or health should be discussed with a healthcare professional.',
  },
  {
    q: 'Does the calculator store my height and weight?',
    a: 'No. The numbers you type live only in the memory of this browser tab while the page is open. There is no server, no account and no analytics event tied to your input. Close the tab and the numbers are gone — the privacy policy explains in detail.',
  },
]

const CATEGORY_RANGE: Record<string, string> = {
  Underweight: 'below 18.5',
  'Normal weight': '18.5 – 24.9',
  Overweight: '25.0 – 29.9',
  Obese: '30.0 and above',
}

export function BmiCalculator() {
  useSeo({
    ...routeMeta('/tools/bmi-calculator'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit BMI Calculator',
          'Calculate your Body Mass Index in metric (kg/cm) or imperial (lb/ft+in) units and see which WHO category you fall into. Runs locally — your height and weight are never uploaded.',
          '/tools/bmi-calculator',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [unit, setUnit] = useState<UnitSystem>('metric')

  // Metric
  const [weightKg, setWeightKg] = useState('70')
  const [heightCm, setHeightCm] = useState('175')

  // Imperial
  const [weightLb, setWeightLb] = useState('154')
  const [feet, setFeet] = useState('5')
  const [inches, setInches] = useState('9')

  const result = useMemo(() => {
    if (unit === 'metric') {
      return computeBmi('metric', Number(weightKg), Number(heightCm))
    }
    const heightIn = feetInchesToInches(Number(feet), Number(inches))
    return computeBmi('imperial', Number(weightLb), heightIn)
  }, [unit, weightKg, heightCm, weightLb, feet, inches])

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Health</span>
          <h1>BMI, without the paperwork.</h1>
          <p>
            Calculate your Body Mass Index in metric or imperial units and see which WHO
            category you fall into. No account, no upload — the numbers stay in this tab.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container workspace">
          <div>
            <div className="panel">
              <div className="field">
                <span className="field-label">Units</span>
                <div className="segmented" style={{ marginTop: 8 }}>
                  <button aria-pressed={unit === 'metric'} onClick={() => setUnit('metric')}>
                    Metric (kg / cm)
                  </button>
                  <button aria-pressed={unit === 'imperial'} onClick={() => setUnit('imperial')}>
                    Imperial (lb / ft+in)
                  </button>
                </div>
              </div>

              {unit === 'metric' ? (
                <div className="split" style={{ gap: 12, marginTop: 18 }}>
                  <div className="field" style={{ flex: 1 }}>
                    <span className="field-label">Weight (kg)</span>
                    <input
                      type="number"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div className="field" style={{ flex: 1 }}>
                    <span className="field-label">Height (cm)</span>
                    <input
                      type="number"
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="field" style={{ marginTop: 18 }}>
                    <span className="field-label">Weight (lb)</span>
                    <input
                      type="number"
                      value={weightLb}
                      onChange={(e) => setWeightLb(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div className="split" style={{ gap: 12, marginTop: 14 }}>
                    <div className="field" style={{ flex: 1 }}>
                      <span className="field-label">Height (ft)</span>
                      <input
                        type="number"
                        value={feet}
                        onChange={(e) => setFeet(e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div className="field" style={{ flex: 1 }}>
                      <span className="field-label">Height (in)</span>
                      <input
                        type="number"
                        value={inches}
                        onChange={(e) => setInches(e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                </>
              )}

              {result && (
                <div
                  data-testid="bmi-output"
                  style={{
                    marginTop: 22,
                    padding: '20px',
                    background: 'var(--paper-2)',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                  }}
                >
                  <div className="muted" style={{ fontSize: 13 }}>Your BMI</div>
                  <div className="mono" style={{ fontSize: 40, fontWeight: 600, marginTop: 4 }}>
                    {result.bmi}
                  </div>
                  <div
                    data-testid="bmi-category"
                    style={{ marginTop: 8, fontSize: 18, fontWeight: 600 }}
                  >
                    {result.category}
                  </div>
                  <div className="muted" style={{ marginTop: 6, fontSize: 13 }}>
                    WHO range: {CATEGORY_RANGE[result.category]}
                  </div>
                </div>
              )}

              {!result && (
                <div
                  style={{
                    marginTop: 22,
                    padding: '20px',
                    background: 'var(--paper-2)',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                    color: 'var(--muted)',
                  }}
                >
                  Enter a weight and height above zero to see your BMI.
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
                  'Metric (kg/cm) and imperial (lb/ft+in) modes',
                  'WHO category with the range it covers',
                  'One decimal place, no rounding tricks',
                  'Instant results as you type',
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
                <LockIcon size={14} /> Your height and weight never leave this tab. There is no
                server to log them, no request to inspect — the Network panel stays empty.{' '}
                <Link to="/privacy">Read the privacy policy</Link>.
              </p>
            </div>

            <div className="panel">
              <span className="panel-title">Related</span>
              <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
                <li>
                  <Link to="/guides/bmi-calculator-without-upload">
                    Guide: BMI without a server
                  </Link>
                </li>
                <li>
                  <Link to="/tools/percentage-calculator">Percentage calculator</Link>
                </li>
                <li>
                  <Link to="/tools/age-calculator">Age calculator</Link>
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
          <h2>BMI is weight divided by height squared</h2>
          <p>
            The formula is the same everywhere: take your weight and divide it by your height
            squared. The only difference between metric and imperial is the units you feed in.
            In metric you use kilograms and metres, so the formula is kg / m² directly. In
            imperial you use pounds and inches, and you multiply by 703 to convert the units so
            the result lands on the same BMI scale. A person who weighs 70 kg and is 1.75 m
            tall has the same BMI as someone who weighs 154 lb and is 5 ft 9 in — about 22.9.
          </p>

          <h2>The four WHO categories</h2>
          <p>
            The World Health Organisation defines four standard BMI ranges. Below 18.5 is
            underweight. From 18.5 up to 25 is normal weight. From 25 up to 30 is overweight.
            30 and above is obese. These boundaries apply to the BMI number itself, so they are
            identical regardless of whether you calculated in metric or imperial. The
            calculator shows both your category and the range it covers, so you can see where
            you sit within it.
          </p>

          <h2>What BMI does and does not tell you</h2>
          <p>
            BMI is a screening tool, not a diagnosis. It is useful for population-level
            research and for flagging people who may benefit from a closer look, but it does
            not distinguish between muscle and fat. A rugby forward with a lot of muscle can
            have a BMI in the overweight range without carrying excess fat, and an older adult
            who has lost muscle mass can have a normal BMI while carrying too much fat. Waist
            measurement, body fat percentage, blood pressure and overall fitness give a fuller
            picture, and any real concern about weight or health is worth discussing with a
            healthcare professional.
          </p>

          <h2>Why your height and weight should stay local</h2>
          <p>
            Height and weight seem harmless, but together they are identifying. Combined with
            an IP address, a rough location and the time of day, two numbers can narrow a
            person down quite far. Server-side BMI calculators log every pair of numbers that
            passes through them, and that log can be matched to other data later. The local
            alternative needs none of that: BMI is a single division, and the whole
            calculation finishes inside the tab without a single network request.
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
