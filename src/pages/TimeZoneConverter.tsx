import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, LockIcon } from '../components/Icons'
import {
  ZONES,
  ZONE_REGIONS,
  convertWallTime,
  dateInputValue,
  localZone,
  nextDayLabel,
  offsetLabel,
  readZone,
  describeGap,
  type Conversion,
  type Zone,
} from '../lib/timezone'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'How do I convert a time from one time zone to another?',
    a: 'Pick the zone you know the time in, enter its date and clock time, and the converter reads the same instant in the zone you are converting to. It works through UTC: the wall-clock reading in the first zone becomes an absolute instant, and that instant is then rendered with the offset rules of the second zone. Because the browser carries the full IANA time-zone database, the result follows the real daylight-saving dates of both places rather than a fixed hour difference.',
  },
  {
    q: 'Why is the difference sometimes five hours and sometimes four?',
    a: 'Because daylight saving does not start on the same date everywhere, and some places do not observe it at all. New York and London are five hours apart in winter, when New York is on EST and London is on GMT, but only four hours apart for the two weeks in March when the United States has already changed and Europe has not. Any converter that stores a single fixed difference will be wrong during those weeks; this one re-reads the offset for the date you entered.',
  },
  {
    q: 'What is UTC, and why is it the reference point?',
    a: 'UTC stands for Coordinated Universal Time. It is the time standard the world agrees on, kept within a second of atomic clocks and never shifted for daylight saving. Every time zone is written as a signed offset from UTC, such as UTC−05:00 for New York in winter or UTC+05:30 for India all year. UTC replaces GMT as the technical reference, although both give the same clock time.',
  },
  {
    q: 'How do I find a time that works for a meeting across zones?',
    a: 'Enter the time that suits you, then read the strip below the result: it shows the same instant in eight zones at once, with each row marked as the same day, the next day or the previous day. Move the date or hour until every row lands inside working hours. Zones on the other side of the date line change day as well as hour, which is why the day marker matters as much as the clock.',
  },
  {
    q: 'Does the converter store the times I enter?',
    a: 'No. The zones, date and time live only in the memory of this browser tab while the page is open. There is no server, no account and no analytics event tied to your input. The time-zone rules themselves come from the browser, so the conversion works with the network disconnected. Close the tab and the input is gone — the privacy policy explains in detail.',
  },
]

const STRIP = [
  'America/Los_Angeles',
  'America/New_York',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
]

function dayGap(fromDate: string, toDateValue: string): number {
  const a = Date.parse(`${fromDate}T00:00:00Z`)
  const b = Date.parse(`${toDateValue}T00:00:00Z`)
  if (Number.isNaN(a) || Number.isNaN(b)) return 0
  return Math.round((b - a) / 86400000)
}

function optionsFor(zones: Zone[], local: string) {
  return zones.map((zone) => ({
    ...zone,
    label: zone.id === local ? `${zone.label} (this device)` : zone.label,
  }))
}

