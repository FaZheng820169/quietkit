import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

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

export function GpaCalculatorGuide() {
  useSeo({
    ...routeMeta('/guides/gpa-calculator-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Education"
      title="Calculate your GPA without sending grades to a server"
      lede="How the 4.0 grade point scale works, how credit hours weight your average, why plus and minus grades matter, and how to compute your GPA locally in the browser."
      updated="26 October 2026"
      toolTo="/tools/gpa-calculator"
      toolLabel="Open the GPA calculator"
    >
      <h2>GPA is a weighted average of your grades</h2>
      <p>
        Your grade point average is the single number that summarises how you performed across
        all your courses. It is not a simple average of your letter grades, because not every
        course counts the same. Each course contributes its grade point value multiplied by its
        credit hours, and the sum of those contributions is divided by the total number of
        credit hours. The result is a number on a 4.0 scale, where 4.0 is a perfect record and
        0.0 means every graded course was an F.
      </p>
      <p>
        To work it out by hand, start by converting each letter grade to its point value. On the
        standard scale an A is 4.0, a B is 3.0, a C is 2.0, a D is 1.0 and an F is 0.0. Then
        multiply each point value by the credits for that course and add them up. Divide that
        total by the sum of all the credits. For a 3-credit A and a 4-credit B the calculation
        is (4.0 × 3 + 3.0 × 4) ÷ (3 + 4) = 24 ÷ 7 = 3.43. The calculator does this arithmetic
        for you as soon as you enter each course.
      </p>

      <h2>Why credits change the weight</h2>
      <p>
        Credit hours are a rough measure of how much time a course is supposed to take each
        week. A 4-credit lecture meets for more hours and expects more outside work than a
        1-credit seminar, so it should count for more in the final average. If a 4-credit
        course and a 1-credit course both counted equally, a single low grade in a short
        elective would drag down your GPA as much as a poor performance in your major's core
        class. Weighting by credits prevents that.
      </p>
      <p>
        This is also why a high grade in a heavy course raises your GPA more than the same
        grade in a light one. An A in a 4-credit course contributes 16.0 points, while an A in
        a 1-credit course contributes only 4.0. When you are choosing which courses to focus
        on, the credit weighting is the reason that protecting your grade in a large lecture
        matters more than polishing a small lab.
      </p>

      <h2>The 4.0 scale, plus and minus</h2>
      <p>
        The most common scale gives A 4.0, A- 3.7, B+ 3.3, B 3.0, B- 2.7, C+ 2.3, C 2.0, C- 1.7,
        D+ 1.3, D 1.0, D- 0.7 and F 0.0. The plus and minus steps are each 0.3, except that A+
        is usually capped at 4.0 so a perfect record cannot exceed the top of the scale. A few
        institutions use a weighted A+ of 4.3 or higher, and some do not use plus and minus
        grades at all, so the number from any calculator should be checked against your
        school's official grading policy.
      </p>
      <p>
        The 0.3 steps mean that plus and minus grades do matter. A semester of A- grades gives
        a 3.7, not a 4.0, and a B+ gives 3.3 rather than 3.0. Over many courses these small
        differences add up, which is why students pay attention to the boundary between a B+
        and an A- even when the raw percentage difference is small. The calculator uses the
        standard 4.0 scale with +/- grades, so it matches the most common institution policy.
      </p>

      <h2>What to do with pass/fail and incomplete grades</h2>
      <p>
        Pass/fail courses are usually excluded from the GPA because they do not receive a
        letter grade. If your school assigns a numeric grade point to a pass — some do, some do
        not — enter that value; otherwise leave the course out entirely. Incompletes and
        withdrawals also normally do not affect the GPA, though the rules differ between
        schools, so it is worth checking your own transcript carefully. The calculator ignores
        any course with zero credits or an unrecognised grade, so it will not accidentally
        count a placeholder entry.
      </p>

      <h2>Why your grades should stay local</h2>
      <p>
        A list of courses and grades is not a medical record, but it is still identifying
        information. Combined with a rough location and a time of year, a set of courses can
        narrow down a specific student at a specific school, and that data is valuable to
        colleges, employers, insurers and advertisers. Server-side GPA calculators log every
        set of grades that passes through them, and those logs can be matched to other data
        later to build a profile of a real person.
      </p>
      <p>
        The local alternative needs none of that. The GPA calculation is simple arithmetic — a
        few multiplications, an addition and a division — and the whole thing finishes inside
        the tab without a single network request. Load the calculator once, switch off the
        Wi-Fi, and it still gives you the correct GPA, because the answer was always going to
        come from your own machine. Nothing is sent, nothing is stored, and the Network panel
        stays empty the whole time.
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
