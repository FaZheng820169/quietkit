import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, LockIcon } from '../components/Icons'
import {
  calculateGpa,
  GRADE_OPTIONS,
  type Course,
} from '../lib/gpa'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'How is GPA calculated?',
    a: 'GPA is a weighted average of your course grades. Each letter grade maps to a point value on a 4.0 scale — an A is 4.0, a B is 3.0, and so on. Multiply each grade\'s points by the course\'s credit hours, add all those products together, and divide by the total number of credit hours. For example, a 3-credit A and a 4-credit B give (4.0×3 + 3.0×4) ÷ 7 = 3.43.',
  },
  {
    q: 'Why do more credits count for more?',
    a: 'Credit hours reflect how much time a course takes, so a 4-credit lecture affects your GPA more than a 1-credit lab. A 4-credit course is worth four times as much as a 1-credit course in the weighted average. This is why doing well in a heavy major course matters more than acing a short elective.',
  },
  {
    q: 'Do plus and minus grades change the GPA?',
    a: 'Yes, on the standard 4.0 scale with plus and minus grades. An A- is 3.7 instead of 4.0, a B+ is 3.3 instead of 3.0, and so on in steps of 0.3. An A+ is usually capped at 4.0, so it does not push you above a perfect 4.0. F is always 0.0. Some schools use a different scale, so check your own institution\'s policy.',
  },
  {
    q: 'What if I have a pass/fail course?',
    a: 'Pass/fail courses are usually not included in the GPA calculation because they do not receive a letter grade. If your school gives you a grade point for a pass, enter it; otherwise leave it out. The calculator only counts courses that have a letter grade on the 4.0 scale, and it ignores any course with zero credits.',
  },
  {
    q: 'Does the calculator store my grades?',
    a: 'No. The courses and grades you enter live only in the memory of this browser tab while the page is open. There is no server, no account and no analytics event tied to your input. Close the tab and the numbers are gone — the privacy policy explains in detail.',
  },
]