export function TimeZoneConverter() {
  useSeo({
    ...routeMeta('/tools/time-zone-converter'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit Time Zone Converter',
          'Convert a date and time between any two time zones, with daylight saving handled correctly. See the same instant in eight cities at once. Runs locally — nothing is uploaded.',
          '/tools/time-zone-converter',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const local = localZone()
  const zones: Zone[] = ZONES.some((zone) => zone.id === local)
    ? ZONES
    : [{ id: local, label: local.replace(/_/g, ' '), region: 'UTC' }, ...ZONES]
  const options = optionsFor(zones, local)

  const [fromZone, setFromZone] = useState(local)
  const [toZone, setToZone] = useState(local === 'Europe/London' ? 'America/New_York' : 'Europe/London')

  const [date, setDate] = useState(() => dateInputValue(new Date(), local))
  const [time, setTime] = useState(() => readZone(new Date(), local).time)

  const conversion: Conversion | null = convertWallTime(fromZone, toZone, date, time)

  function swap() {
    if (conversion) {
      setDate(dateInputValue(conversion.instant, toZone))
      setTime(conversion.to.time)
    }
    setFromZone(toZone)
    setToZone(fromZone)
  }

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Everyday</span>
          <h1>Two zones, one instant.</h1>
          <p>
            Convert a date and time from any time zone to any other, with daylight saving handled
            by the rules your browser already carries. No account, no upload — the conversion
            happens in this tab.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container workspace">
          <div>
            <div className="panel">
              <div className="split" style={{ gap: 16 }}>
                <div className="field">
                  <span className="field-label">From zone</span>
                  <select
                    data-testid="tz-from"
                    value={fromZone}
                    onChange={(event) => setFromZone(event.target.value)}
                    style={{ width: '100%' }}
                  >
                    {ZONE_REGIONS.map((region) => (
                      <optgroup key={region} label={region === 'UTC' ? 'UTC' : region}>
                        {options
                          .filter((zone) => zone.region === region)
                          .map((zone) => (
                            <option key={zone.id} value={zone.id}>
                              {zone.label}
                            </option>
                          ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <span className="field-label">To zone</span>
                  <select
                    data-testid="tz-to"
                    value={toZone}
                    onChange={(event) => setToZone(event.target.value)}
                    style={{ width: '100%' }}
                  >
                    {ZONE_REGIONS.map((region) => (
                      <optgroup key={region} label={region === 'UTC' ? 'UTC' : region}>
                        {options
                          .filter((zone) => zone.region === region)
                          .map((zone) => (
                            <option key={zone.id} value={zone.id}>
                              {zone.label}
                            </option>
                          ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              <div className="split" style={{ gap: 16, marginTop: 16 }}>
                <div className="field">
                  <span className="field-label">Date in {fromZone.replace(/_/g, ' ')}</span>
                  <input
                    type="date"
                    data-testid="tz-date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="field">
                  <span className="field-label">Time in that zone</span>
                  <input
                    type="time"
                    data-testid="tz-time"
                    value={time}
                    onChange={(event) => setTime(event.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <button type="button" className="btn btn-ghost" data-testid="tz-swap" onClick={swap}>
                  ⇄ Swap zones
                </button>
              </div>

              <div
                data-testid="tz-output"
                style={{
                  marginTop: 22,
                  padding: '20px',
                  background: 'var(--paper-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                }}
              >
                {conversion ? (
                  <>
                    <div className="muted" style={{ fontSize: 13 }}>
                      {conversion.to.weekday}, {conversion.to.date} · {toZone.replace(/_/g, ' ')}
                    </div>
                    <div className="mono" style={{ fontSize: 40, fontWeight: 600, marginTop: 4 }}>
                      <span data-testid="tz-result-time">{conversion.to.time}</span>{' '}
                      <span style={{ fontSize: 18, fontWeight: 500 }} data-testid="tz-result-abbr">
                        {conversion.to.abbreviation}
                      </span>
                    </div>
                    <div className="muted" style={{ marginTop: 8, fontSize: 14 }}>
                      <span data-testid="tz-result-gap">
                        {describeGap(conversion.from.offsetMinutes, conversion.to.offsetMinutes)}
                      </span>{' '}
                      · {offsetLabel(conversion.to.offsetMinutes)} ·{' '}
                      <span data-testid="tz-result-day">{nextDayLabel(conversion.dayShift)}</span>
                    </div>
                    <div className="muted" style={{ marginTop: 4, fontSize: 13 }}>
                      {conversion.from.time} on {date} in {fromZone.replace(/_/g, ' ')} is the same
                      moment as {conversion.to.time} on {conversion.to.date} in{' '}
                      {toZone.replace(/_/g, ' ')}.
                    </div>
                  </>
                ) : (
                  <div style={{ color: 'var(--muted)' }}>
                    Enter a valid date and time to see the conversion.
                  </div>
                )}
              </div>
            </div>

            <div className="panel" style={{ marginTop: 16 }}>
              <span className="panel-title">Same moment elsewhere</span>
              <div data-testid="tz-strip" style={{ display: 'grid', gap: 8 }}>
                {conversion
                  ? STRIP.map((zoneId) => {
                      const reading = readZone(conversion.instant, zoneId)
                      const days = dayGap(date, dateInputValue(conversion.instant, zoneId))
                      return (
                        <div
                          key={zoneId}
                          data-testid={`tz-strip-${zoneId}`}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 12,
                            fontSize: 14,
                            padding: '6px 0',
                            borderBottom: '1px solid var(--line)',
                          }}
                        >
                          <span>{zoneId.replace(/_/g, ' ')}</span>
                          <span className="mono" style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {reading.time}{' '}
                            <span className="muted" style={{ fontSize: 12 }}>
                              {nextDayLabel(days)}
                            </span>
                          </span>
                        </div>
                      )
                    })
                  : null}
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
                  'Any two of 25 cities plus UTC',
                  'Daylight saving handled per date',
                  'Day shift shown beside every result',
                  'Same instant across nine zones',
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
                <LockIcon size={14} /> Your meeting time never leaves this tab. There is no server
                to log it and no request to inspect — the Network panel stays empty.{' '}
                <Link to="/privacy">Read the privacy policy</Link>.
              </p>
            </div>

            <div className="panel">
              <span className="panel-title">Related</span>
              <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
                <li>
                  <Link to="/guides/time-zone-converter-without-upload">
                    Guide: time zones without a server
                  </Link>
                </li>
                <li>
                  <Link to="/tools/timestamp-converter">Unix timestamp converter</Link>
                </li>
                <li>
                  <Link to="/tools/date-calculator">Date calculator</Link>
                </li>
                <li>
                  <Link to="/tools/age-calculator">Age calculator</Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container-narrow prose">
          <h2>How one zone becomes another</h2>
          <p>
            A clock on the wall never says where in the world it is, so a wall-clock reading only
            becomes a real moment when you attach a zone to it. The converter takes the date and
            time you typed, finds the UTC offset that zone used on that date, subtracts it, and
            lands on an absolute instant. That instant is then formatted with the offset the
            second zone used at the same instant. Nothing in between is stored: UTC is used as
            the common language and the two offsets do the translation.
          </p>
          <p>
            The offsets are not a table of numbers shipped with the page. They come from the
            IANA time-zone database that the browser already holds for its own clock, which means
            daylight-saving rules, half-hour offsets such as India's UTC+05:30 and quarter-hour
            offsets are all read from the same source the operating system uses.
          </p>

          <h2>Why the gap changes during the year</h2>
          <p>
            Most pairs of zones differ by a fixed number of hours only part of the year. New York
            and London are five hours apart in January, four hours apart in July, and four hours
            apart for a fortnight in March while the United States has moved to summer time and
            Europe has not. Southern-hemisphere zones move in the opposite direction: Sydney is
            eleven hours ahead of UTC in January and ten in July. A converter that remembers a
            single difference will be wrong for weeks at a time, so this one recalculates the
            offset for each date you enter.
          </p>

          <h2>UTC, GMT and the abbreviations you see</h2>
          <p>
            UTC is the modern reference; GMT is its older, astronomical predecessor and gives the
            same time. Every zone is described as an offset from UTC, and the three-letter
            abbreviation beside the result is what that zone calls itself that day — EST and EDT
            for New York, GMT and BST for London. Abbreviations are ambiguous in a way offsets are
            not, with several zones reusing the same three letters, which is why the numeric
            offset is shown next to them.
          </p>

          <h2>Finding a time that works for everyone</h2>
          <p>
            The strip below the result lists the same instant in nine zones at once and marks
            whether it falls on the same day, the next day or the previous day. Move the hour
            until each row sits inside its own working day, and watch the day marker for the zones
            far from you: Tokyo and Sydney are not only hours ahead but often a date ahead as
            well. If no single hour works, the honest answer is usually two meetings rather than
            one that lands at 03:00 for somebody.
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
