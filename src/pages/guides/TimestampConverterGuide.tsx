import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

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

export function TimestampConverterGuide() {
  useSeo({
    ...routeMeta('/guides/timestamp-converter-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Developer"
      title="Convert Unix timestamps without sending them anywhere"
      lede="A timestamp is just an integer counting seconds since 1970 — and yet most online converters treat every query as data to log. Here is what the epoch actually counts, why seconds and milliseconds both appear, how the leap-second-free clock stays simple, and how to convert in both directions on your own machine."
      updated="26 October 2026"
      toolTo="/tools/timestamp-converter"
      toolLabel="Convert timestamps in your browser"
    >
      <h2>An integer older than the web</h2>
      <p>
        The Unix epoch — 00:00:00 UTC on 1 January 1970 — predates the internet by several years
        and the web by two decades. It was chosen as a convenient reference point for the first
        Unix systems, and it stuck. A Unix timestamp is simply the number of seconds elapsed
        since that instant (milliseconds in some ecosystems). It is not a formatted date, not a
        calendar entry, not a string with a timezone — it is an integer, and that is the source
        of its power. Integers are the one data type every language, database and operating
        system stores and compares identically, which makes a timestamp the most portable
        representation of an instant we have.
      </p>
      <p>
        1700000000, for example, means "the instant 1.7 billion seconds after the epoch". Work
        the math and that is 14 November 2023 at 22:13:20 UTC — but the number itself says
        nothing about timezones, calendars or daylight saving. The instant is fixed; the
        formatting is a choice made later, when a human needs to read it.
      </p>

      <h2>Seconds versus milliseconds</h2>
      <p>
        The single most common confusion with timestamps is the unit. A 10-digit number counts
        seconds since the epoch; a 13-digit number counts milliseconds. The epoch is the same
        instant either way; only the resolution differs. JavaScript and Java count milliseconds
        internally, so <code>Date.now()</code> returns 13 digits. The Unix shell, PostgreSQL and
        most HTTP APIs count seconds, giving 10 digits. A 10-digit timestamp copied into a
        millisecond field gets interpreted as a moment in early 1970, and a 13-digit one pasted
        into a seconds field lands in the year 54000 — both silent, both wrong.
      </p>
      <p>
        The safe heuristic when the unit is unstated is length: 12 or fewer digits are seconds,
        13 or more are milliseconds. It is not a guarantee, but it is right far more often than
        not. The converter on this site applies that guess automatically and lets you force
        seconds or milliseconds explicitly when you know better.
      </p>

      <h2>The leap second the epoch pretends does not exist</h2>
      <p>
        Real UTC occasionally inserts a leap second to keep itself aligned with the Earth's
        slowing rotation. The Unix clock deliberately ignores these. By the epoch's definition,
        every day is exactly 86,400 seconds — no 86,401-second days, ever. When a leap second is
        inserted, the operating system handles it by either repeating a second or smoothly
        slewing the clock, but the timestamp sequence stays gap-free.
      </p>
      <p>
        The consequence is honesty about the trade-off. Unix time drifts from true solar time by
        the accumulated leap seconds — about 27 seconds as of 2026. In exchange, timestamp
        arithmetic is trivial: subtract one from another and you have elapsed seconds, with no
        calendar table and no exception list. That simplicity is why the epoch has survived
        fifty years and counting; the 27-second error is negligible for almost everything except
        precision astronomy, and precision astronomers use their own clocks anyway.
      </p>

      <h2>One instant, many clock readings</h2>
      <p>
        UTC is what the timestamp measures. Your local time is the same instant shifted by your
        timezone offset, plus an extra hour if daylight saving is in effect. A meeting scheduled
        at 14:00 UTC is 22:00 in Singapore, 09:00 in New York and 07:00 in Los Angeles — one
        timestamp, four clock readings, zero ambiguity about when the meeting actually starts.
        Showing UTC and the visitor's local time side by side is the honest way to present a
        date, because the timestamp is zone-free and the clock reading is not. A date string
        without a zone is an incomplete fact; a timestamp with both readings is the whole story.
      </p>

      <h2>Why this converts locally</h2>
      <p>
        There is no server work in timestamp conversion. Parsing a date and formatting a date
        are pure arithmetic on an integer — the kind of operation your browser's JavaScript
        engine is literally built around. An online converter adds a round trip, a log entry
        recording which instants you are looking at, and an ad impression to a task your
        machine completes in microseconds. The converter on this site runs entirely in the tab
        you are looking at: load the page, pull the network cable, and it still converts any
        timestamp or date without noticing anything changed.
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
    </Article>
  )
}
