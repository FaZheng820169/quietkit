import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, LockIcon } from '../components/Icons'
import {
  currentEpochSeconds,
  formatLocal,
  formatRfc2822,
  formatRelative,
  formatUtc,
  parseDate,
  parseTimestamp,
  toTimestamp,
  type TimeUnit,
} from '../lib/timestamp'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'What is a Unix timestamp?',
    a: 'It is the number of seconds (or milliseconds) that have passed since midnight UTC on 1 January 1970, not counting leap seconds. Every modern system keeps time this way internally, so a timestamp is the most portable representation of an instant there is. 1700000000 means "the instant 1,700,000,000 seconds after the epoch", which was 14 November 2023 at 22:13:20 UTC.',
  },
  {
    q: 'Why do some timestamps have 10 digits and others 13?',
    a: 'The unit. A 10-digit timestamp counts seconds since the epoch; a 13-digit one counts milliseconds. JavaScript and Java use milliseconds internally, so their native timestamps are 13 digits. Unix shells, most databases and many APIs use seconds, giving 10 digits. This converter auto-detects: 12 or fewer digits are seconds, 13 or more are milliseconds. You can also force one or the other explicitly.',
  },
  {
    q: 'Does the converter account for leap seconds?',
    a: 'No — and neither does the Unix epoch itself. The Unix clock deliberately ignores leap seconds; every day is exactly 86,400 seconds by definition. When a real leap second is inserted, the system clock either repeats a second or slews to stay in sync, but the timestamp never has a "60th second". That makes arithmetic simple and portable, and it is why two timestamps subtract to give the elapsed seconds directly.',
  },
  {
    q: 'What is the difference between UTC and my local time?',
    a: 'UTC is the universal reference; your local time is UTC plus your timezone offset (including daylight saving if active). A single instant is one timestamp, but it shows as two different clock readings depending on the zone. This page shows the UTC reading and your local reading side by side so you can see both at once. The timestamp itself is zone-free, which is why it travels so well.',
  },
  {
    q: 'Can I convert a date back into a timestamp?',
    a: 'Yes — switch to the Date → Timestamp direction, type a date in YYYY-MM-DD or YYYY-MM-DD HH:mm:ss form, and the page returns the timestamp in seconds and milliseconds. The date is parsed in your local zone unless you append a Z or an explicit offset, which matches what most people mean when they write a date without a zone. ISO 8601 strings with a zone are also accepted.',
  },
]

const UNITS: { kind: TimeUnit; label: string }[] = [
  { kind: 'auto', label: 'Auto' },
  { kind: 'seconds', label: 'Seconds' },
  { kind: 'milliseconds', label: 'ms' },
]

type Direction = 'ts2date' | 'date2ts'

