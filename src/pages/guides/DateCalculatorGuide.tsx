import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

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

export function DateCalculatorGuide() {
  useSeo({
    ...routeMeta('/guides/date-calculator-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Everyday"
      title="Calculate dates without a server"
      lede="How many days are really between two dates, why adding a month is not 30 days, how leap years and month lengths change the math, and why a date calculation should never leave your device."
      updated="26 October 2026"
      toolTo="/tools/date-calculator"
      toolLabel="Open the date calculator"
    >
      <h2>Days between is a subtraction, not a guess</h2>
      <p>
        The number of days between two dates is the millisecond difference divided by the
        number of milliseconds in a day — 86,400,000. The tricky part is making sure the
        dates are compared at the same time of day, which the calculator does by normalising
        both to local midnight before subtracting. Without that, a span that crosses a
        daylight-saving boundary could come out an hour short or long, and the day count would
        be off by one. Normalising to midnight removes the time component entirely, so the
        answer depends only on the calendar dates.
      </p>
      <p>
        The result is signed: a positive number means the second date is after the first, a
        negative number means it is before, and zero means they are the same day. Taking the
        absolute value gives the raw distance, while the sign tells you the direction. The
        calculator also breaks the total into whole weeks and remaining days, which is useful
        for deadlines and project planning where a span of 37 days reads more naturally as
        five weeks and two days.
      </p>

      <h2>Why a month is not 30 days</h2>
      <p>
        Adding a month to a date sounds simple, but it is not the same as adding 30 days.
        January has 31 days, February has 28 or 29, and the rest vary between 30 and 31. The
        convention the calculator uses is to move to the same day of the target month, and if
        that day does not exist — January 31 plus one month, for instance — clamp to the last
        day of that month. So January 31 plus one month becomes February 28 (or 29 in a leap
        year), not March 3. This matches how people actually think about monthly anniversaries
        and how most date libraries behave.
      </p>
      <p>
        The same clamping rule applies when adding years. A birthday on February 29 plus one
        year in a non-leap year becomes February 28, not March 1, because there is no February
        29 that year. Subtracting a month from March 31 gives February 28 or 29 rather than a
        nonexistent February 31. The behaviour is consistent in both directions, which is what
        makes it predictable rather than surprising.
      </p>

      <h2>Leap years and the century rule</h2>
      <p>
        A year is a leap year if it is divisible by 4, with one exception: century years must
        also be divisible by 400. So 2000 was a leap year (divisible by 400) but 1900 was not
        (divisible by 100 but not 400), and 2100 will not be either. The calculator relies on
        the browser built-in Date object, which implements this rule correctly, so February 29
        exists only in actual leap years and all date math accounts for it.
      </p>
      <p>
        The rule matters most for spans that cross a century boundary. A 100-year span starting
        on March 1 2000 includes 25 leap days (2000, 2004, ... 2096), but the same span
        starting on March 1 1900 includes only 24 because 1900 is not a leap year. Getting the
        century rule wrong would make every long-span calculation drift by a day, which is why
        delegating to the browser's Date object — rather than hand-rolling the leap-year check
        — is the safe choice.
      </p>

      <h2>Weekdays inside the interval</h2>
      <p>
        The weekday count is the number of Monday-to-Friday days strictly between the two dates
        — not counting the start or end date itself. This matches the common question "how many
        working days are between these two dates?" and avoids double-counting the endpoints. If
        you need to include one or both endpoints, add the appropriate number to the result
        depending on whether those days fall on weekdays.
      </p>
      <p>
        The count is also signed to match the overall direction of the span, so the weekday
        number carries the same sign as the total days. This keeps the two figures consistent
        when you are working with past dates as well as future ones, and it means the same
        formula applies regardless of which date comes first.
      </p>

      <h2>Why dates should stay local</h2>
      <p>
        A date seems harmless, but two dates can reveal a lot: a project deadline, a contract
        end, a travel itinerary, a medical appointment. Server-side date calculators get to log
        every pair of dates entered into them, and the combination can be more revealing than
        either date alone. The local alternative needs none of that: date math is a few
        arithmetic operations on milliseconds, and the whole calculation finishes inside the
        tab without a single network request.
      </p>
      <p>
        Load the calculator once, switch off the Wi-Fi, and it still tells you how many days
        are between any two dates — because the answer was always going to come from your own
        machine. Nothing is sent, nothing is stored, and the Network panel stays empty the
        whole time. That is the point of a local tool: the work happens where the data already
        is, so the data never has to move.
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
