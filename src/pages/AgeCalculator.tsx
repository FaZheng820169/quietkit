import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, LockIcon } from '../components/Icons'
import { computeAge, formatDateLong, toInputDate, today } from '../lib/age'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'How is age calculated in years, months and days?',
    a: 'The calculator counts full years first, using the most recent birthday anniversary on or before today. Then it counts full months forward from that anniversary, treating a birth on the 31st as the last day of shorter months. Finally the remaining days are the gap from the last monthly anniversary to today. This is the same method most official age calculators use, and it gives consistent answers across month-length and leap-year edge cases.',
  },
  {
    q: 'What happens if I was born on February 29?',
    a: 'In non-leap years there is no February 29, so the birthday anniversary is treated as February 28 (the legal default in most jurisdictions). Your age still advances by a year every 365 or 366 days as usual, and the next-birthday countdown uses February 28 in non-leap years. In leap years the anniversary lands on February 29 as expected.',
  },
  {
    q: 'Why does the 31st sometimes show as the last day of a shorter month?',
    a: 'Because not every month has 31 days. A birth on January 31 does not have a corresponding day in February, so the monthly anniversary is the last day of February — the 28th or 29th. Without this clamping, a naive subtraction gives negative days or silently wrong month counts. The calculator follows the common convention that the anniversary is the last day of the month when the original day does not exist.',
  },
  {
    q: 'What are total days, weeks and months?',
    a: 'Total days is the exact number of 24-hour periods between the birth date and today. Total weeks is that number divided by seven, rounded down. Total months is the years-times-twelve plus the months from the broken-down age. These are exact counts, not estimates, so you can see exactly how many days you have been alive.',
  },
  {
    q: 'Does the calculator store my birth date?',
    a: 'No. The birth date lives only in the memory of this browser tab while the page is open. There is no server, no account and no analytics event tied to your input. Close the tab and the date is gone — the privacy policy explains in detail.',
  },
]