function ResultRow({
  label,
  value,
  testid,
  copied,
  onCopy,
}: {
  label: string
  value: string
  testid: string
  copied: boolean
  onCopy: (testid: string, value: string) => void
}) {
  return (
    <div className="row" style={{ justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="small muted">{label}</div>
        <div data-testid={testid} className="mono" style={{ fontSize: 14, wordBreak: 'break-all' }}>
          {value}
        </div>
      </div>
      <button
        className="btn"
        style={{ padding: '4px 10px', fontSize: 12, flexShrink: 0 }}
        onClick={() => onCopy(testid, value)}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

export function TimestampConverter() {
  useSeo({
    ...routeMeta('/tools/timestamp-converter'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit Unix Timestamp Converter',
          'Convert a Unix epoch timestamp (seconds or milliseconds) to a human date in UTC and your local zone, or type a date back into a timestamp. ISO 8601 and RFC 2822 included. Runs locally — nothing is uploaded.',
          '/tools/timestamp-converter',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [direction, setDirection] = useState<Direction>('ts2date')
  const [unit, setUnit] = useState<TimeUnit>('auto')
  const [ts, setTs] = useState(String(currentEpochSeconds()))
  const [dateStr, setDateStr] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  // Keep the timestamp field ticking while on the landing view so it feels live.
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const now = currentEpochSeconds()

  const dateResult = useMemo(() => {
    try {
      return { date: parseTimestamp(ts, unit), error: '' }
    } catch (e) {
      return { date: null, error: (e as Error).message }
    }
  }, [ts, unit])

  const tsResult = useMemo(() => {
    if (dateStr.trim() === '') return { sec: '', ms: '', error: '' }
    try {
      const d = parseDate(dateStr)
      return {
        sec: String(toTimestamp(d, 'seconds')),
        ms: String(toTimestamp(d, 'milliseconds')),
        error: '',
      }
    } catch (e) {
      return { sec: '', ms: '', error: (e as Error).message }
    }
  }, [dateStr])

  const copy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  const useNow = () => {
    setTs(String(now))
    const d = new Date()
    const p = (n: number) => String(n).padStart(2, '0')
    setDateStr(`${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`)
  }

  const rowCopied = (id: string) => copied === id

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Developer</span>
          <h1>Unix timestamps converted without leaving the tab</h1>
          <p>
            Epoch to human date, or the other way around — seconds or milliseconds, UTC and your
            local zone, ISO 8601 and RFC 2822. Pure date arithmetic, nothing is sent.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container workspace">
          <div>
            <div className="panel">
              <div className="field">
                <span className="field-label">Direction</span>
                <div className="segmented">
                  <button aria-pressed={direction === 'ts2date'} onClick={() => setDirection('ts2date')}>
                    Timestamp → Date
                  </button>
                  <button aria-pressed={direction === 'date2ts'} onClick={() => setDirection('date2ts')}>
                    Date → Timestamp
                  </button>
                </div>
              </div>

              {direction === 'ts2date' ? (
                <div className="field" style={{ marginTop: 16 }}>
                  <div className="split" style={{ gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <span className="field-label">Unix timestamp</span>
                      <input
                        type="text"
                        value={ts}
                        onChange={(e) => setTs(e.target.value)}
                        style={{ width: '100%' }}
                        aria-label="Unix timestamp"
                      />
                    </div>
                    <div>
                      <span className="field-label">Unit</span>
                      <div className="segmented">
                        {UNITS.map((u) => (
                          <button
                            key={u.kind}
                            aria-pressed={unit === u.kind}
                            onClick={() => setUnit(u.kind)}
                          >
                            {u.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn"
                    style={{ marginTop: 10, fontSize: 13, padding: '4px 12px' }}
                    onClick={useNow}
                  >
                    Use now ({now})
                  </button>

                  {dateResult.error ? (
                    <div className="notice notice-error" style={{ marginTop: 14 }}>
                      {dateResult.error}
                    </div>
                  ) : dateResult.date ? (
                    <div className="stack-sm" style={{ marginTop: 16 }}>
                      <ResultRow label="UTC" value={formatUtc(dateResult.date)} testid="ts-utc" copied={rowCopied('ts-utc')} onCopy={copy} />
                      <ResultRow label="Local" value={formatLocal(dateResult.date)} testid="ts-local" copied={rowCopied('ts-local')} onCopy={copy} />
                      <ResultRow label="ISO 8601" value={formatUtc(dateResult.date)} testid="ts-iso" copied={rowCopied('ts-iso')} onCopy={copy} />
                      <ResultRow label="RFC 2822" value={formatRfc2822(dateResult.date)} testid="ts-rfc" copied={rowCopied('ts-rfc')} onCopy={copy} />
                      <ResultRow label="Relative" value={formatRelative(dateResult.date)} testid="ts-relative" copied={rowCopied('ts-relative')} onCopy={copy} />
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="field" style={{ marginTop: 16 }}>
                  <span className="field-label">Date (YYYY-MM-DD HH:mm:ss, or ISO 8601)</span>
                  <input
                    type="text"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    placeholder="2023-11-14 22:13:20"
                    style={{ width: '100%' }}
                    aria-label="Date to convert"
                  />
                  <button
                    className="btn"
                    style={{ marginTop: 10, fontSize: 13, padding: '4px 12px' }}
                    onClick={useNow}
                  >
                    Use now
                  </button>

                  {tsResult.error ? (
                    <div className="notice notice-error" style={{ marginTop: 14 }}>
                      {tsResult.error}
                    </div>
                  ) : tsResult.sec ? (
                    <div className="stack-sm" style={{ marginTop: 16 }}>
                      <ResultRow label="Seconds" value={tsResult.sec} testid="dt-seconds" copied={rowCopied('dt-seconds')} onCopy={copy} />
                      <ResultRow label="Milliseconds" value={tsResult.ms} testid="dt-ms" copied={rowCopied('dt-ms')} onCopy={copy} />
                    </div>
                  ) : null}
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
                  'Timestamp ↔ date, both directions',
                  'Auto-detect seconds vs milliseconds',
                  'UTC, local, ISO 8601 and RFC 2822',
                  'Pre-1970 (negative) timestamps',
                  'One-click copy of every result',
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
                <LockIcon size={14} /> A timestamp is an integer, and a date is a string — there is
                nothing to look up, so there is nothing to send. The conversion is date arithmetic
                in this tab; the Network panel stays empty.{' '}
                <Link to="/privacy">Read the privacy policy</Link>.
              </p>
            </div>

            <div className="panel">
              <span className="panel-title">Related</span>
              <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
                <li>
                  <Link to="/guides/timestamp-converter-without-upload">
                    Guide: timestamps without a server
                  </Link>
                </li>
                <li>
                  <Link to="/tools/uuid-generator">UUID generator</Link>
                </li>
                <li>
                  <Link to="/tools/password-generator">Password generator</Link>
                </li>
                <li>
                  <Link to="/tools/json-formatter">JSON formatter</Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container-narrow prose">
          <h2>An integer that every system agrees on</h2>
          <p>
            A Unix timestamp is just a count of seconds since 1970-01-01 UTC. It is not a date
            string, not a calendar entry, not a formatted field — it is an integer, and integers
            are the one data type every language, database and operating system handles
            identically. That portability is why timestamps show up everywhere: in JSON payloads,
            in log files, in cookie expiry, in database created_at columns. The instant itself has
            no timezone; only the human reading of it does.
          </p>

          <h2>Seconds and milliseconds: the 10- vs 13-digit question</h2>
          <p>
            The epoch is the same instant either way; the difference is the unit. JavaScript and
            Java count milliseconds, so <code>Date.now()</code> returns a 13-digit number. The
            Unix shell, PostgreSQL and most APIs count seconds, giving 10 digits. When you paste
            a timestamp without saying which, the safe heuristic is length: 12 or fewer digits are
            seconds, 13 or more are milliseconds. This converter applies that guess in Auto mode
            and lets you override it explicitly when you know better.
          </p>

          <h2>Why there is no leap second in the epoch</h2>
          <p>
            Real UTC occasionally inserts a leap second to stay aligned with the Earth's
            rotation. The Unix clock deliberately pretends this never happens: every day is
            exactly 86,400 seconds, no more, no less. The cost is that timestamp arithmetic is
            always off by the accumulated leap seconds compared to true solar time — currently
            about 27 seconds. The benefit is enormous: two timestamps subtract to give the
            elapsed seconds directly, with no calendar lookup and no exception table. That
            trade-off is why the epoch has survived fifty years.
          </p>

          <h2>UTC is the reference; local is the view</h2>
          <p>
            UTC is what the timestamp actually measures. Your local time is the same instant
            shifted by your timezone offset, plus daylight saving if it is active. A meeting at
            14:00 UTC is 22:00 in Singapore, 09:00 in New York and 07:00 in Los Angeles — one
            timestamp, four clock readings. Showing UTC and local side by side is the honest way
            to present a date, because the timestamp is zone-free and the clock reading is not.
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