export function GpaCalculator() {
  useSeo({
    ...routeMeta('/tools/gpa-calculator'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit GPA Calculator',
          'Calculate your cumulative grade point average on a 4.0 scale. Enter each course\'s grade and credit hours and see your GPA update instantly. Runs locally — your grades never leave your browser.',
          '/tools/gpa-calculator',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [courses, setCourses] = useState<Course[]>([
    { name: 'Calculus', credits: 4, grade: 'A' },
    { name: 'History', credits: 3, grade: 'B+' },
    { name: 'Chemistry', credits: 4, grade: 'A-' },
  ])

  const result = useMemo(() => calculateGpa(courses), [courses])

  function updateCourse(i: number, field: keyof Course, value: string) {
    setCourses((prev) => {
      const next = [...prev]
      if (field === 'credits') {
        next[i] = { ...next[i], credits: value === '' ? 0 : Number(value) }
      } else {
        next[i] = { ...next[i], [field]: value }
      }
      return next
    })
  }

  function addCourse() {
    setCourses((prev) => [...prev, { name: '', credits: 3, grade: 'B' }])
  }

  function removeCourse(i: number) {
    setCourses((prev) => prev.filter((_, idx) => idx !== i))
  }

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Education</span>
          <h1>Your GPA, one course at a time.</h1>
          <p>
            Enter each course's grade and credit hours and watch your cumulative GPA update
            instantly. No account, no upload — your grades stay in this tab.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container workspace">
          <div>
            <div className="panel">
              <div style={{ marginTop: 6 }}>
                {courses.map((c, i) => (
                  <div
                    key={i}
                    className="split"
                    style={{ gap: 8, marginTop: 8, alignItems: 'end' }}
                  >
                    <div className="field" style={{ flex: 2 }}>
                      <span className="field-label">Course</span>
                      <input
                        type="text"
                        value={c.name}
                        onChange={(e) => updateCourse(i, 'name', e.target.value)}
                        placeholder="Course name"
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div className="field" style={{ flex: 1 }}>
                      <span className="field-label">Credits</span>
                      <input
                        type="number"
                        min="0"
                        value={c.credits}
                        onChange={(e) => updateCourse(i, 'credits', e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div className="field" style={{ flex: 1 }}>
                      <span className="field-label">Grade</span>
                      <select
                        value={c.grade}
                        onChange={(e) => updateCourse(i, 'grade', e.target.value)}
                        style={{ width: '100%' }}
                        data-testid={`grade-select-${i}`}
                      >
                        {GRADE_OPTIONS.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => removeCourse(i)}
                      style={{
                        padding: '8px 12px',
                        marginBottom: 4,
                        background: 'transparent',
                        border: '1px solid var(--line)',
                        borderRadius: 6,
                        cursor: 'pointer',
                      }}
                      aria-label="Remove course"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addCourse}
                style={{
                  marginTop: 12,
                  padding: '8px 16px',
                  background: 'var(--paper-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                + Add course
              </button>

              {result ? (
                <div
                  data-testid="gpa-output"
                  style={{
                    marginTop: 22,
                    padding: '20px',
                    background: 'var(--paper-2)',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                  }}
                >
                  <div className="muted" style={{ fontSize: 13 }}>
                    Cumulative GPA
                  </div>
                  <div className="mono" style={{ fontSize: 44, fontWeight: 600, marginTop: 4 }}>
                    {result.gpa.toFixed(2)}
                    <span style={{ fontSize: 18, color: 'var(--muted)' }}> / 4.0</span>
                  </div>
                  <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>
                    {result.totalCredits} credit hours · {courses.length} courses
                  </div>
                </div>
              ) : (
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
                  Add at least one course with positive credits to see your GPA.
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
                  'Standard 4.0 scale with plus and minus grades',
                  'Credit-hour weighting for each course',
                  'Add or remove courses as you go',
                  'Instant recalculation as you type',
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
                <LockIcon size={14} /> Your courses and grades never leave this tab. There is
                no server to log them, no request to inspect — the Network panel stays empty.{' '}
                <Link to="/privacy">Read the privacy policy</Link>.
              </p>
            </div>

            <div className="panel">
              <span className="panel-title">Related</span>
              <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
                <li>
                  <Link to="/guides/gpa-calculator-without-upload">
                    Guide: GPA without a server
                  </Link>
                </li>
                <li>
                  <Link to="/tools/grade-calculator">Grade calculator</Link>
                </li>
                <li>
                  <Link to="/tools/percentage-calculator">Percentage calculator</Link>
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
          <h2>GPA is a weighted average of your grades</h2>
          <p>
            Your grade point average is the sum of your grade points divided by your total
            credit hours. Each letter grade maps to a point value on a 4.0 scale — an A is 4.0,
            a B is 3.0, a C is 2.0, and an F is 0.0. Plus and minus grades shift the value by
            0.3, so an A- is 3.7 and a B+ is 3.3. An A+ is usually capped at 4.0, so it cannot
            push a perfect record above 4.0.
          </p>

          <h2>Why credits change the weight</h2>
          <p>
            A 4-credit course counts four times as much as a 1-credit course, because credit
            hours represent how much time the course demands. To calculate the GPA, multiply
            each course's grade points by its credits, add all those products together, and
            divide by the total credits. For a 3-credit A and a 4-credit B, that is (4.0×3 +
            3.0×4) ÷ 7 = 24 ÷ 7 = 3.43. The calculator does this for you and updates the
            result every time you change a grade or credit value.
          </p>

          <h2>The 4.0 scale, plus and minus</h2>
          <p>
            The standard scale gives A 4.0, A- 3.7, B+ 3.3, B 3.0, B- 2.7, C+ 2.3, C 2.0,
            C- 1.7, D+ 1.3, D 1.0, D- 0.7, and F 0.0. Some schools use a different scale —
            some give A+ a 4.3, some do not use plus and minus at all — so if your
            institution's scale differs, the number here may not match your official
            transcript exactly. The calculator uses the most common 4.0 scale with +/-
            grades.
          </p>

          <h2>Why your grades should stay local</h2>
          <p>
            A list of courses and grades combined with a rough location and a time of year can
            narrow down a specific student at a specific school, and that information is
            valuable to colleges, employers and advertisers. Server-side GPA calculators log
            every set of grades that passes through them. The local alternative needs none of
            that: the calculation is simple arithmetic, and the whole thing finishes inside the
            tab without a single network request.
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
