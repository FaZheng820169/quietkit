import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

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

export function TimeZoneConverterGuide() {
  useSeo({
    ...routeMeta('/guides/time-zone-converter-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Everyday"
      title="Time zones, converted without a server"
      lede="Why a clock time means nothing without a zone, how UTC makes conversion possible, and how daylight saving quietly changes the gap between two cities."
      updated="26 October 2026"
      toolTo="/tools/time-zone-converter"
      toolLabel="Open the time zone converter"
    >
      <h2>A clock time only means something with a zone</h2>
      <p>
        When a message says the call starts at 9:00, it is missing the one detail that decides
        who has to set an alarm. Nine o'clock happens somewhere in the world every hour; a clock
        face alone cannot tell you which of those hours is meant. A time zone is the missing
        half of the reading — the rule that turns a local wall-clock time into a single moment
        that everyone can agree on.
      </p>
      <p>
        The rule has two parts. First, every zone is described by an offset from UTC, such as
        UTC−05:00. Second, the offset can change twice a year if the place observes daylight
        saving. Converting a time therefore means doing two lookups, not one: which offset did
        the first zone use on that date, and which offset did the second zone use at the very
        same moment.
      </p>

      <h2>UTC is the meeting point</h2>
      <p>
        UTC, Coordinated Universal Time, is the reference the world keeps its clocks against. It
        is not a city's local time and it never shifts for summer; it simply runs, kept within a
        second of atomic clocks. Every zone is written as a signed offset from it, so New York in
        winter is UTC−05:00, London in summer is UTC+01:00, and India all year is UTC+05:30.
      </p>
      <p>
        Because UTC never moves, it makes an excellent halfway house. To convert from one zone
        to another, take the reading in the first zone, remove its offset to reach UTC, then add
        the offset of the second zone at that same instant. Two additions, one subtraction, and
        the answer is a local time in the second zone. This is exactly what the converter does
        on your device, with no round trip to a server.
      </p>

      <h2>Daylight saving moves the gap</h2>
      <p>
        Most people carry a single number in their head for a city they work with — "London is
        five hours ahead" — and that number is wrong for part of the year. New York and London
        sit five hours apart in January and four hours apart in July. The awkward part is the
        weeks when the two countries disagree: the United States moves to summer time in early
        March, Europe waits until the end of March, and for those weeks the gap is four hours
        while both calendars still say it should be five.
      </p>
      <p>
        The same disagreement happens in reverse in autumn, and the southern hemisphere runs on
        an entirely different calendar: Sydney is eleven hours ahead of UTC in January and ten
        in July, because its summer is the northern winter. A converter that stores a fixed
        number of hours will be wrong for weeks every year. One that recalculates the offset for
        the date in question is right on every date, including the transition days themselves.
      </p>
      <p>
        Transition days deserve their own warning. When clocks spring forward, an hour vanishes:
        02:30 simply does not exist in a zone that jumps from 02:00 to 03:00. When clocks fall
        back, an hour repeats and 01:30 happens twice. The converter resolves the missing hour by
        pushing it forward, as a clock on the wall would, and picks the earlier of the two
        repeated readings so the answer is at least predictable.
      </p>

      <h2>Half-hour and quarter-hour zones</h2>
      <p>
        Not every zone is a whole number of hours from UTC. India is UTC+05:30 all year,
        Newfoundland is UTC−03:30, Nepal is UTC+05:45, and a handful of Pacific islands sit at
        UTC+12:45 or UTC+13:45. These offsets are not rounding errors to be smoothed away; they
        are the legal time of the place. Displaying "UTC+5.5" hides the point, which is why
        numeric offsets are written in hours and minutes.
      </p>

      <h2>Planning across the date line</h2>
      <p>
        The date line is where a conversion stops being only about hours. Auckland at UTC+13 can
        be a full day ahead of Los Angeles at UTC−08, so the same moment has two different
        calendar dates. A meeting that is "Tuesday afternoon" in California is already Wednesday
        morning in New Zealand. This is why the converter shows a day marker next to every time
        in the cross-zone strip: a result that is correct to the minute can still be scheduled on
        the wrong day.
      </p>
      <p>
        The practical rule is to pick the meeting in UTC, or in the zone of the person who has
        the least flexibility, and then look at everyone else. If one participant lands outside
        reasonable waking hours, the honest solution is a second meeting rather than a single
        call at three in the morning.
      </p>

      <h2>Why the conversion should stay local</h2>
      <p>
        A time-zone conversion is a pure calculation: given two zone identifiers and a date, the
        answer is fixed. There is no reason for it to leave the device, and every reason for it
        not to. A calendar, a call with a client, a deadline in another country — the times
        people convert are often the times they would rather not publish. A server-side converter
        sees the zones, the dates and the pattern of who is talking to whom, and logs it whether
        or not anyone reads the log.
      </p>
      <p>
        The local version needs nothing beyond what the browser already holds. The IANA rules
        that decide offsets are the same rules the operating system uses to draw its own clock,
        and they are already on your machine. Load the converter once, disconnect the network,
        and it still returns the right answer, because the answer was always going to come from
        your own device.
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
