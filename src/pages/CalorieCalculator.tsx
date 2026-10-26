import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, LockIcon } from '../components/Icons'
import {
  ACTIVITY_LABELS,
  computeCalories,
  feetInchesToInches,
  type ActivityLevel,
  type Gender,
  type UnitSystem,
} from '../lib/calorie'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'What is the difference between BMR and TDEE?',
    a: 'BMR (Basal Metabolic Rate) is the number of calories your body burns at complete rest, just to keep vital functions going — breathing, circulation, brain activity, organ maintenance. TDEE (Total Daily Energy Expenditure) is BMR multiplied by an activity factor that accounts for everything else you do during the day, from walking to the kitchen to a full gym session. TDEE is the number you actually use as your maintenance calorie target, because it reflects your real daily burn, not a resting one.',
  },
  {
    q: 'Which BMR equation does this calculator use?',
    a: 'The Mifflin-St Jeor equation. It is the most accurate of the widely used equations and is recommended by the Academy of Nutrition and Dietetics. For men it is 10 × weight in kg + 6.25 × height in cm − 5 × age + 5. For women it is the same but with − 161 instead of + 5. The result is BMR, which is then multiplied by your activity factor to give TDEE.',
  },
  {
    q: 'How accurate is the calorie estimate?',
    a: 'It is a good starting point, not a precise measurement. Mifflin-St Jeor estimates BMR within about 5–10% for most people, and the activity factor is a rough classification — "moderately active" can mean very different things to different people. Your real daily burn depends on muscle mass, genetics, hormone levels, sleep, stress and the thermic effect of food, none of which the equation captures. Use the number as a baseline and adjust based on how your weight actually changes over a few weeks.',
  },
  {
    q: 'Are the weight-goal calories safe?',
    a: 'The targets assume a deficit or surplus of 500 kcal per day for 0.5 kg per week, or 1000 kcal per day for 1 kg per week. A deficit of 1000 kcal can be aggressive and is not suitable for everyone — if it drops your intake below about 1200 kcal (women) or 1500 kcal (men), the result may show a very low number and you should eat more and lose weight more slowly instead. The calculator shows the targets; whether they are right for you depends on your starting weight, body composition and health.',
  },
  {
    q: 'Does the calculator store the details I enter?',
    a: 'No. Your age, gender, height, weight and activity level live only in the memory of this browser tab while the page is open. There is no server, no account and no analytics event tied to your input. Close the tab and the numbers are gone — the privacy policy explains in detail.',
  },
]

const ACTIVITY_OPTIONS: ActivityLevel[] = ['sedentary', 'light', 'moderate', 'very', 'extra']

