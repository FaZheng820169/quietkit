import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, LockIcon } from '../components/Icons'
import {
  addToDate,
  dateDiff,
  formatDateLong,
  toInputDate,
  today,
  type DateUnit,
} from '../lib/datecalc'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'How does the days-between calculation work?',
    a: 'The calculator normalises both dates to local midnight and divides the millisecond difference by the number of milliseconds in a day (86,400,000), rounding to the nearest integer. This gives the exact number of calendar days between the two dates, regardless of time zones or daylight-saving changes. A positive result means the second date is after the first; a negative result means it is before.',
  },
  {
    q: 'Why does adding a month not always give the same day next month?',
    a: 'Because months have different lengths. January 31 plus one month cannot be February 31, since February has at most 29 days. The calculator follows the common convention of clamping to the last day of the target month, so January 31 plus one month becomes February 28 (or 29 in a leap year). The same rule applies when adding years to a February 29 birth date in a non-leap year.',
  },
  {
    q: 'What counts as a weekday?',
    a: 'Weekdays are Monday through Friday. The weekday count excludes the start date and the end date itself and counts the days strictly between them, so a span from Monday to the following Monday includes five weekdays (Tuesday through Saturday is not all weekdays — Tuesday, Wednesday, Thursday and Friday, plus the next Monday is the endpoint and excluded). The number is always the count of Mon–Fri days strictly inside the interval.',
  },
  {
    q: 'Does the calculator handle leap years?',
    a: 'Yes. Leap years follow the standard rule: a year is a leap year if it is divisible by 4, except for century years which must also be divisible by 400. The calculator uses the browser built-in Date object, which implements these rules correctly, so February 29 exists only in leap years and all date math accounts for it.',
  },
  {
    q: 'Does the calculator store the dates I enter?',
    a: 'No. The dates live only in the memory of this browser tab while the page is open. There is no server, no account and no analytics event tied to your input. Close the tab and the dates are gone — the privacy policy explains in detail.',
  },
]

type Mode = 'between' | 'add'

