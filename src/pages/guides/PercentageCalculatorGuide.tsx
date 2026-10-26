import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'What are the four percentage modes?',
    a: 'Most percentage questions are one of four shapes. "Of" asks what X percent of a number is — 15% of 200 is 30. "Is" asks what percentage one number is of another — 30 is 15% of 200. "Change" asks how much a value grew or shrank — from 200 to 230 is a 15% increase. "Reverse" asks what number a percentage refers back to — 15% of what is 30, and the answer is 200. Pick the mode that matches the question you are actually asking and the rest fills in.',
  },
  {
    q: 'How is percentage change calculated?',
    a: 'Percentage change is (new − old) divided by the absolute value of the old number, times 100. From 200 to 230 that is 30 divided by 200, or 15%. The absolute value in the denominator matters when the starting point is negative — a loss narrowing from −100 to −50 is a 50% improvement, not −50%. A positive result means an increase, a negative one a decrease, and zero means no change.',
  },
  {
    q: 'Why does the result say "—" sometimes?',
    a: 'Because some percentage questions have no answer. You cannot say what percentage something is of zero, and you cannot calculate a change from zero — both involve dividing by zero, which is undefined. The calculator shows "—" instead of a wrong number or a crash. If you meant a different question, switch modes; otherwise the input really has no percentage answer.',
  },
  {
    q: 'Can I use decimal percentages?',
    a: 'Yes. 7.5%, 0.1%, 33.333% and any other decimal work in every mode. The display rounds to a sensible number of places and trims trailing zeros, so 15.500% shows as 15.5% and 12.000% as 12%. The calculation itself keeps full precision internally.',
  },
  {
    q: 'Does the calculator store what I enter?',
    a: 'No. The numbers you type live only in the memory of this browser tab while the page is open. There is no server, no account and no analytics event tied to your input. Close the tab and the numbers are gone — the privacy policy explains in detail.',
  },
]

export function PercentageCalculatorGuide() {
  useSeo({
    ...routeMeta('/guides/percentage-calculator-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Everyday"
      title="Calculate percentages without a server"
      lede="Every percentage question is the same equation rearranged. Here are the four ways people actually ask it, the one formula behind all of them, how percentage change keeps its direction, and why the right answer is always a local calculation."
      updated="26 October 2026"
      toolTo="/tools/percentage-calculator"
      toolLabel="Open the percentage calculator"
    >
      <h2>One formula, four questions</h2>
      <p>
        A percentage is a fraction out of a hundred, and every percentage question is the same
        three-part equation with a different unknown. The core is
        <code> part = whole × rate / 100 </code>. If you know the rate and the whole, the part
        is the answer — "what is 15% of 200?" gives 30. If you know the part and the whole, the
        rate is the answer — "30 is what percent of 200?" gives 15%. If you know the rate and
        the part, the whole is the answer — "15% of what is 30?" gives 200. The fourth common
        question, percentage change, is the same idea applied to a before-and-after pair.
      </p>
      <p>
        Most people struggle less with the arithmetic than with knowing which question they are
        asking. A sale that says "20% off" is asking for the part — 20% of the original price.
        A report that says "sales grew 8%" is reporting a change. A headline that says "40% of
        voters" is giving you the part and the rate and asking for the whole. Picking the right
        mode is half the problem; the rest is a multiplication.
      </p>

      <h2>Percentage change and the sign</h2>
      <p>
        A change needs a direction as well as a size. The formula is
        <code> (new − old) / |old| × 100 </code>. Going from 200 to 230 gives a positive 15 — a
        15% increase. Going from 200 to 170 gives a negative 15 — a 15% decrease. The sign
        tells you which way you went, so you do not need a separate "increase or decrease"
        toggle, and a result of zero means no change at all.
      </p>
      <p>
        The absolute value around the old number matters when the starting point is negative.
        If a company's loss narrowed from −100 to −50, that is an improvement of 50%, not
        −50% — the denominator is the magnitude of the starting point, not the starting point
        itself. Without the absolute value the sign would flip and the change would look like a
        worsening, which is the opposite of what happened.
      </p>

      <h2>When the answer is no answer</h2>
      <p>
        Some percentage questions have no answer. "What percent of 0 is 5?" and "What is the
        percentage change from 0 to 50?" both involve dividing by zero, which is undefined
        rather than zero or infinity. A calculator that returns 0 in these cases is lying — it
        is telling you there is a percentage when there is not. A calculator that crashes is
        just badly built. The honest response is to say there is no answer, which is what this
        calculator does by showing "—".
      </p>
      <p>
        The reverse mode has its own edge case: "0% of what is 5?" has no answer either,
        because zero percent of anything is zero and can never equal five. Again the right
        answer is "no answer", not a wrong number. The point is not to be unhelpful; it is to
        tell the truth about which inputs actually have a percentage to compute.
      </p>

      <h2>Decimal percentages and precision</h2>
      <p>
        Percentages are not always whole numbers. A credit card might charge 1.5% per month, a
        statistical margin of error might be ±2.3%, and a financial growth rate might be
        0.1% per quarter. Any decimal percentage works in every mode — 7.5%, 0.1%, 33.333%.
        The calculation keeps full precision internally and rounds only for display, trimming
        trailing zeros so 15.500% shows as 15.5% and 12.000% as 12%.
      </p>
      <p>
        Large numbers get thousands separators for readability — 15% of 1,000,000 shows as
        150,000, not an unbroken string of digits. The separator is cosmetic only; the
        underlying number is exact. If you need more or fewer decimal places, the displayed
        precision is a display choice, not a limit on the calculation.
      </p>

      <h2>Why percentages should stay local</h2>
      <p>
        A percentage is a multiplication and a division. There is nothing to look up, nothing
        to verify against a database, nothing that benefits from running on someone else's
        machine. A server-side percentage calculator would add a network round-trip and a log
        of every calculation to a process that finishes before your finger lifts off the key.
        Worse, it would send whatever numbers you are working with — a salary, a tax bill, a
        test result — to a server that now has a record of them.
      </p>
      <p>
        The local alternative needs none of that. The arithmetic runs inside the tab, the
        numbers never leave the device, and the page works the same with the network switched
        off as it does with it on. Load the calculator once, pull the Wi-Fi, and 15% of 200 is
        still 30 — because the answer was always going to come from your own machine.
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
