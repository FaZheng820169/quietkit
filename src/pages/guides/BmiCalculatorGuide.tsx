import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'What is BMI and how is it calculated?',
    a: 'BMI (Body Mass Index) is weight divided by height squared. In metric units the formula is weight in kilograms divided by height in metres squared — for example, 70 kg divided by 1.75 m squared gives a BMI of 22.9. In imperial units the formula is 703 times weight in pounds divided by height in inches squared — for example, 150 lb divided by 67 in squared, times 703, gives a BMI of 23.5. Both formulas produce the same number for the same person.',
  },
  {
    q: 'What do the BMI categories mean?',
    a: 'The World Health Organisation defines four standard ranges. A BMI below 18.5 is underweight. From 18.5 up to 25 is normal weight. From 25 up to 30 is overweight. A BMI of 30 or above is obese. These boundaries are the same for both metric and imperial units because they apply to the BMI number itself, not to the inputs.',
  },
  {
    q: 'Can I use feet and inches instead of just inches?',
    a: 'Yes. In imperial mode you enter your height as feet and inches separately — for example, 5 feet and 7 inches. The calculator converts that to 67 inches internally before applying the imperial formula. If you already know your total height in inches you can enter it as 0 feet and the number of inches, but the feet-plus-inches input is usually easier.',
  },
  {
    q: 'Is BMI an accurate measure of health?',
    a: 'BMI is a simple screening tool, not a diagnosis. It does not distinguish between muscle and fat, so athletes with a lot of muscle can have a high BMI without being overweight, and older adults who have lost muscle can have a normal BMI while carrying excess fat. Waist measurement, body fat percentage and overall fitness give a fuller picture, and any concern about weight or health should be discussed with a healthcare professional.',
  },
  {
    q: 'Does the calculator store my height and weight?',
    a: 'No. The numbers you type live only in the memory of this browser tab while the page is open. There is no server, no account and no analytics event tied to your input. Close the tab and the numbers are gone — the privacy policy explains in detail.',
  },
]

export function BmiCalculatorGuide() {
  useSeo({
    ...routeMeta('/guides/bmi-calculator-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Health"
      title="Calculate BMI without a server"
      lede="What BMI actually measures, how the metric and imperial formulas differ, which category boundaries the WHO uses, and why your height and weight should never leave your device."
      updated="26 October 2026"
      toolTo="/tools/bmi-calculator"
      toolLabel="Open the BMI calculator"
    >
      <h2>BMI is weight divided by height squared</h2>
      <p>
        The formula for BMI is simple and identical everywhere: take your weight and divide it
        by your height squared. The only thing that changes between metric and imperial is the
        units you plug in, and the conversion factor that brings them onto the same scale. In
        metric you use kilograms and metres, so the formula is weight in kg divided by height
        in metres squared — for example, 70 kg divided by 1.75 m squared gives a BMI of 22.9.
      </p>
      <p>
        In imperial you use pounds and inches, and you multiply by 703 to convert the units so
        the result lands on the same BMI scale. For example, 150 lb divided by 67 inches
        squared, times 703, gives a BMI of 23.5. The 703 is not a magic number — it is the
        conversion from pounds per square inch to kilograms per square metre, compressed into
        one constant so you do not have to convert the inputs first. A person who weighs 70 kg
        and is 1.75 m tall has the same BMI as someone who weighs 154 lb and is 5 ft 9 in.
      </p>

      <h2>The four WHO categories</h2>
      <p>
        The World Health Organisation defines four standard BMI ranges that are used around the
        world. A BMI below 18.5 is classified as underweight. From 18.5 up to but not
        including 25 is normal weight. From 25 up to but not including 30 is overweight. A BMI
        of 30 or above is obese. These boundaries apply to the BMI number itself, so they are
        identical regardless of whether you calculated in metric or imperial. The calculator
        shows both your category and the numerical range it covers, so you can see exactly
        where you sit within it.
      </p>
      <p>
        The ranges are the same for adults of all ages and both sexes, which is part of what
        makes BMI useful as a quick screening tool — there is no separate table for men and
        women, and no age adjustment needed for adults. Children and adolescents use
        age- and sex-specific percentile charts instead, because their body composition changes
        as they grow.
      </p>

      <h2>What BMI tells you, and what it does not</h2>
      <p>
        BMI is a screening tool, not a diagnosis. It is useful for population-level research
        and for flagging individuals who may benefit from a closer look, but it has real
        limitations. The biggest one is that it does not distinguish between muscle and fat.
        Muscle is denser than fat, so a rugby forward or a weightlifter with a lot of muscle
        can have a BMI in the overweight range without carrying excess fat. Conversely, an
        older adult who has lost muscle mass can have a BMI in the normal range while carrying
        too much fat around the middle.
      </p>
      <p>
        For a fuller picture, clinicians look at waist measurement (which reflects abdominal
        fat), body fat percentage, blood pressure, cholesterol, blood sugar and overall
        fitness. BMI is a starting point, not the final word, and any real concern about
        weight or health is worth discussing with a healthcare professional who can look at
        the whole picture rather than a single number.
      </p>

      <h2>Why the imperial formula has a 703</h2>
      <p>
        If you have ever wondered where the 703 comes from, it is just unit conversion in one
        constant. BMI is defined as kilograms per metre squared. To get there from pounds and
        inches you convert pounds to kilograms (multiply by 0.453592) and inches to metres
        (multiply by 0.0254), then square the height. Working through the arithmetic, the
        conversion factor comes out to about 703 — specifically, 0.453592 divided by 0.0254
        squared is roughly 703.007. The calculator uses the standard 703 approximation, which
        is accurate to well within the rounding to one decimal place.
      </p>

      <h2>Why your height and weight should stay local</h2>
      <p>
        Height and weight seem harmless, but together they are surprisingly identifying.
        Combined with an IP address, a rough location and the time of day, two numbers can
        narrow a person down quite far — especially at the extremes of the range. Server-side
        BMI calculators log every pair of numbers that passes through them, and that log can
        be matched to other data later, or simply kept indefinitely.
      </p>
      <p>
        The local alternative needs none of that. BMI is a single division, and the whole
        calculation finishes inside the tab without a single network request. Load the
        calculator once, switch off the Wi-Fi, and it still tells you your BMI correctly —
        because the answer was always going to come from your own machine. Nothing is sent,
        nothing is stored, and the Network panel stays empty the whole time.
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
