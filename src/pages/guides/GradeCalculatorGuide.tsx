import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'How does the final exam calculator work?',
    a: 'It rearranges the weighted-grade formula. Your course grade is your current grade times its weight plus your final exam score times the final weight. If your current grade is 85, you want 90, and the final is worth 50%, then 85 × 0.5 + final × 0.5 = 90, so final = (90 − 42.5) ÷ 0.5 = 95. The calculator does this for you and also tells you whether the needed score is reachable (≤ 100%).',
  },
  {
    q: 'What is a weighted average?',
    a: 'A weighted average accounts for the fact that not every assignment counts the same. An exam worth 40% of your grade matters four times as much as a quiz worth 10%. To calculate it, multiply each grade by its weight percentage, add those products together, and divide by the total weight. If your weights sum to 100% the division is automatic; if they do not, the calculator still normalises by the total weight you entered.',
  },
  {
    q: 'Why does it say the score I need is over 100?',
    a: 'That means the target grade is not reachable with the remaining weight. If your current grade is 80, you want 90, and the final is worth 40%, you would need 105% on the final — impossible. You can either lower your target grade or accept that the maximum you can finish with is your current grade weighted plus 100% on the final. The calculator shows the number so you can see how far off you are.',
  },
  {
    q: 'Do the weights have to add up to 100%?',
    a: 'For the weighted average they do not have to. The calculator normalises by the total weight you enter, so if you only have grades for 50% of the course it will give you the average of what you have done so far. A note appears if the weights do not sum to 100%, so you know the number represents only part of the course.',
  },
  {
    q: 'Does the calculator store my grades?',
    a: 'No. The grades and weights you enter live only in the memory of this browser tab while the page is open. There is no server, no account and no analytics event tied to your input. Close the tab and the numbers are gone — the privacy policy explains in detail.',
  },
]

export function GradeCalculatorGuide() {
  useSeo({
    ...routeMeta('/guides/grade-calculator-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Education"
      title="Calculate grades without a server"
      lede="How the final-grade formula finds the exam score you need, how weighted averages work, what letter grades mean, and why your grades should never leave your device."
      updated="26 October 2026"
      toolTo="/tools/grade-calculator"
      toolLabel="Open the grade calculator"
    >
      <h2>The final exam formula</h2>
      <p>
        Your overall course grade is a weighted average: each component contributes its grade
        multiplied by its weight, and the components add up to 100% of the course. When you know
        your current grade, the grade you want and how much the final is worth, you can solve
        for the exam score you need. If your current grade is 85, you want 90, and the final is
        worth 50%, the equation is 85 × 0.5 + final × 0.5 = 90. Rearranging gives final =
        (90 − 42.5) ÷ 0.5 = 95, so you need 95% on the exam.
      </p>
      <p>
        The calculator rearranges this formula for you and also checks whether the answer is
        reachable. If your current grade is 80, you want 90, and the final is worth only 40%,
        the calculation gives (90 − 48) ÷ 0.4 = 105 — you would need 105% on the final, which
        is impossible. In that case the calculator flags the target as not reachable, so you
        can either lower your goal or see the maximum grade you can still achieve, which is
        your current grade weighted plus 100% on the final.
      </p>

      <h2>How weighted averages work</h2>
      <p>
        A simple average treats every number equally, but a course grade does not: an exam
        worth 40% counts four times as much as a quiz worth 10%. A weighted average corrects
        for this by multiplying each grade by its weight before averaging. For three
        assignments — 90 at 30%, 80 at 40%, and 70 at 30% — the calculation is
        (90 × 30 + 80 × 40 + 70 × 30) ÷ 100 = (2700 + 3200 + 2100) ÷ 100 = 80. The exam and the
        low quiz are given their proper importance rather than being treated as equals.
      </p>
      <p>
        The weights do not have to sum to 100% for the calculation to work. If you only have
        grades for the first half of the course, you can enter them and the calculator will
        divide by whatever total weight you entered, giving you the average of what you have
        completed so far. A note appears when the weights do not sum to 100%, so you know the
        number is partial and will change as you add more assignments.
      </p>

      <h2>Letter grades and thresholds</h2>
      <p>
        A percentage grade usually maps to a letter grade through a scale set by the instructor
        or institution. The most common scale in the United States is 90–100 for an A, 80–89
        for a B, 70–79 for a C, 60–69 for a D and below 60 for an F, but many schools use
        different thresholds, add plus and minus grades, or weight the boundaries differently.
        The calculator gives you the percentage; converting that to a letter means checking the
        scale specific to your course, which is usually in the syllabus.
      </p>

      <h2>What this calculator does not do</h2>
      <p>
        The calculator handles the two most common grade questions: what you need on the final
        and what your current weighted average is. It does not predict curves, extra credit,
        participation grades that are not yet assigned, or instructors who round at the end.
        Those depend on decisions your instructor has not made yet. It also does not convert
        between percentage and letter grades automatically, because the thresholds vary by
        school and course. Use the percentage as the precise number and map it to a letter
        using your own course scale.
      </p>

      <h2>Why your grades should stay local</h2>
      <p>
        Grades feel private even when they are not sensitive in a medical sense. A set of
        grades combined with a rough location and a time of year can narrow down a specific
        student at a specific school, and that information is valuable to colleges, employers
        and advertisers who would pay to know who is performing well or struggling. Server-side
        grade calculators log every set of grades that passes through them, and that log can
        be matched to other data later.
      </p>
      <p>
        The local alternative needs none of that. The formulas are simple arithmetic — a
        subtraction, a multiplication and a division — and the whole calculation finishes
        inside the tab without a single network request. Load the calculator once, switch off
        the Wi-Fi, and it still tells you exactly what you need on the final — because the
        answer was always going to come from your own machine. Nothing is sent, nothing is
        stored, and the Network panel stays empty the whole time.
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