export function DateCalculator() {
  useSeo({
    ...routeMeta('/tools/date-calculator'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit Date Calculator',
          'Find the number of days, weeks and weekdays between two dates, or add and subtract days, weeks, months and years from a date. Handles leap years and month-length edge cases correctly. Runs locally — nothing is uploaded.',
          '/tools/date-calculator',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [mode, setMode] = useState<Mode>('between')

  // Between mode
  const [fromStr, setFromStr] = useState(toInputDate(today()))
  const [toStr, setToStr] = useState(toInputDate(today()))

  // Add mode
  const [baseStr, setBaseStr] = useState(toInputDate(today()))
  const [amount, setAmount] = useState('30')
  const [unit, setUnit] = useState<DateUnit>('days')

  const betweenResult = useMemo(() => {
    const from = new Date(fromStr + 'T00:00:00')
    const to = new Date(toStr + 'T00:00:00')
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return null
    return dateDiff(from, to)
  }, [fromStr, toStr])

  const addResult = useMemo(() => {
    const base = new Date(baseStr + 'T00:00:00')
    const n = Number(amount)
    if (Number.isNaN(base.getTime()) || !Number.isFinite(n) || amount === '') return null
    const result = addToDate(base, n, unit)
    const total = dateDiff(base, result)
    return { result, totalDays: total.totalDays }
  }, [baseStr, amount, unit])

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Everyday</span>
          <h1>Date math, without the calendar counting.</h1>
          <p>
            Find the days, weeks and weekdays between two dates, or add and subtract days,
            weeks, months and years from a date. Leap years and month lengths are handled
            correctly, not approximated.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container workspace">
          <div>
            <div className="panel">
              <div className="field">
                <span className="field-label">What do you want to do?</span>
                <div className="segmented" style={{ marginTop: 8 }}>
                  <button aria-pressed={mode === 'between'} onClick={() => setMode('between')}>
                    Days between
                  </button>
                  <button aria-pressed={mode === 'add'} onClick={() => setMode('add')}>
                    Add / subtract
                  </button>
                </div>
              </div>

              {mode === 'between' && (
                <div className="split" style={{ gap: 12, marginTop: 18 }}>
                  <div className="field" style={{ flex: 1 }}>
                    <span className="field-label">From</span>
                    <input
                      type="date"
                      value={fromStr}
                      onChange={(e) => setFromStr(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div className="field" style={{ flex: 1 }}>
                    <span className="field-label">To</span>
                    <input
                      type="date"
                      value={toStr}
                      onChange={(e) => setToStr(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              )}

              {mode === 'add' && (
                <>
                  <div className="field" style={{ marginTop: 18 }}>
                    <span className="field-label">Start date</span>
                    <input
                      type="date"
                      value={baseStr}
                      onChange={(e) => setBaseStr(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div className="split" style={{ gap: 12, marginTop: 14 }}>
                    <div className="field" style={{ flex: 1 }}>
                      <span className="field-label">Amount (use minus to subtract)</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div className="field" style={{ flex: 1 }}>
                      <span className="field-label">Unit</span>
                      <select
                        value={unit}
                        onChange={(e) => setUnit(e.target.value as DateUnit)}
                        style={{ width: '100%' }}
                      >
                        <option value="days">Days</option>
                        <option value="weeks">Weeks</option>
                        <option value="months">Months</option>
                        <option value="years">Years</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {mode === 'between' && betweenResult && (
                <div
                  data-testid="between-output"
                  style={{
                    marginTop: 22,
                    padding: '20px',
                    background: 'var(--paper-2)',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                  }}
                >
                  <div className="muted" style={{ fontSize: 13 }}>
                    {betweenResult.sign === -1 ? 'Before (negative)' : 'After'}
                  </div>
                  <div className="mono" style={{ fontSize: 30, fontWeight: 600, marginTop: 4 }}>
                    {Math.abs(betweenResult.totalDays).toLocaleString('en-US')} days
                  </div>
                  <div
                    className="stat-grid"
                    style={{ marginTop: 16, gridTemplateColumns: 'repeat(3, 1fr)' }}
                  >
                    <div className="stat">
                      <span className="stat-label">Weeks</span>
                      <span className="stat-value mono">{betweenResult.weeks}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">+ days</span>
                      <span className="stat-value mono">{betweenResult.days}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Weekdays</span>
                      <span className="stat-value mono">{Math.abs(betweenResult.weekdays)}</span>
                    </div>
                  </div>
                </div>
              )}

              {mode === 'add' && addResult && (
                <div
                  data-testid="add-output"
                  style={{
                    marginTop: 22,
                    padding: '20px',
                    background: 'var(--paper-2)',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                  }}
                >
                  <div className="muted" style={{ fontSize: 13 }}>Result</div>
                  <div className="mono" style={{ fontSize: 26, fontWeight: 600, marginTop: 4 }}>
                    {formatDateLong(addResult.result)}
                  </div>
                  <div className="muted" style={{ marginTop: 8, fontSize: 14 }}>
                    {Math.abs(addResult.totalDays).toLocaleString('en-US')} day
                    {Math.abs(addResult.totalDays) === 1 ? '' : 's'}{' '}
                    {addResult.totalDays >= 0 ? 'after' : 'before'} the start date
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
                  'Exact days, weeks and weekdays between dates',
                  'Add or subtract days, weeks, months or years',
                  'Leap-year and month-length aware',
                  'Negative amounts subtract',
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
                <LockIcon size={14} /> The dates you enter never leave this tab. There is no
                server to log them, no request to inspect — the Network panel stays empty.{' '}
                <Link to="/privacy">Read the privacy policy</Link>.
              </p>
            </div>

            <div className="panel">
              <span className="panel-title">Related</span>
              <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
                <li>
                  <Link to="/guides/date-calculator-without-upload">
                    Guide: date math without a server
                  </Link>
                </li>
                <li>
                  <Link to="/tools/age-calculator">Age calculator</Link>
                </li>
                <li>
                  <Link to="/tools/timestamp-converter">Unix timestamp converter</Link>
                </li>
                <li>
                  <Link to="/tools/percentage-calculator">Percentage calculator</Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container-narrow prose">
          <h2>Days between is a subtraction, not a guess</h2>
          <p>
            The number of days between two dates is the millisecond difference divided by the
            number of milliseconds in a day — 86,400,000. The tricky part is making sure the
            dates are compared at the same time of day, which the calculator does by
            normalising both to local midnight before subtracting. Without that, a span that
            crosses a daylight-saving boundary could come out an hour short or long, and the
            day count would be off by one. Normalising to midnight removes the time component
            entirely, so the answer depends only on the calendar dates.
          </p>

          <h2>Why a month is not 30 days</h2>
          <p>
            Adding a month to a date sounds simple, but it is not the same as adding 30 days.
            January has 31 days, February has 28 or 29, and the rest vary between 30 and 31.
            The convention the calculator uses is to move to the same day of the target month,
            and if that day does not exist — January 31 plus one month, for instance — clamp to
            the last day of that month. So January 31 plus one month becomes February 28 (or 29
            in a leap year), not March 3. This matches how people actually think about monthly
            anniversaries and how most date libraries behave.
          </p>

          <h2>Leap years and the century rule</h2>
          <p>
            A year is a leap year if it is divisible by 4, with one exception: century years
            must also be divisible by 400. So 2000 was a leap year (divisible by 400) but 1900
            was not (divisible by 100 but not 400), and 2100 will not be either. The
            calculator relies on the browser's built-in Date object, which implements this
            rule correctly, so February 29 exists only in actual leap years and all date math
            accounts for it.
          </p>

          <h2>Weekdays inside the interval</h2>
          <p>
            The weekday count is the number of Monday-to-Friday days strictly between the two
            dates — not counting the start or end date itself. This matches the common question
            "how many working days are between these two dates?" and avoids double-counting the
            endpoints. If you need to include one or both endpoints, add the appropriate number
            to the result depending on whether those days fall on weekdays.
          </p>

          <h2>Why dates should stay local</h2>
          <p>
            A date seems harmless, but two dates can reveal a lot: a project deadline, a
            contract end, a travel itinerary, a medical appointment. Server-side date
            calculators get to log every pair of dates entered into them, and the combination
            can be more revealing than either date alone. The local alternative needs none of
            that: date math is a few arithmetic operations on milliseconds, and the whole
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