export function AgeCalculator() {
  useSeo({
    ...routeMeta('/tools/age-calculator'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit Age Calculator',
          'Enter a birth date and get the exact age in years, months and days, plus total days, weeks and months lived, and the countdown to the next birthday. Handles leap-day births and month-length edge cases correctly. Runs locally — nothing is uploaded.',
          '/tools/age-calculator',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [birthStr, setBirthStr] = useState('1990-01-01')
  const [atStr, setAtStr] = useState(toInputDate(today()))

  const result = useMemo(() => {
    const birth = new Date(birthStr + 'T00:00:00')
    if (Number.isNaN(birth.getTime())) return null
    const at = new Date(atStr + 'T00:00:00')
    if (Number.isNaN(at.getTime())) return null
    return computeAge({ birth, at })
  }, [birthStr, atStr])

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Everyday</span>
          <h1>How old are you, exactly?</h1>
          <p>
            Enter a birth date and get the age in years, months and days — plus total days,
            weeks, months lived and the countdown to the next birthday. Leap days and
            month-length edge cases are handled correctly, not fudged.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container workspace">
          <div>
            <div className="panel">
              <div className="split" style={{ gap: 12 }}>
                <div className="field" style={{ flex: 1 }}>
                  <span className="field-label">Date of birth</span>
                  <input
                    type="date"
                    value={birthStr}
                    max={atStr}
                    onChange={(e) => setBirthStr(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <span className="field-label">Calculate age on</span>
                  <input
                    type="date"
                    value={atStr}
                    onChange={(e) => setAtStr(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {result === null && (
                <div
                  style={{
                    marginTop: 18,
                    padding: '12px 16px',
                    background: 'var(--paper-2)',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                    color: 'var(--accent)',
                  }}
                >
                  The "calculate on" date is before the date of birth — there is no age yet.
                </div>
              )}

              {result && (
                <>
                  <div
                    data-testid="age-output"
                    style={{
                      marginTop: 22,
                      padding: '20px',
                      background: 'var(--paper-2)',
                      border: '1px solid var(--line)',
                      borderRadius: 8,
                    }}
                  >
                    <div className="muted" style={{ fontSize: 13 }}>Exact age</div>
                    <div className="mono" style={{ fontSize: 30, fontWeight: 600, marginTop: 4 }}>
                      {result.years} years, {result.months} months, {result.days} days
                    </div>
                  </div>

                  <div
                    className="stat-grid"
                    style={{ marginTop: 16, gridTemplateColumns: 'repeat(2, 1fr)' }}
                  >
                    <div className="stat">
                      <span className="stat-label">Total days</span>
                      <span className="stat-value mono">
                        {result.totalDays.toLocaleString('en-US')}
                      </span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Total weeks</span>
                      <span className="stat-value mono">
                        {result.totalWeeks.toLocaleString('en-US')}
                      </span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Total months</span>
                      <span className="stat-value mono">
                        {result.totalMonths.toLocaleString('en-US')}
                      </span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Total hours</span>
                      <span className="stat-value mono">
                        {result.totalHours.toLocaleString('en-US')}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 16,
                      padding: '14px 18px',
                      background: 'var(--paper-2)',
                      border: '1px solid var(--line)',
                      borderRadius: 8,
                      fontSize: 15,
                    }}
                  >
                    Next birthday:{' '}
                    <strong data-testid="next-birthday">{formatDateLong(result.nextBirthday)}</strong>{' '}
                    — <span data-testid="days-to-birthday">{result.daysToNextBirthday}</span> day
                    {result.daysToNextBirthday === 1 ? '' : 's'} away
                    {result.daysToNextBirthday === 0 ? ' (today!)' : ''}
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
                  'Age in years, months and days',
                  'Total days, weeks, months and hours',
                  'Countdown to the next birthday',
                  'Correct leap-day and 31st handling',
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
                <LockIcon size={14} /> Your birth date never leaves this tab. There is no
                server to log it, no request to inspect — the Network panel stays empty.{' '}
                <Link to="/privacy">Read the privacy policy</Link>.
              </p>
            </div>

            <div className="panel">
              <span className="panel-title">Related</span>
              <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
                <li>
                  <Link to="/guides/age-calculator-without-upload">
                    Guide: age without a server
                  </Link>
                </li>
                <li>
                  <Link to="/tools/timestamp-converter">Unix timestamp converter</Link>
                </li>
                <li>
                  <Link to="/tools/percentage-calculator">Percentage calculator</Link>
                </li>
                <li>
                  <Link to="/tools/unit-converter">Unit converter</Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container-narrow prose">
          <h2>Age is not a simple subtraction</h2>
          <p>
            It looks easy — subtract the birth year from the current year — but that only
            works if the birthday has already happened this year. The real calculation needs
            three pieces: full years since the last birthday, full months since that
            anniversary, and the remaining days. Each piece depends on the one before it, and
            each has its own edge case: a birthday not yet passed means one fewer year, a
            monthly anniversary that does not exist means the last day of the month, and a
            remaining-day count that depends on how long the borrowed month was.
          </p>

          <h2>Leap days and the 31st problem</h2>
          <p>
            Two birthdays do not occur every year: February 29, and the 31st of any month
            followed by a shorter month. A leap-day baby born on February 29 has no birthday
            in three out of four years; the convention is to celebrate on February 28.
            Someone born on January 31 has no January-31-equivalent in February, so the
            monthly anniversary falls on February 28 or 29. The calculator follows these
            conventions rather than pretending the missing dates exist, which is what gives
            consistent month counts instead of negative or fractional days.
          </p>

          <h2>Total counts vs broken-down age</h2>
          <p>
            The "years, months, days" answer is a human-friendly breakdown, but it is not the
            only way to measure a lifespan. Total days is exact: the number of 24-hour periods
            between the birth date and today, no ambiguity. Total weeks divides that by seven.
            Total months is the years-times-twelve plus the months from the breakdown. They
            measure the same span in different units, and none of them is more "right" than the
            others — the right one depends on whether you want a human-readable age or a
            precise count of lived time.
          </p>

          <h2>Why a birth date should stay local</h2>
          <p>
            A birth date is a small piece of information but a powerful one. Combined with a
            name and a city it is enough to identify a real person, and combined with other
            data it is a key ingredient in identity theft and account-takeover attempts.
            Server-side age calculators get to log every birth date entered into them, and
            many do — either for analytics or because they never thought not to.
          </p>
          <p>
            The local alternative needs none of that. Age is a few date subtractions and a
            month-length lookup — nothing that requires a database or a round-trip. This
            calculator runs entirely in the tab, so the birth date never leaves the device and
            the page works the same with the network switched off as it does with it on.
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
