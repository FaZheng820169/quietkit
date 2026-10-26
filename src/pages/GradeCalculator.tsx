import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, LockIcon } from '../components/Icons'
import {
  finalGradeNeeded,
  weightedAverage,
  type Assignment,
} from '../lib/grade'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'How does the final exam calculator work?',
    a: 'It rearranges the weighted-grade formula. Your course grade is your current grade times its weight plus your final exam score times the final weight. If your current grade is 85, you want 90, and the final is worth 50%, then 85 × 0.5 + final × 0.5 = 90, so final = (90 − 42.5) ÷ 0.5 = 95. The calculator does this for you and also tells you whether the needed score is reachable (≤ 100%).',
  },
  {
    q: 'What is a weighted average?',
    a: 'A weighted average accounts for the fact that not every assignment counts the same. An exam worth 40% of your grade matters four times as much as a quiz worth 10%. To calculate it, multiply each grade by its weight percentage, add those products together, and divide by the total weight. If your weights sum to 100% the division is automatic; if they do not, the calculator still normalises by the total weight you entered.',
  },
  {
    q: 'Why does it say the score I need is over 100?',
    a: 'That means the target grade is not reachable with the remaining weight. If your current grade is 80, you want 90, and the final is worth 40%, you would need 105% on the final — impossible. You can either lower your target grade or accept that the maximum you can finish with is your current grade weighted plus 100% on the final. The calculator shows the number so you can see how far off you are.',
  },
  {
    q: 'Do the weights have to add up to 100%?',
    a: 'For the weighted average they do not have to. The calculator normalises by the total weight you enter, so if you only have grades for 50% of the course it will give you the average of what you have done so far. A note appears if the weights do not sum to 100%, so you know the number represents only part of the course.',
  },
  {
    q: 'Does the calculator store my grades?',
    a: 'No. The grades and weights you enter live only in the memory of this browser tab while the page is open. There is no server, no account and no analytics event tied to your input. Close the tab and the numbers are gone — the privacy policy explains in detail.',
  },
]

type Mode = 'final' | 'average'

