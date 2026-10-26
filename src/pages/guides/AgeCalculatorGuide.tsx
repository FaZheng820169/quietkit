import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

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

export function AgeCalculatorGuide() {
  useSeo({
    ...routeMeta('/guides/age-calculator-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Everyday"
      title="Calculate age without a server"
      lede="Age looks like a subtraction but is not. Here is why years and months need careful counting, how leap-day birthdays are handled, why the 31st maps to month-end in shorter months, and why a birth date should never leave your device."
      updated="26 October 2026"
      toolTo="/tools/age-calculator"
      toolLabel="Open the age calculator"
    >
      <h2>Age is not a simple subtraction</h2>
      <p>
        The first thing everyone tries is current year minus birth year, and that works only if
        the birthday has already happened this year. If it has not, the answer is off by one.
        The correct calculation has three steps, each depending on the one before it: count
        full years since the most recent birthday, then full months from that anniversary, then
        the remaining days. A change to any step ripples through the others, which is why
        naive implementations get the edge cases wrong.
      </p>
      <p>
        The tricky part is that "a month" is not a fixed length. January has 31 days, February
        has 28 or 29, and the rest vary between 30 and 31. Counting months therefore means
        counting calendar months, not 30-day blocks. A month from January 15 is February 15; a
        month from January 31 is the last day of February, because February 31 does not exist.
        The calculator counts calendar months and clamps the day to the last day of the month
        when the original day is out of range, which is the convention used by most official
        age calculations.
      </p>

      <h2>Leap-day birthdays</h2>
      <p>
        Someone born on February 29 has a birthday that exists only in leap years — roughly
        one year in four. In the other three years there is no February 29, so the birthday
        anniversary has to land somewhere. The legal convention varies by jurisdiction, but
        the most common default is February 28, which is what this calculator uses. In a leap
        year the anniversary is February 29 as expected; in non-leap years it is February 28.
        The age still advances by a year every 365 or 366 days regardless, so a leap-day baby
        turns 30 on the same schedule as anyone else — the labeled birthday just moves by a day
        in non-leap years.
      </p>
      <p>
        The next-birthday countdown follows the same rule. In a non-leap year it counts down
        to February 28; in a leap year it counts down to February 29. The displayed date makes
        this explicit, so there is no ambiguity about which day is being counted toward.
      </p>

      <h2>The 31st and other month-end edge cases</h2>
      <p>
        February is not the only short month. April, June, September and November have 30 days,
        so a birth on the 31st has no anniversary in those months either. The convention is
        the same: the anniversary is the last day of the month. A birth on March 31 therefore
        has its April anniversary on April 30, its May anniversary on May 31, and so on.
        Without this clamping, the calculator would either produce negative days (a sign that
        the subtraction broke) or silently roll the date over into the next month, which
        miscounts the months.
      </p>
      <p>
        The effect on the displayed age is small — usually a day or two of difference from a
        naive calculation — but it is exactly the kind of small difference that matters when
        the question is "how old am I, exactly." The calculator does the anniversary counting
        properly so the answer is the same one a careful human would reach with a calendar.
      </p>

      <h2>Total counts: the unambiguous answer</h2>
      <p>
        The "years, months, days" breakdown is the format people expect, but it is not the
        only way to state an age, and it is not the most precise. Total days is exact: the
        number of 24-hour periods between the birth date and the reference date, with no
        ambiguity about month lengths or leap days. Total weeks divides that by seven. Total
        months is the years times twelve plus the months from the breakdown. All three measure
        the same span in different units, and the calculator shows all of them so you can pick
        the one that answers the question you are actually asking.
      </p>
      <p>
        The total-hours figure is included because it is a striking way to see a lifespan as a
        raw count: someone in their mid-thirties has lived roughly three hundred thousand
        hours. It is computed from total days times twenty-four, so it assumes whole days and
        does not account for the time of day of birth. For most purposes that is fine; the
        years-months-days breakdown is still the human-readable answer.
      </p>

      <h2>Why a birth date should stay on your device</h2>
      <p>
        A birth date is a small piece of information but a surprisingly powerful one. Combined
        with a name and a city it is often enough to identify a specific real person. Combined
        with other leaked data it is a key ingredient in identity theft and account-takeover
        attempts. Server-side age calculators get to log every birth date entered into them,
        and many do — either for analytics or because they never thought not to. Once a birth
        date is on a server it is out of your control: it can be sold, breached, or combined
        with other datasets without you ever finding out.
      </p>
      <p>
        The local alternative needs none of that. Age is a few date subtractions and a
        month-length lookup — nothing that requires a database or a round-trip. This
        calculator runs entirely in the browser tab, so the birth date never leaves the device
        and the page works the same with the network switched off as it does with it on. Load
        it once, disconnect, and it still works out your age correctly without noticing
        anything changed.
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