export function CalorieCalculator() {
  useSeo({
    ...routeMeta('/tools/calorie-calculator'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit Calorie Calculator',
          'Estimate your daily calorie needs with the Mifflin-St Jeor BMR equation and an activity factor. See maintenance calories plus targets for losing or gaining weight. Runs locally — nothing is uploaded.',
          '/tools/calorie-calculator',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [unit, setUnit] = useState<UnitSystem>('metric')
  const [gender, setGender] = useState<Gender>('male')
  const [age, setAge] = useState('30')

  // Metric
  const [weightKg, setWeightKg] = useState('70')
  const [heightCm, setHeightCm] = useState('175')

  // Imperial
  const [weightLb, setWeightLb] = useState('154')
  const [feet, setFeet] = useState('5')
  const [inches, setInches] = useState('9')

  const [activity, setActivity] = useState<ActivityLevel>('light')

  const result = useMemo(() => {
    if (unit === 'metric') {
      return computeCalories({
        unit: 'metric',
        gender,
        age: Number(age),
        weight: Number(weightKg),
        height: Number(heightCm),
        activity,
      })
    }
    return computeCalories({
      unit: 'imperial',
      gender,
      age: Number(age),
      weight: Number(weightLb),
      height: feetInchesToInches(Number(feet), Number(inches)),
      activity,
    })
  }, [unit, gender, age, weightKg, heightCm, weightLb, feet, inches, activity])

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Health</span>
          <h1>Daily calories, without the spreadsheet.</h1>
          <p>
            Estimate your BMR and TDEE with the Mifflin-St Jeor equation, then see calorie
            targets for maintaining, losing or gaining weight. No account, no upload — your
            details stay in this tab.
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

              <div className="field" style={{ marginTop: 18 }}>
                <span className="field-label">Gender</span>
                <div className="segmented" style={{ marginTop: 8 }}>
                  <button aria-pressed={gender === 'male'} onClick={() => setGender('male')}>
                    Male
                  </button>
                  <button aria-pressed={gender === 'female'} onClick={() => setGender('female')}>
                    Female
                  </button>
                </div>
              </div>

              <div className="field" style={{ marginTop: 18 }}>
                <span className="field-label">Age</span>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              {unit === 'metric' ? (
                <div className="split" style={{ gap: 12, marginTop: 14 }}>
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
                  <div className="field" style={{ marginTop: 14 }}>
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

              <div className="field" style={{ marginTop: 14 }}>
                <span className="field-label">Activity level</span>
                <select
                  value={activity}
                  onChange={(e) => setActivity(e.target.value as ActivityLevel)}
                  style={{ width: '100%', marginTop: 8 }}
                >
                  {ACTIVITY_OPTIONS.map((a) => (
                    <option key={a} value={a}>
                      {ACTIVITY_LABELS[a]}
                    </option>
                  ))}
                </select>
              </div>

              {result && (
                <div style={{ marginTop: 22 }}>
                  <div
                    data-testid="tdee-output"
                    style={{
                      padding: '20px',
                      background: 'var(--paper-2)',
                      border: '1px solid var(--line)',
                      borderRadius: 8,
                    }}
                  >
                    <div className="muted" style={{ fontSize: 13 }}>
                      Maintenance calories (TDEE)
                    </div>
                    <div className="mono" style={{ fontSize: 40, fontWeight: 600, marginTop: 4 }}>
                      {result.tdee.toLocaleString('en-US')}
                      <span style={{ fontSize: 18, fontWeight: 400 }}> kcal/day</span>
                    </div>
                    <div className="muted" style={{ marginTop: 6, fontSize: 13 }}>
                      BMR at rest: {result.bmr.toLocaleString('en-US')} kcal/day
                    </div>
                  </div>

                  <div
                    className="stat-grid"
                    style={{
                      marginTop: 16,
                      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                    }}
                  >
                    {result.goals.map((g) => (
                      <div key={g.label} className="stat" data-testid="goal">
                        <span className="stat-label">{g.label}</span>
                        <span className="stat-value mono" data-testid="goal-calories">
                          {g.calories.toLocaleString('en-US')}
                        </span>
                      </div>
                    ))}
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
                  Enter an age, weight and height above zero to see your calorie estimate.
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
                  'Mifflin-St Jeor BMR for men and women',
                  'TDEE across five activity levels',
                  'Maintenance, lose and gain calorie targets',
                  'Metric (kg/cm) and imperial (lb/ft+in) modes',
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
                <LockIcon size={14} /> Your age, height, weight and activity level never leave
                this tab. There is no server to log them, no request to inspect — the Network
                panel stays empty. <Link to="/privacy">Read the privacy policy</Link>.
              </p>
            </div>

            <div className="panel">
              <span className="panel-title">Related</span>
              <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
                <li>
                  <Link to="/guides/calorie-calculator-without-upload">
                    Guide: calories without a server
                  </Link>
                </li>
                <li>
                  <Link to="/tools/bmi-calculator">BMI calculator</Link>
                </li>
                <li>
                  <Link to="/tools/percentage-calculator">Percentage calculator</Link>
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
          <h2>BMR is what you burn lying still</h2>
          <p>
            Your Basal Metabolic Rate is the number of calories your body burns at complete
            rest, just to keep vital functions going — breathing, circulating blood, keeping
            the brain active, maintaining organs and body temperature. It is the floor of your
            daily energy use, and for most adults it accounts for 60–75% of the calories they
            burn in a day. The calculator estimates it with the Mifflin-St Jeor equation, which
            is the most accurate of the widely used formulas and is recommended by the Academy
            of Nutrition and Dietetics.
          </p>

          <h2>TDEE adds your activity on top</h2>
          <p>
            TDEE (Total Daily Energy Expenditure) is your BMR multiplied by an activity factor
            that accounts for everything you do beyond lying still. A sedentary person — desk
            job, little structured exercise — uses a factor of 1.2, while someone with a
            physical job or twice-daily training can use 1.9. The five levels in the calculator
            cover the common range, and picking the right one matters: a person with a 1650
            kcal BMR gets a TDEE of 1980 at sedentary and 3135 at extra active, a difference of
            more than 1100 calories a day.
          </p>

          <h2>Weight goals are just a deficit or surplus</h2>
          <p>
            A kilogram of body fat is roughly 7700 kcal, so a daily deficit of 500 kcal should
            lose about 0.5 kg per week and a deficit of 1000 kcal about 1 kg per week. The
            calculator shows targets for maintaining, losing 0.5 or 1 kg per week, and gaining
            the same amounts, by adding or subtracting 500 or 1000 kcal from your TDEE. These
            are estimates — real weight loss is not perfectly linear because your metabolism
            adapts, your activity changes and water weight fluctuates — but they are a
            reasonable starting point.
          </p>

          <h2>Why your details should stay local</h2>
          <p>
            Age, gender, height and weight are not secrets on their own, but together they are
            quite identifying. A server-side calorie calculator logs every set of details that
            passes through it, and that log can be matched to an IP address, a time of day and
            other data later. The local alternative needs none of that: the Mifflin-St Jeor
            equation is a few multiplications and additions, and the whole calculation finishes
            inside the tab without a single network request.
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