export function GradeCalculator() {
  useSeo({
    ...routeMeta('/tools/grade-calculator'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit Grade Calculator',
          'Find out what score you need on your final exam to reach a target grade, or calculate your current weighted average from multiple assignments. Runs locally — your grades never leave your browser.',
          '/tools/grade-calculator',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [mode, setMode] = useState<Mode>('final')

  // Final exam mode
  const [current, setCurrent] = useState('85')
  const [desired, setDesired] = useState('90')
  const [weight, setWeight] = useState('50')

  const finalResult = useMemo(
    () => finalGradeNeeded(Number(current), Number(desired), Number(weight)),
    [current, desired, weight],
  )

  // Weighted average mode
  const [assignments, setAssignments] = useState<Assignment[]>([
    { grade: 90, weight: 30 },
    { grade: 80, weight: 40 },
    { grade: 70, weight: 30 },
  ])

  const avgResult = useMemo(() => weightedAverage(assignments), [assignments])

  function updateAssignment(i: number, field: 'grade' | 'weight', value: string) {
    setAssignments((prev) => {
      const next = [...prev]
      next[i] = { ...next[i], [field]: value === '' ? 0 : Number(value) }
      return next
    })
  }

  function addAssignment() {
    setAssignments((prev) => [...prev, { grade: 0, weight: 0 }])
  }

  function removeAssignment(i: number) {
    setAssignments((prev) => prev.filter((_, idx) => idx !== i))
  }

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Education</span>
          <h1>Grades, without the spreadsheets.</h1>
          <p>
            Find the score you need on your final to hit your target, or work out your current
            weighted average. No account, no upload — your grades stay in this tab.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container workspace">
          <div>
            <div className="panel">
              <div className="field">
                <span className="field-label">Mode</span>
                <div className="segmented" style={{ marginTop: 8 }}>
                  <button aria-pressed={mode === 'final'} onClick={() => setMode('final')}>
                    Final exam needed
                  </button>
                  <button aria-pressed={mode === 'average'} onClick={() => setMode('average')}>
                    Weighted average
                  </button>
                </div>
              </div>

              {mode === 'final' ? (
                <>
                  <div className="split" style={{ gap: 12, marginTop: 18 }}>
                    <div className="field" style={{ flex: 1 }}>
                      <span className="field-label">Current grade (%)</span>
                      <input
                        type="number"
                        value={current}
                        onChange={(e) => setCurrent(e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div className="field" style={{ flex: 1 }}>
                      <span className="field-label">Target grade (%)</span>
                      <input
                        type="number"
                        value={desired}
                        onChange={(e) => setDesired(e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                  <div className="field" style={{ marginTop: 14 }}>
                    <span className="field-label">Final exam weight (%)</span>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>

                  {finalResult && (
                    <div
                      data-testid="final-output"
                      style={{
                        marginTop: 22,
                        padding: '20px',
                        background: finalResult.reachable ? 'var(--paper-2)' : '#fff3f3',
                        border: '1px solid var(--line)',
                        borderRadius: 8,
                      }}
                    >
                      <div className="muted" style={{ fontSize: 13 }}>
                        Score needed on the final
                      </div>
                      <div className="mono" style={{ fontSize: 40, fontWeight: 600, marginTop: 4 }}>
                        {finalResult.needed}%
                      </div>
                      <div style={{ marginTop: 8, fontSize: 14 }}>
                        {finalResult.reachable
                          ? 'Reachable — you can do it.'
                          : 'Not reachable — the target is too high for the remaining weight.'}
                      </div>
                    </div>
                  )}

                  {!finalResult && (
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
                      Enter valid grades and a final weight between 0 and 100.
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div style={{ marginTop: 18 }}>
                    {assignments.map((a, i) => (
                      <div
                        key={i}
                        className="split"
                        style={{ gap: 8, marginTop: 8, alignItems: 'end' }}
                      >
                        <div className="field" style={{ flex: 1 }}>
                          <span className="field-label">Grade (%)</span>
                          <input
                            type="number"
                            value={a.grade}
                            onChange={(e) => updateAssignment(i, 'grade', e.target.value)}
                            style={{ width: '100%' }}
                          />
                        </div>
                        <div className="field" style={{ flex: 1 }}>
                          <span className="field-label">Weight (%)</span>
                          <input
                            type="number"
                            value={a.weight}
                            onChange={(e) => updateAssignment(i, 'weight', e.target.value)}
                            style={{ width: '100%' }}
                          />
                        </div>
                        <button
                          onClick={() => removeAssignment(i)}
                          style={{
                            padding: '8px 12px',
                            marginBottom: 4,
                            background: 'transparent',
                            border: '1px solid var(--line)',
                            borderRadius: 6,
                            cursor: 'pointer',
                          }}
                          aria-label="Remove assignment"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addAssignment}
                    style={{
                      marginTop: 12,
                      padding: '8px 16px',
                      background: 'var(--paper-2)',
                      border: '1px solid var(--line)',
                      borderRadius: 6,
                      cursor: 'pointer',
                    }}
                  >
                    + Add assignment
                  </button>

                  {avgResult && (
                    <div
                      data-testid="average-output"
                      style={{
                        marginTop: 22,
                        padding: '20px',
                        background: 'var(--paper-2)',
                        border: '1px solid var(--line)',
                        borderRadius: 8,
                      }}
                    >
                      <div className="muted" style={{ fontSize: 13 }}>
                        Weighted average
                      </div>
                      <div className="mono" style={{ fontSize: 40, fontWeight: 600, marginTop: 4 }}>
                        {avgResult.average}%
                      </div>
                      <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>
                        Total weight: {avgResult.totalWeight}%
                        {!avgResult.weightOk && ' (does not sum to 100%)'}
                      </div>
                    </div>
                  )}
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
                  'Final exam score needed for any target grade',
                  'Reachability check — flags impossible targets',
                  'Weighted average for multiple assignments',
                  'Add or remove assignments as needed',
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
                <LockIcon size={14} /> Your grades and weights never leave this tab. There is
                no server to log them, no request to inspect — the Network panel stays empty.{' '}
                <Link to="/privacy">Read the privacy policy</Link>.
              </p>
            </div>

            <div className="panel">
              <span className="panel-title">Related</span>
              <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
                <li>
                  <Link to="/guides/grade-calculator-without-upload">
                    Guide: grades without a server
                  </Link>
                </li>
                <li>
                  <Link to="/tools/percentage-calculator">Percentage calculator</Link>
                </li>
                <li>
                  <Link to="/tools/tip-calculator">Tip calculator</Link>
                </li>
                <li>
                  <Link to="/tools/loan-calculator">Loan calculator</Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container-narrow prose">
          <h2>The final exam formula</h2>
          <p>
            Your overall course grade is a weighted average: each component contributes its
            grade multiplied by its weight. If your current grade is 85, you want 90, and the
            final exam is worth 50% of the course, then the equation is 85 × 0.5 + final × 0.5 =
            90. Solving for the final gives (90 − 42.5) ÷ 0.5 = 95, so you need 95% on the
            exam. The calculator rearranges this formula for you and also flags whether the
            needed score is reachable — if it comes out above 100, the target is impossible
            with the weight that is left.
          </p>

          <h2>How weighted averages work</h2>
          <p>
            Not every assignment counts the same. An exam worth 40% of your grade matters four
            times as much as a quiz worth 10%, so simply averaging 90 and 70 to get 80 would be
            wrong. The correct approach is to multiply each grade by its weight, add those
            products together, and divide by the total weight. For three assignments of 90/30%,
            80/40% and 70/30%, the calculation is (90×30 + 80×40 + 70×30) ÷ 100 = 80, which
            happens to equal the simple average only because the weights happen to pull in that
            direction.
          </p>

          <h2>Weights do not have to sum to 100</h2>
          <p>
            If you only have grades for part of the course — say, the first 50% — you can still
            enter them and the calculator will give you the weighted average of what you have
            completed so far, normalised by the total weight you entered. A note appears if the
            weights do not sum to 100%, so you know the number represents only part of the
            course. As you add more assignments the number will update and converge toward
            your final grade.
          </p>

          <h2>Why your grades should stay local</h2>
          <p>
            Grades feel private even when they are not sensitive in a medical sense. A set of
            grades combined with a rough location and a time of year can narrow down a specific
            student at a specific school, and that information is valuable to colleges,
            employers and advertisers. Server-side grade calculators log every set of grades
            that passes through them. The local alternative needs none of that: the formulas are
            simple arithmetic, and the whole calculation finishes inside the tab without a
            single network request.
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
